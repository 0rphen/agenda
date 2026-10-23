import {
  FieldTree,
  MaxValidationError,
  MinValidationError,
  ValidationError,
} from '@angular/forms/signals';

const DEFAULT_MESSAGES: Record<string, string | ((error: ValidationError) => string)> = {
  required: 'Completa este campo',
  email: 'Escribe un correo válido, p. ej. nombre@dominio.es',
  min: (error) => `Escribe un número igual o mayor que ${(error as MinValidationError).min}`,
  max: (error) => `Escribe un número igual o menor que ${(error as MaxValidationError).max}`,
  phone: 'Escribe un teléfono válido, p. ej. +34 600 123 456',
  dniNie: 'Escribe un DNI o NIE válido, p. ej. 12345678Z',
};

export function fieldError(field: FieldTree<unknown>): string | undefined {
  const state = field();
  const [error] = state.errors();
  if (!state.touched() || !error) return undefined;
  if (error.message) return error.message;
  const fallback = DEFAULT_MESSAGES[error.kind] ?? 'Revisa este campo';
  return typeof fallback === 'string' ? fallback : fallback(error);
}
