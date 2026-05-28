-- Create product-images storage bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('product-images', 'product-images', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif'])
ON CONFLICT (id) DO NOTHING;

-- Grant public access to read from the bucket
CREATE POLICY "Public Access" ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'product-images');

-- Grant authenticated users to upload to the bucket
CREATE POLICY "Authenticated Upload" ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'product-images');

-- Grant authenticated users to update objects in the bucket
CREATE POLICY "Authenticated Update" ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'product-images')
WITH CHECK (bucket_id = 'product-images');

-- Grant authenticated users to delete objects from the bucket
CREATE POLICY "Authenticated Delete" ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'product-images');
