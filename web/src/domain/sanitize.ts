export function sanitizeYearFoundation(year: number | null | undefined): number | null {
  if (year === null || year === undefined) return null;
  if (year === 0 || year === 20) return null;
  return year;
}

export function sanitizeCity(city: string | null | undefined): string | null {
  if (city === null || city === undefined) return null;
  const trimmed = city.trim();
  if (trimmed === '' || trimmed.toLowerCase() === 'brazil') return null;
  return trimmed;
}

export function sanitizeLanguage(language: string | null | undefined): string | null {
  if (language === null || language === undefined) return null;
  const trimmed = language.trim();
  if (trimmed === '' || trimmed.toLowerCase() === 'outros') return null;
  return trimmed;
}

export function normalizeCensusTaker(value: unknown): string | null {
  if (value === null || value === undefined) return null;
  if (typeof value === 'string') {
    const trimmed = value.trim();
    return trimmed === '' ? null : trimmed;
  }
  if (typeof value === 'object') {
    const obj = value as Record<string, unknown>;
    const candidate = obj.fullname ?? obj.fullName ?? obj.name ?? obj.censusTakerFullname ?? obj.id;
    if (candidate === null || candidate === undefined) return null;
    const str = String(candidate).trim();
    return str === '' ? null : str;
  }
  const str = String(value).trim();
  return str === '' ? null : str;
}

export const NOT_INFORMED = 'não informado';