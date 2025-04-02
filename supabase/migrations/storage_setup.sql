
-- Create storage buckets for the application
INSERT INTO storage.buckets (id, name, public, avif_autodetection)
VALUES 
  ('standard-uploads', 'Standard User Uploads', true, false),
  ('vip-uploads', 'VIP User Uploads', true, false),
  ('profile-images', 'Profile Images', true, false)
ON CONFLICT (id) DO NOTHING;

-- Set up public access policies for standard-uploads
CREATE POLICY "Public Access to standard-uploads" ON storage.objects
  FOR SELECT USING (bucket_id = 'standard-uploads');

-- Allow authenticated uploads to standard-uploads
CREATE POLICY "Authenticated users can upload to standard-uploads" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'standard-uploads' AND
    auth.role() = 'authenticated'
  );

-- Allow users to manage their own files in standard-uploads
CREATE POLICY "Users can manage their own files in standard-uploads" ON storage.objects
  FOR ALL USING (
    bucket_id = 'standard-uploads' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Set up public access policies for vip-uploads
CREATE POLICY "Public Access to vip-uploads" ON storage.objects
  FOR SELECT USING (bucket_id = 'vip-uploads');

-- Allow authenticated uploads to vip-uploads
CREATE POLICY "Authenticated users can upload to vip-uploads" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'vip-uploads' AND
    auth.role() = 'authenticated'
  );

-- Allow users to manage their own files in vip-uploads
CREATE POLICY "Users can manage their own files in vip-uploads" ON storage.objects
  FOR ALL USING (
    bucket_id = 'vip-uploads' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Set up public access policies for profile-images
CREATE POLICY "Public Access to profile-images" ON storage.objects
  FOR SELECT USING (bucket_id = 'profile-images');

-- Allow authenticated uploads to profile-images
CREATE POLICY "Authenticated users can upload to profile-images" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'profile-images' AND
    auth.role() = 'authenticated'
  );

-- Allow users to manage their own profile pictures
CREATE POLICY "Users can manage their own profile images" ON storage.objects
  FOR ALL USING (
    bucket_id = 'profile-images' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );
