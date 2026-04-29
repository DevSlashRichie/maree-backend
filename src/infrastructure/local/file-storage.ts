import { join } from "node:path";
import { uuidv7 } from "uuidv7";
import { z } from "zod";
import type { FilesPort } from "@/domain/ports/files";

export const envLocalStorageSchema = z.object({
  LOCAL_STORAGE_PATH: z.string().min(1).default("./uploads"),
  LOCAL_STORAGE_BASE_URL: z
    .string()
    .min(1)
    .default("http://localhost:8383/v1/files"),
});

export class LocalFilesAdapter implements FilesPort {
  private readonly storagePath: string;
  private readonly baseUrl: string;

  constructor() {
    const env = envLocalStorageSchema.parse({
      LOCAL_STORAGE_PATH: process.env.LOCAL_STORAGE_PATH,
      LOCAL_STORAGE_BASE_URL: process.env.LOCAL_STORAGE_BASE_URL,
    });

    this.storagePath = env.LOCAL_STORAGE_PATH;
    this.baseUrl = env.LOCAL_STORAGE_BASE_URL;
  }

  async upload(
    file: Buffer,
    fileName: string,
    _mimeType: string,
  ): Promise<string> {
    const extension = fileName.split(".").pop();
    const fileId = `${uuidv7()}${extension ? `.${extension}` : ""}`;
    const path = join(this.storagePath, fileId);

    await Bun.write(path, file);

    console.log("path", path);

    return fileId;
  }

  async getDownloadUrl(fileId: string): Promise<string> {
    return `${this.baseUrl}/${fileId}`;
  }

  async delete(fileId: string): Promise<void> {
    const path = join(this.storagePath, fileId);
    await Bun.file(path).delete();
  }
}
