import { Module } from '@nestjs/common';
import { UploadController } from './upload.controller';
import { MailingService } from 'src/mailing/mailing.service';

@Module({
  controllers: [UploadController],
  providers: [MailingService],
})
export class UploadModule {}
