import { BlobServiceClient } from "@azure/storage-blob";
import { z } from "zod";
import { uuidv7 } from "uuidv7";
import type { FilesPort } from "@/domain/ports/files";

export const envAzureStorageSchema = z.object({
  AZURE_STORAGE_CONNECTION_STRING: z.string().min(1),
  AZURE_STORAGE_CONTAINER_NAME: z.string().min(1),
});

export class AzureBlobStorageAdapter implements FilesPort {
  private readonly containerName: string;
  private readonly blobServiceClient: BlobServiceClient;

  constructor() {
    const env = envAzureStorageSchema.parse({
      AZURE_STORAGE_CONNECTION_STRING:
        process.env.AZURE_STORAGE_CONNECTION_STRING,
      AZURE_STORAGE_CONTAINER_NAME: process.env.AZURE_STORAGE_CONTAINER_NAME,
    });

    this.containerName = env.AZURE_STORAGE_CONTAINER_NAME;
    this.blobServiceClient = BlobServiceClient.fromConnectionString(
      env.AZURE_STORAGE_CONNECTION_STRING,
    );
  }

  async upload(
    file: Buffer,
    fileName: string,
    mimeType: string,
  ): Promise<string> {
    const extension = fileName.split(".").pop();
    const newFileName = `${uuidv7()}${extension ? `.${extension}` : ""}`;

    const containerClient = this.blobServiceClient.getContainerClient(
      this.containerName,
    );
    const blockBlobClient = containerClient.getBlockBlobClient(newFileName);

    await blockBlobClient.uploadData(file, {
      blobHTTPHeaders: {
        blobContentType: mimeType,
      },
    });

    return newFileName;
  }

  async getDownloadUrl(fileId: string): Promise<string> {
    const containerClient = this.blobServiceClient.getContainerClient(
      this.containerName,
    );
    const blockBlobClient = containerClient.getBlockBlobClient(fileId);

    return blockBlobClient.url;
  }

  async delete(fileId: string): Promise<void> {
    const containerClient = this.blobServiceClient.getContainerClient(
      this.containerName,
    );
    const blockBlobClient = containerClient.getBlockBlobClient(fileId);

    await blockBlobClient.deleteIfExists();
  }
}
