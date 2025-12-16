import {IsUUID, IsPositive} from 'class-validator';
export class TransferWalletDto {
  @IsUUID()
  senderId: string;

  @IsUUID()
  receiverId: string;

  @IsPositive()
  amount: number;
}