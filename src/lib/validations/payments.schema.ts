import { z } from "zod";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_FILE_TYPES = ["image/jpeg", "image/png", "application/pdf"];

export const paymentProofSchema = z.object({
  payment_method: z.enum(["MOMO", "MPESA", "BANK_TRANSFER"]),
  transaction_id: z.string().min(8, "Transaction ID must be at least 8 characters."),
  amount: z.coerce.number().positive("Amount must be greater than 0"),
  proof_file: z.any().optional().refine((file) => {
    if (!file) return true;
    return file.size <= MAX_FILE_SIZE;
  }, "File must be under 5MB.")
  .refine((file) => {
    if (!file) return true;
    return ACCEPTED_FILE_TYPES.includes(file.type);
  }, "Only JPG, PNG, and PDF files are accepted."),
}).superRefine((data, ctx) => {
  if (data.payment_method === "MOMO") {
    if (!/^[A-Z]{2}[0-9]{10,20}$/.test(data.transaction_id)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Enter a valid MoMo transaction ID (e.g., MP26040100001234).",
        path: ["transaction_id"]
      });
    }
  }
  
  if (data.payment_method === "BANK_TRANSFER") {
    if (!data.proof_file) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "File proof is required for bank transfers.",
        path: ["proof_file"]
      });
    }
  }
});

export type PaymentProofFormValues = z.infer<typeof paymentProofSchema>;
