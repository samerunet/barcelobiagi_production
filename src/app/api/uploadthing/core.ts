import { createUploadthing, type FileRouter } from 'uploadthing/next';
import { z } from 'zod';

const f = createUploadthing();

export const uploadRouter = {
  productImageUploader: f({
    image: { maxFileSize: '8MB', maxFileCount: 6 },
  })
    .input(
      z
        .object({
          productId: z.string().optional(),
          customId: z.string().optional(),
        })
        .optional()
    )
    .middleware(async ({ input }) => {
      // TODO: replace with real auth; for now mark uploads as coming from admin.
      return { userId: 'admin', productId: input?.productId ?? null, customId: input?.customId ?? null };
    })
    .onUploadComplete(async ({ file, metadata }) => {
      return {
        fileKey: file.key,
        fileUrl: file.ufsUrl ?? file.url,
        productId: metadata.productId,
        uploadedBy: metadata.userId,
        customId: metadata.customId ?? null,
      };
    }),
} satisfies FileRouter;

export type UploadRouter = typeof uploadRouter;
