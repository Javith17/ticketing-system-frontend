export type FieldErrors<T extends string> = Partial<Record<T, string>>;

export const required = (value: string | undefined | null, label: string): string | undefined => {
  if (!value || !value.trim()) return `${label} is required`;
  return undefined;
};

export const minLength = (value: string, min: number, label: string): string | undefined => {
  if (value.trim().length < min) return `${label} must be at least ${min} characters`;
  return undefined;
};

export const isValidEmail = (value: string): boolean => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

export const email = (value: string, label = 'Email'): string | undefined => {
  if (!value.trim()) return `${label} is required`;
  if (!isValidEmail(value)) return `Enter a valid ${label.toLowerCase()}`;
  return undefined;
};

export const employeeCode = (value: string): string | undefined => {
  if (!value.trim()) return 'Employee code is required';
  if (!/^EMP-\d{3,6}$/i.test(value.trim())) return 'Format must be EMP-0000';
  return undefined;
};

export function hasErrors<T extends string>(errors: FieldErrors<T>): boolean {
  return Object.values(errors).some((v) => Boolean(v));
}
