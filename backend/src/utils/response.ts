// src/utils/response.ts
import { Response } from 'express';

export function sendSuccess(res: Response, data: any = {}, message: string = 'Success', statusCode: number = 200) {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
    errors: []
  });
}

export function sendError(res: Response, errors: any[] = [], message: string = 'Error occurred', statusCode: number = 500) {
  return res.status(statusCode).json({
    success: false,
    message,
    data: null,
    errors
  });
}
