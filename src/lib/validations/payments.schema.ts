import { z } from "zod";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_FILE_TYPES = ["image/jpeg", "image/png", "application/pdf"];

export const paymentProofSchema = z.object({
  payment_method: z.enum(["MOMO", "MPESA", "BANK_TRANSFER"]),
  transaction_id: z.string().optional(),
  amount: z.coerce.number().positive("Amount must be greater than 0"),
  proof_file: z.any()
    .refine((file) => !!file, "A payment screenshot or receipt is required.")
    .refine((file) => !file || file.size <= MAX_FILE_SIZE, "File must be under 5MB.")
    .refine((file) => !file || ACCEPTED_FILE_TYPES.includes(file.type), "Only JPG, PNG, and PDF files are accepted."),
});

export type PaymentProofFormValues = z.infer<typeof paymentProofSchema>;
