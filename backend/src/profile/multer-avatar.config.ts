import { BadRequestException } from '@nestjs/common';
import { MulterOptions } from '@nestjs/platform-express/multer/interfaces/multer-options.interface';
import { Request } from 'express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { User } from '../users/users.types';

const ALLOWED_MIME_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif']);

const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2 MB

export const avatarMulterOptions: MulterOptions = {
  storage: diskStorage({
    destination: 'uploads/avatars',
    filename: (req: Request, file, callback) => {
      const user = (req as Request & { user: User }).user;
      const ext = extname(file.originalname).toLowerCase();
      const filename = `${user.id}-${Date.now()}${ext}`;
      callback(null, filename);
    },
  }),
  fileFilter: (_req: Request, file, callback) => {
    if (!ALLOWED_MIME_TYPES.has(file.mimetype)) {
      callback(
        new BadRequestException('Only image files are allowed (jpeg, png, webp, gif)'),
        false,
      );
      return;
    }
    callback(null, true);
  },
  limits: {
    fileSize: MAX_FILE_SIZE,
  },
};
