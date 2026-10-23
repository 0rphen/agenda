import { SchemaPath, validate } from '@angular/forms/signals';

interface ValidatorConfig {
  message?: string;
}

const PHONE = /^\+?[\d ]+$/;
const DNI_NIE = /^([XYZ]\d{7}|\d{8})([A-Z])$/;
const CONTROL_LETTERS = 'TRWAGMYFPDXBNJZSQVHLCKE';

function isPhone(value: string): boolean {
  const digits = value.replace(/\D/g, '').length;
  return PHONE.test(value) && digits >= 7 && digits <= 15;
}

function isDniNie(value: string): boolean {
  const match = DNI_NIE.exec(value.trim().toUpperCase());
  if (!match) return false;
  const number = Number(match[1].replace('X', '0').replace('Y', '1').replace('Z', '2'));
  return CONTROL_LETTERS[number % 23] === match[2];
}

export function phone(path: SchemaPath<string>, config?: ValidatorConfig): void {
  validate(path, ({ value }) =>
    !value() || isPhone(value()) ? undefined : { kind: 'phone', message: config?.message },
  );
}

export function dniNie(path: SchemaPath<string>, config?: ValidatorConfig): void {
  validate(path, ({ value }) =>
    !value() || isDniNie(value()) ? undefined : { kind: 'dniNie', message: config?.message },
  );
}
