import { Controller, Get, Body, Param, Post, Headers } from "@nestjs/common";
import type { Wallet } from './wallet.service';
import { WalletService } from "./wallet.service";
import { FundWalletDto } from "./dto/fund-wallet.dto";
import { TransferWalletDto } from "./dto/transfer-wallet.dto";

@Controller("wallet")
export class WalletController {
    constructor(private readonly walletService: WalletService) {}

    @Post()
    createWallet(): Wallet {
        return this.walletService.createWallet();
    }
    @Post("fund")
    fundWallet(@Body() body: FundWalletDto, @Headers('idempotency-key') idempotencyKey?: string): Wallet {
        return this.walletService.fundWallet(body.walletId, body.amount, idempotencyKey);
    }
    @Post("transfer")
    transferFunds(@Body() body: TransferWalletDto): Wallet {
        return this.walletService.transferFunds(body.senderId, body.receiverId, body.amount);
    }
    @Get(":id")
    getWallet(@Param("id") id: string): Wallet {
        return this.walletService.getWalletDetails(id);
    }
}