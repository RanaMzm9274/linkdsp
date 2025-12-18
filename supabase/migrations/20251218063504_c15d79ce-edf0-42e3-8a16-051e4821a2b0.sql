-- Create storage bucket for application documents
INSERT INTO storage.buckets (id, name, public, file_size_limit)
VALUES ('application-documents', 'application-documents', false, 5242880)
ON CONFLICT (id) DO NOTHING;

-- RLS policies for application documents bucket
CREATE POLICY "Users can upload their own documents"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'application-documents' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can view their own documents"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'application-documents' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own documents"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'application-documents' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Admins can view all application documents"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'application-documents' 
  AND has_role(auth.uid(), 'admin'::app_role)
);