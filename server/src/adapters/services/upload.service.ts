import { v2 as cloudinary } from 'cloudinary';
import { env } from '../../frameworks/config/env.js';
import streamifier from 'streamifier';

cloudinary.config({
  cloud_name: env.CLOUDINARY.CLOUD_NAME,
  api_key: env.CLOUDINARY.API_KEY,
  api_secret: env.CLOUDINARY.API_SECRET,
});

export const uploadBufferToCloudinary = (
  buffer: Buffer,
  folder = 'edentu/events',
  resourceType: 'auto' | 'image' | 'video' | 'raw' = 'auto'
) => {
  if (!buffer || buffer.length === 0) {
    throw new Error('Buffer cannot be empty');
  }

  if (buffer.length > 10 * 1024 * 1024) {
    throw new Error('File size exceeds 10MB limit');
  }

  return new Promise((resolve, reject) => {
    const upload = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: resourceType,
        allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'pdf', 'doc', 'docx'],
        timeout: 30000,
        format: resourceType === 'raw' ? undefined : 'auto',
      },
      (err, res) => {
        if (err) {
          console.error('Cloudinary upload failed:', err);
          return reject(new Error(`Upload failed: ${err.message}`));
        }
        if (!res) {
          return reject(new Error('No response from Cloudinary'));
        }
        resolve(res);
      }
    );

    upload.on('error', (error) => {
      console.error('Upload stream error:', error);
      reject(new Error('Upload stream failed'));
    });

    streamifier.createReadStream(buffer).pipe(upload);
  });
};

export const getCloudinaryResourceType = (mimetype: string): 'auto' | 'raw' => {
  if (mimetype === 'application/pdf') return 'raw';
  if (mimetype.includes('document')) return 'raw';
  return 'auto';
};

export const uploadEventFiles = async (files: Express.Multer.File[]) => {
  return await Promise.all(
    files.map(async (file) => {
      try {
        const resourceType = getCloudinaryResourceType(file.mimetype);
        const result: any = await uploadBufferToCloudinary(
          file.buffer,
          'edentu/events',
          resourceType
        );

        return {
          url: result.secure_url,
          public_id: result.public_id,
          filename: file.originalname,
          provider: 'cloudinary',
          size: file.size,
          type: file.mimetype,
          resource_type: result.resource_type,
          format: result.format,
        };
      } catch (error) {
        console.error(`Failed to upload ${file.originalname}:`, error);
        const errorMessage = error instanceof Error
          ? error.message
          : 'Unknown upload error';

        throw new Error(`Failed to upload ${file.originalname}: ${errorMessage}`);
      }
    })
  );
}

export const deleteFromCloudinary = async (publicId: string): Promise<void> => {
  try {
    await cloudinary.uploader.destroy(publicId);
    console.log(`Deleted file from Cloudinary: ${publicId}`);
  } catch (error) {
    console.error(`Failed to delete from Cloudinary: ${publicId}`, error);
  }
};