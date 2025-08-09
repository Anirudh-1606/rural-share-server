// src/modules/aws/s3.service.ts
import { Injectable } from '@nestjs/common';
import { S3Client, PutObjectCommand, CreateSessionCommand } from '@aws-sdk/client-s3';
import { ConfigService } from '@nestjs/config';
import { v4 as uuid } from 'uuid';

@Injectable()
export class S3Service {
  private readonly s3Client: S3Client;
  private readonly bucketName: string;
  private readonly region: string;
  private readonly azId: string;

  constructor(private readonly configService: ConfigService) {
    this.region = this.configService.get<string>('AWS_REGION');
    this.azId = this.configService.get<string>('AWS_S3_AZ_ID');
    this.bucketName = this.configService.get<string>('AWS_S3_BUCKET_NAME');
    
    this.s3Client = new S3Client({
      region: this.region,
      credentials: {
        accessKeyId: this.configService.get<string>('AWS_ACCESS_KEY_ID'),
        secretAccessKey: this.configService.get<string>('AWS_SECRET_ACCESS_KEY'),
      },
      // Important: Use the S3 Express endpoint
      endpoint: `https://s3express-${this.azId}.${this.region}.amazonaws.com`,
    });
  }

  async uploadFile(file: Express.Multer.File, folder: string) {
    const key = `${folder}/${uuid()}-${file.originalname}`;
    
    try {
      // For S3 Express One Zone, you might need to create a session first
      // Uncomment if needed:
      // const sessionCommand = new CreateSessionCommand({
      //   Bucket: this.bucketName,
      // });
      // await this.s3Client.send(sessionCommand);

      const command = new PutObjectCommand({
        Bucket: this.bucketName,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype,
      });
      
      console.log("Uploading to S3 Express One Zone:");
      console.log("Key:", key);
      console.log("Bucket:", this.bucketName);
      console.log("Region:", this.region);
      console.log("AZ ID:", this.azId);

      const response = await this.s3Client.send(command);
      console.log("Upload successful:", response.$metadata.httpStatusCode);

      // Correct URL format for S3 Express One Zone
      return `https://${this.bucketName}.s3express-${this.azId}.${this.region}.amazonaws.com/${key}`;
    } catch (error) {
      console.error('S3 Express Upload Error:', {
        message: error.message,
        code: error.Code,
        statusCode: error.$metadata?.httpStatusCode,
        requestId: error.$metadata?.requestId,
      });
      
      // If it's an access denied error, it might be due to missing session
      if (error.Code === 'AccessDenied') {
        console.error('Hint: Check if you have s3express:CreateSession permission');
      }
      
      throw error;
    }
  }

  // Helper method to test S3 Express access
  async testAccess() {
    try {
      const sessionCommand = new CreateSessionCommand({
        Bucket: this.bucketName,
      });
      const response = await this.s3Client.send(sessionCommand);
      console.log('S3 Express session created successfully');
      return true;
    } catch (error) {
      console.error('Cannot create S3 Express session:', error.message);
      return false;
    }
  }
}