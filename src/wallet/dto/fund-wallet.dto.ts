import {IsUUID, IsPositive} from 'class-validator';
export class FundWalletDto {
  @IsUUID('4')
  walletId: string;

  @IsPositive()
  amount: number;
}