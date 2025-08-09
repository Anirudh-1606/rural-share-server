// src/modules/aws/s3.service.ts
import { Injectable } from '@nestjs/common';
import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { ConfigService } from '@nestjs/config';
import { v4 as uuid } from 'uuid';

@Injectable()
export class S3Service {
  private readonly s3Client: S3Client;
  private readonly bucketName: string;
  private readonly region: string;
  private readonly azId: string;
  private urlCache = new Map<string, { url: string; expires: number }>();

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
      endpoint: `https://s3express-${this.azId}.${this.region}.amazonaws.com`,
    });
  }

  async uploadFile(file: Express.Multer.File, folder: string): Promise<string> {
    const key = `${folder}/${uuid()}-${file.originalname.replace(/\s+/g, '-')}`;
    
    const command = new PutObjectCommand({
      Bucket: this.bucketName,
      Key: key,
      Body: file.buffer,
      ContentType: file.mimetype,
    });
    
    console.log("Uploading to S3 Express One Zone:");
    console.log("Key:", key);
    console.log("Bucket:", this.bucketName);

    await this.s3Client.send(command);
    
    // Return only the S3 key, not the URL
    return key;
  }

  async getPresignedUrl(key: string, expiresIn: number = 3600): Promise<string> {
    // Check cache first
    const cached = this.urlCache.get(key);
    const now = Date.now();
    
    if (cached && cached.expires > now) {
      console.log(`Returning cached URL for ${key}`);
      return cached.url;
    }

    // Generate new pre-signed URL
    const command = new GetObjectCommand({
      Bucket: this.bucketName,
      Key: key,
    });

    const url = await getSignedUrl(this.s3Client, command, { expiresIn });
    
    // Cache the URL (expire 5 minutes before actual expiration for safety)
    const cacheExpiry = now + (expiresIn - 300) * 1000;
    this.urlCache.set(key, {
      url,
      expires: cacheExpiry,
    });

    // Clean up old cache entries if cache gets too large
    if (this.urlCache.size > 1000) {
      this.cleanupCache();
    }

    console.log(`Generated new pre-signed URL for ${key}, expires in ${expiresIn}s`);
    return url;
  }

  async getPresignedUrls(keys: string[]): Promise<Record<string, string>> {
    const urls: Record<string, string> = {};
    
    await Promise.all(
      keys.map(async (key) => {
        if (key) {
          urls[key] = await this.getPresignedUrl(key);
        }
      })
    );
    
    return urls;
  }

  private cleanupCache() {
    const now = Date.now();
    let cleaned = 0;
    
    for (const [key, value] of this.urlCache.entries()) {
      if (value.expires < now) {
        this.urlCache.delete(key);
        cleaned++;
      }
    }
    
    console.log(`Cleaned ${cleaned} expired URLs from cache`);
  }
}