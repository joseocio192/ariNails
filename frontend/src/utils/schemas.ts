import { z } from 'zod';
import type { RegisterFormData } from '../types/formTypes';

const nameRegex = /^[A-Za-zÀ-ÿ\s]+$/;

export const NameSchema = z
  .string()
  .min(1, 'Requerido')
  .max(50, 'Máximo 50 caracteres')
  .refine((v: string) => nameRegex.test(v), 'Solo letras y espacios');

export const UsernameSchema = z
  .string()
  .min(3, 'Mínimo 3 caracteres')
  .max(20, 'Máximo 20 caracteres')
  .regex(/^[a-zA-Z0-9_.-]+$/, 'Solo letras, números, guiones, guion bajo o punto');

export const EmailSchema = z
  .string()
  .min(1, 'Requerido')
  .max(100, 'Máximo 100 caracteres')
  .email('Formato de correo inválido')
  .refine((v: string) => v.indexOf(' ') === -1, 'No se permiten espacios');

export const PhoneSchema = z
  .string()
  .min(10, 'Numero inválido, debe tener al menos 10 digitos.')
  .max(10, 'Requerido')
  .refine((v: string | undefined) => !v || /^[0-9]{7,15}$/.test(v), 'Teléfono inválido (solo números)');

export const PasswordSchema = z
  .string()
  .min(6, 'La contraseña debe tener al menos 6 caracteres');

export const RegisterSchema = z.object({
  nombres: NameSchema,
  apellidoPaterno: NameSchema,
  apellidoMaterno: NameSchema.optional(),
  telefono: PhoneSchema.optional(),
  usuario: UsernameSchema,
  email: EmailSchema,
  password: PasswordSchema,
});

export type RegisterData = RegisterFormData;

export function mapZodErrors(err: z.ZodError) {
  const out: Record<string, string> = {};
  for (const e of err.issues) {
    const key = (e.path[0] as string) || '_';
    if (!out[key]) out[key] = e.message;
  }
  return out;
}

export function validateRegister(data: Partial<RegisterData>) {
  try {
    RegisterSchema.parse(data);
    return { valid: true, errors: {} } as const;
  } catch (e) {
    if (e instanceof z.ZodError) {
      return { valid: false, errors: mapZodErrors(e) } as const;
    }
    throw e;
  }
}