/* eslint-disable @typescript-eslint/no-unused-vars */
import { ISendMailOptions, MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { google } from 'googleapis';
import { Options } from 'nodemailer/lib/smtp-transport';
import { UploadDto } from 'src/upload/upload.dto';

@Injectable()
export class MailingService {
  constructor(
    private readonly configService: ConfigService,
    private readonly mailerServices: MailerService,
  ) {}

  private async setTransport() {
    const OAuth2 = google.auth.OAuth2;
    const oauth2Client = new OAuth2(
      this.configService.get('CLIENT_ID'),
      this.configService.get('CLIENT_SECRET'),
      'https://developers.google.com/oauthplayground',
    );

    oauth2Client.setCredentials({
      refresh_token: process.env.REFRESH_TOKEN,
    });
    console.log('refresh_token: ', process.env.REFRESH_TOKEN);
    const accessToken: string = await new Promise((resolve, reject) => {
      oauth2Client.getAccessToken((err, token) => {
        if (err) {
          // console.log('error =========== ', err);
          reject('Hubo un error al generar el token');
        }
        resolve(token);
        // console.log('token', token);
      });
    });

    const signedEmail: Options = {
      service: 'gmail',
      auth: {
        type: 'OAuth2',
        user: this.configService.get('EMAIL'),
        clientId: this.configService.get('CLIENT_ID'),
        clientSecret: this.configService.get('CLIENT_SECRET'),
        accessToken,
      },
      tls: {
        rejectUnauthorized: false
      }
    };
    this.mailerServices.addTransporter('gmail', signedEmail);
  }

  async envioEmail(inUploadDto: UploadDto) {
    console.log('************ UploadDTO ************', inUploadDto['json']);
    let uploadDto = JSON.parse(inUploadDto['json']);
    await this.setTransport();
    let firmaEnvioCorreo: ISendMailOptions = {
      transporterName: 'gmail',
      to: uploadDto.receiver,
      from: process.env.EMAIL,
      subject: uploadDto.subject,
      template: uploadDto.template,
      context: {
        variableEj: uploadDto.description,
      },
    };
    if (uploadDto.file !== undefined) {
      firmaEnvioCorreo = {
        ...firmaEnvioCorreo,
        attachments: [
          {
            filename: uploadDto.file.filename,
            contentTransferEncoding: '7bit',
            content: uploadDto.file.buffer,
          },
        ],
      };
    }
    return await this.mailerServices.sendMail(firmaEnvioCorreo);
  }
}
