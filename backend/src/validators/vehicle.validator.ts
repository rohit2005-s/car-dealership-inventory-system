import { z } from 'zod';

export const vehicleSchema = z.object({
  make: z.string().min(1, 'Make is required'),
  model: z.string().min(1, 'Model is required'),
  category: z.string().min(1, 'Category is required'),
  price: z.number().positive('Price must be greater than 0'),
  quantity: z.number().int().nonnegative('Quantity cannot be negative'),
  imageUrl: z.string().url().optional(),
});

export const vehicleUpdateSchema = vehicleSchema.partial();

export const vehicleSearchSchema = z.object({
  make: z.string().optional(),
  model: z.string().optional(),
  category: z.string().optional(),
  minPrice: z.coerce.number().nonnegative().optional(),
  maxPrice: z.coerce.number().positive().optional(),
});

export const restockSchema = z.object({
  amount: z.number().int().positive('Restock amount must be greater than 0'),
});

export type VehicleSchemaType = z.infer<typeof vehicleSchema>;
