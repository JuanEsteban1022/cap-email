export interface UploadDto {
  receiver: string;
  description: string;
  subject: string;
  template: string;
  file?: Express.Multer.File;
  // json: {}string;
}
