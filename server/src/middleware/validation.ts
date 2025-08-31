import type{ Request, Response, NextFunction } from 'express';
import { z } from 'zod';

export const validateRequest = (schema: z.ZodSchema) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          error: 'Validation failed',
          details: error.errors,
        });
      }
      next(error);
    }
  };
};

// Common validation schemas
export const authSchemas = {
  register: z.object({
    body: z.object({
      email: z.string().email(),
      username: z.string().min(3).max(30),
      password: z.string().min(6),
    }),
  }),

  login: z.object({
    body: z.object({
      email: z.string().email(),
      password: z.string(),
    }),
  }),
};

export const movieSchemas = {
  search: z.object({
    query: z.object({
      query: z.string().min(1),
      page: z.string().optional().transform(val => parseInt(val || '1')),
    }),
  }),

  movieId: z.object({
    params: z.object({
      movieId: z.string(),
    }),
  }),
};

export const reviewSchemas = {
  create: z.object({
    body: z.object({
      rating: z.number().min(1).max(10),
      text: z.string().optional(),
    }),
    params: z.object({
      movieId: z.string(),
    }),
  }),
};
