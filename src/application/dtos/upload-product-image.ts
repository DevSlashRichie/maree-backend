import z from "zod";

export const UploadProductImageResponseDto = z.object({
  url: z.string().url(),
});
