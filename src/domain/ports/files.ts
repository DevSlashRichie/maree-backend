export interface FilesPort {
  upload(file: Buffer, fileName: string, mimeType: string): Promise<string>;
  getDownloadUrl(fileId: string): Promise<string>;
  delete(fileId: string): Promise<void>;
}
