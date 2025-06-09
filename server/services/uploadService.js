import multer from 'multer';
import sharp from 'sharp';
import path from 'path';
import fs from 'fs';
import { ValidationError } from '../utils/errors.js';
import config from '../config/config.js';
import logger from '../utils/logger.js';

// Create uploads directory if it doesn't exist
const uploadDir = config.upload.uploadDir;
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// File filter
const fileFilter = (req, file, cb) => {
  if (config.upload.allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new ValidationError('Invalid file type. Only JPEG, PNG and GIF are allowed.'), false);
  }
};

// Configure multer upload
export const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: config.upload.maxFileSize
  }
});

// Process and optimize image
export const processImage = async (file) => {
  try {
    const filename = path.basename(file.path);
    const processedFilename = `processed-${filename}`;
    const processedPath = path.join(uploadDir, processedFilename);

    // Process image with sharp
    await sharp(file.path)
      .resize(800, 800, { // Max dimensions
        fit: 'inside',
        withoutEnlargement: true
      })
      .jpeg({ quality: 80 }) // Convert to JPEG with 80% quality
      .toFile(processedPath);

    // Delete original file
    fs.unlinkSync(file.path);

    return {
      filename: processedFilename,
      path: processedPath,
      size: fs.statSync(processedPath).size,
      mimetype: 'image/jpeg'
    };
  } catch (error) {
    logger.error('Image processing error:', error);
    throw new Error('Failed to process image');
  }
};

// Delete file
export const deleteFile = async (filename) => {
  try {
    const filePath = path.join(uploadDir, filename);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  } catch (error) {
    logger.error('File deletion error:', error);
    throw new Error('Failed to delete file');
  }
};

// Validate file size
export const validateFileSize = (file) => {
  if (file.size > config.upload.maxFileSize) {
    throw new ValidationError(`File size exceeds maximum limit of ${config.upload.maxFileSize / (1024 * 1024)}MB`);
  }
};

// Validate file type
export const validateFileType = (file) => {
  if (!config.upload.allowedTypes.includes(file.mimetype)) {
    throw new ValidationError('Invalid file type. Only JPEG, PNG and GIF are allowed.');
  }
}; 