import { IsMongoId, IsOptional } from 'class-validator';

export class CreateConversationDto {
  @IsMongoId()
  participantId: string; // The other user's ID (current user will be added automatically)

  @IsMongoId()
  @IsOptional()
  relatedOrderId?: string;
}
