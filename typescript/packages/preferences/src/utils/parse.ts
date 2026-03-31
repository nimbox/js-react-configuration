import type { PreferenceProperty } from '../generated/types';

export interface ParseIssue {
  readonly code?: string;
  readonly input?: unknown;
  readonly path: PropertyKey[];
  readonly message: string;
}

export class ParseError extends Error {

  readonly issues: ParseIssue[];

  constructor(issues: ParseIssue[]) {
    super(issues[0]?.message ?? 'Parse failed');
    this.name = 'ParseError';
    this.issues = issues;
  }

}

export type ParsePropertyValue = (property: PreferenceProperty, value: unknown) => unknown;

export type ParseSafeResult =
  | { success: true; data: unknown }
  | { success: false; error: ParseError };

export function isParseError(error: unknown): error is ParseError {
  return error instanceof ParseError;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export const parse: ParsePropertyValue = (property, value) => {

  const parseResult = parseSafe(property, value);
  if (!parseResult.success) {
    throw parseResult.error;
  }

  return parseResult.data;

};

export function parseSafe(property: PreferenceProperty, value: unknown): ParseSafeResult {

  if (property.type === 'boolean') {
    return { success: true, data: Boolean(value) };
  }

  if (property.type === 'number') {

    const text = String(value ?? '').trim();
    if (!text) {
      return {
        success: false,
        error: new ParseError([
          { code: 'number-required', input: value, path: [], message: 'validation.number.required' }
        ])
      };
    }

    const parsed = Number(text);
    if (!Number.isFinite(parsed)) {
      return {
        success: false,
        error: new ParseError([
          { code: 'number-invalid', input: value, path: [], message: 'validation.number.invalid' }
        ])
      };
    }

    if (typeof property.minimum === 'number' && parsed < property.minimum) {
      return {
        success: false,
        error: new ParseError([
          {
            code: 'number-minimum',
            input: parsed,
            path: [],
            message: 'validation.number.minimum'
          }
        ])
      };
    }

    if (typeof property.maximum === 'number' && parsed > property.maximum) {
      return {
        success: false,
        error: new ParseError([
          {
            code: 'number-maximum',
            input: parsed,
            path: [],
            message: 'validation.number.maximum'
          }
        ])
      };
    }

    return { success: true, data: parsed };

  }

  if (property.type === 'string') {

    const parsed = String(value ?? '');
    if (typeof property.minLength === 'number' && parsed.length < property.minLength) {
      return {
        success: false,
        error: new ParseError([
          {
            code: 'string-min-length',
            input: parsed,
            path: [],
            message: 'validation.string.minLength'
          }
        ])
      };
    }

    if (typeof property.maxLength === 'number' && parsed.length > property.maxLength) {
      return {
        success: false,
        error: new ParseError([
          {
            code: 'string-max-length',
            input: parsed,
            path: [],
            message: 'validation.string.maxLength'
          }
        ])
      };
    }

    if (property.pattern) {
      let regex: RegExp | null = null;
      try {
        regex = new RegExp(property.pattern);
      } catch {
        regex = null;
      }
      if (regex && !regex.test(parsed)) {
        return {
          success: false,
          error: new ParseError([
            {
              code: 'string-pattern',
              input: parsed,
              path: [],
              message: String(property.patternErrorMessage || 'validation.string.pattern')
            }
          ])
        };
      }
    }

    return { success: true, data: parsed };

  }

  if (property.type === 'object') {

    try {

      const parsed = JSON.parse(String(value ?? ''));
      if (!isRecord(parsed)) {
        return {
          success: false,
          error: new ParseError([
            { code: 'object-invalid', input: parsed, path: [], message: 'validation.object.requiredObject' }
          ])
        };
      }

      return { success: true, data: parsed };

    } catch {
      return {
        success: false,
        error: new ParseError([
          { code: 'object-json', input: value, path: [], message: 'validation.object.invalidJson' }
        ])
      };
    }

  }

  if (property.type === 'array') {

    try {

      const parsed = JSON.parse(String(value ?? ''));
      if (!Array.isArray(parsed)) {
        return {
          success: false,
          error: new ParseError([
            { code: 'array-invalid', input: parsed, path: [], message: 'validation.array.requiredArray' }
          ])
        };
      }

      if (typeof property.minItems === 'number' && parsed.length < property.minItems) {
        return {
          success: false,
          error: new ParseError([
            {
              code: 'array-min-items',
              input: parsed,
              path: [],
              message: 'validation.array.minItems'
            }
          ])
        };
      }

      if (typeof property.maxItems === 'number' && parsed.length > property.maxItems) {
        return {
          success: false,
          error: new ParseError([
            {
              code: 'array-max-items',
              input: parsed,
              path: [],
              message: 'validation.array.maxItems'
            }
          ])
        };
      }

      return { success: true, data: parsed };

    } catch {
      return {
        success: false,
        error: new ParseError([
          { code: 'array-json', input: value, path: [], message: 'validation.array.invalidJson' }
        ])
      };
    }
  }

  return { success: true, data: value };

}
