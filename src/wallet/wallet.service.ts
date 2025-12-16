import { Injectable, NotFoundException, BadRequestException } from "@nestjs/common";
import { v4 as uuidv4 } from 'uuid';

export interface   Transaction {
    id: string;
    type: "credit" | "debit"| "transfer";
    amount: number;
    toWalletId?: string;
    createdAt: Date;
}

export interface Wallet {
    id: string;
    balance: number;
    currency: "USD"
    transactions: Transaction[];
}

// For in-memory idempotency storage
interface IdempotencyRecord {
    key?: string;
    walletId: string;
    amount: number;
    result: Wallet;
  }

@Injectable()
export class WalletService {
    private wallets: Wallet [] = [];
    private idempotencyKeys: IdempotencyRecord[] = [];

    // Create a new wallet
    createWallet(): Wallet {
        const newWallet: Wallet = {
            id: uuidv4(),
            balance: 0,
            currency: "USD",
            transactions: [],
        };
        this.wallets.push(newWallet);
        return newWallet;
    }

    // Fund an existing wallet with idempotency
    fundWallet(walletId: string, amount: number, idempotencyKey?: string): Wallet {
        const wallet = this.wallets.find(w => w.id === walletId);
        if(!wallet) {
            throw new NotFoundException("Wallet not found");
        }

        if (amount <= 0) {
            throw new BadRequestException("Amount must be positive");
        }

        let existing: IdempotencyRecord | undefined;

        // check with idempotency keys
        if (idempotencyKey) {
            existing = this.idempotencyKeys.find(
                k => k.key === idempotencyKey && k.walletId === walletId && k.amount === amount)
        }
        if (existing) {
            return existing.result;
        }

        // Perform funding
        const transactions = {
            id: uuidv4(),
            type: "credit" as const,
            amount,
            createdAt: new Date(),
        };

        wallet.balance += amount;
        wallet.transactions.push(transactions);

        // Store idempotency record
        if (idempotencyKey) {
            this.idempotencyKeys.push({
                key: idempotencyKey,
                walletId,
                amount,
                result: { ...wallet, transactions: [...wallet.transactions] },
            });
        }

        return wallet;
    }

    // Transfer funds between wallets
    transferFunds(senderId: string, receiverId: string, amount: number) {
        const senderWallet = this.wallets.find(w => w.id === senderId);
        const receiverWallet = this.wallets.find(w => w.id === receiverId);

        if (!senderWallet) {
            throw new NotFoundException("Sender wallet not found");
        }
        if (!receiverWallet) {
            throw new NotFoundException("Receiver wallet not found");
        }
        if (amount <= 0) {
            throw new BadRequestException("Amount must be positive");
        }
        if (senderWallet.balance < amount) {
            throw new BadRequestException("Insufficient funds in sender's wallet");
        }

        senderWallet.balance -= amount;
        receiverWallet.balance += amount;

        const transactionId = uuidv4();

        senderWallet.transactions.push({
            id: transactionId,
            type: "debit",
            amount,
            toWalletId: receiverId,
            createdAt: new Date(),
        });

        receiverWallet.transactions.push({
            id: transactionId,
            type: "credit",
            amount,
            createdAt: new Date(),
        });
        return senderWallet;

    }

    // Get wallet details
    getWalletDetails(walletId: string): Wallet {
        const wallet =  this.wallets.find(w => w.id === walletId);
        if (!wallet) {
            throw new NotFoundException("Wallet not found");
        }
        return wallet;
    }
}
