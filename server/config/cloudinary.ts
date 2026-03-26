import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const uploadToCloudinary = (
  fileBuffer: Buffer,
  options: { folder?: string; resource_type?: string } = {}
): Promise<any> => {
  return new Promise((resolve, reject) => {
    const uploadOptions = {
      folder: options.folder || 'portfolio',
      resource_type: (options.resource_type || 'auto') as any,
    };
    const stream = cloudinary.uploader.upload_stream(uploadOptions, (error, result) => {
      if (error) return reject(error);
      resolve(result);
    });
    stream.end(fileBuffer);
  });
};

export const deleteFromCloudinary = (publicId: string) => {
  return cloudinary.uploader.destroy(publicId);
};

export default cloudinary;
