/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  Body,
  Controller,
  Inject,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { UploadDto } from './upload.dto';
import { MailingService } from 'src/mailing/mailing.service';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('upload')
export class UploadController {
  // constructor(private configService: ConfigService){}
  @Inject(MailingService)
  private readonly mailingService: MailingService;

  @Post('conector/upload')
  @UseInterceptors(FileInterceptor('file'))
  async cargaFirmaEmail(
    @UploadedFile() file: Express.Multer.File,
    @Body() uploadDto: UploadDto,
  ) {
    uploadDto.file = file;
    console.log('============================================', uploadDto);
    const response = await this.mailingService.envioEmail(uploadDto);
    console.log('response: ', response);
  }
}
