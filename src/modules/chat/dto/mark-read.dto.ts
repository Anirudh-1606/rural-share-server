import { IsMongoId, IsArray, IsOptional } from 'class-validator';

export class MarkReadDto {
  @IsMongoId()
  conversationId: string;

  @IsArray()
  @IsMongoId({ each: true })
  @IsOptional()
  messageIds?: string[]; // If not provided, mark all as read
}
