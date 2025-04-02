
-- Create storage buckets for different user types and profile images
INSERT INTO storage.buckets (id, name, public)
VALUES 
  ('standard-uploads', 'Standard User Uploads', true),
  ('vip-uploads', 'VIP User Uploads', true),
  ('profile-images', 'User Profile Images', true)
ON CONFLICT (id) DO NOTHING;

-- Create RLS policies for standard uploads
CREATE POLICY "Standard users can view their own uploads"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'standard-uploads' AND 
  (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Standard users can upload their own files"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'standard-uploads' AND 
  (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Standard users can update their own files"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'standard-uploads' AND 
  (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Standard users can delete their own files"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'standard-uploads' AND 
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Create RLS policies for VIP uploads
CREATE POLICY "VIP users can view their own uploads"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'vip-uploads' AND 
  (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "VIP users can upload their own files"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'vip-uploads' AND 
  (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "VIP users can update their own files"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'vip-uploads' AND 
  (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "VIP users can delete their own files"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'vip-uploads' AND 
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Create RLS policies for profile images
CREATE POLICY "Users can view profile images"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'profile-images');

CREATE POLICY "Users can upload their own profile image"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'profile-images' AND 
  POSITION(auth.uid()::text IN name) > 0
);

CREATE POLICY "Users can update their own profile image"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'profile-images' AND 
  POSITION(auth.uid()::text IN name) > 0
);

CREATE POLICY "Users can delete their own profile image"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'profile-images' AND 
  POSITION(auth.uid()::text IN name) > 0
);

-- Allow public access to profile images for viewing
CREATE POLICY "Public can view profile images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'profile-images');

-- Allow public access to standard uploads for viewing
CREATE POLICY "Public can view standard uploads"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'standard-uploads');

-- Allow public access to VIP uploads for viewing
CREATE POLICY "Public can view VIP uploads"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'vip-uploads');
