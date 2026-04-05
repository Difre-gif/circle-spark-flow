import { supabase } from '@/integrations/supabase/client';

export async function validateFile(file: File): Promise<void> {
  // Validate size
  if (file.size > 5_242_880) {
    throw new Error('File must be under 5MB. Try compressing your screenshot.');
  }

  // Validate MIME via magic bytes
  const buffer = await file.slice(0, 4).arrayBuffer();
  const bytes = new Uint8Array(buffer);
  const isJpeg = bytes[0] === 0xFF && bytes[1] === 0xD8;
  const isPng = bytes[0] === 0x89 && bytes[1] === 0x50;
  const isPdf = bytes[0] === 0x25 && bytes[1] === 0x50;

  if (!isJpeg && !isPng && !isPdf) {
    throw new Error('Only JPG, PNG, or PDF files are accepted.');
  }
}

export async function uploadPaymentProof(file: File, orgId: string): Promise<string> {
  await validateFile(file);

  const buffer = await file.slice(0, 4).arrayBuffer();
  const bytes = new Uint8Array(buffer);
  const isJpeg = bytes[0] === 0xFF && bytes[1] === 0xD8;
  const isPng = bytes[0] === 0x89 && bytes[1] === 0x50;
  const ext = isJpeg ? 'jpg' : isPng ? 'png' : 'pdf';
  const uuid = crypto.randomUUID();
  const path = `${orgId}/${uuid}.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from('payment-proofs')
    .upload(path, file, { contentType: file.type });

  if (uploadError) throw uploadError;

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('file_attachments')
    .insert({
      org_id: orgId,
      uploaded_by: user.id,
      bucket: 'payment-proofs',
      file_path: `payment-proofs/${path}`,
      original_filename: file.name,
      mime_type: file.type,
      size_bytes: file.size,
    })
    .select('id')
    .single();

  if (error) throw error;
  return data.id;
}
