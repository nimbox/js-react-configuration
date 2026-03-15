import type {
  PreferenceCardinality,
  PreferenceCollectionItem,
  PreferenceDescriptor,
  PreferenceFieldKind,
  PreferenceProperty,
  PreferenceType,
  PreferenceValueKind,
} from './types';

const ARRAY_TYPES: PreferenceType[] = [
  'string[]',
  'number[]',
  'boolean[]',
  'enum[]',
  'object[]',
];

function isArrayType(type: PreferenceType): boolean {
  return ARRAY_TYPES.includes(type);
}

function isObjectRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export function getFieldKind(type: PreferenceType): PreferenceFieldKind {
  return isArrayType(type) ? 'collection' : 'scalar';
}

export function getCardinality(type: PreferenceType): PreferenceCardinality {
  return isArrayType(type) ? 'many' : 'one';
}

export function getValueKind(type: PreferenceType): PreferenceValueKind {
  if (type === 'string' || type === 'string[]') return 'string';
  if (type === 'number' || type === 'number[]') return 'number';
  if (type === 'boolean' || type === 'boolean[]') return 'boolean';
  if (type === 'enum' || type === 'enum[]') return 'enum';
  return 'object';
}

export function validateValue(property: PreferenceProperty, value: unknown): string[] {
  const issues: string[] = [];

  switch (property.type) {
    case 'string':
      if (typeof value !== 'string') issues.push('Expected string value');
      break;
    case 'number':
      if (typeof value !== 'number' || Number.isNaN(value)) {
        issues.push('Expected number value');
      }
      break;
    case 'boolean':
      if (typeof value !== 'boolean') issues.push('Expected boolean value');
      break;
    case 'enum':
      if (typeof value !== 'string') {
        issues.push('Expected enum value as string');
      } else if (!property.enumItems.includes(value)) {
        issues.push(`Expected one of: ${property.enumItems.join(', ')}`);
      }
      break;
    case 'string[]':
      if (!Array.isArray(value) || value.some((item) => typeof item !== 'string')) {
        issues.push('Expected array of strings');
      }
      break;
    case 'number[]':
      if (
        !Array.isArray(value) ||
        value.some((item) => typeof item !== 'number' || Number.isNaN(item))
      ) {
        issues.push('Expected array of numbers');
      }
      break;
    case 'boolean[]':
      if (!Array.isArray(value) || value.some((item) => typeof item !== 'boolean')) {
        issues.push('Expected array of booleans');
      }
      break;
    case 'enum[]':
      if (!Array.isArray(value) || value.some((item) => typeof item !== 'string')) {
        issues.push('Expected array of enum strings');
      } else {
        const invalid = value.filter((item) => !property.enumItems.includes(item));
        if (invalid.length > 0) {
          issues.push(`Invalid enum item(s): ${invalid.join(', ')}`);
        }
      }
      break;
    case 'object[]':
      if (!Array.isArray(value) || value.some((item) => !isObjectRecord(item))) {
        issues.push('Expected array of objects');
      }
      break;
    default:
      issues.push('Unsupported type');
  }

  return issues;
}

export function normalizeDescriptor(
  key: string,
  property: PreferenceProperty,
  currentValue: unknown,
): PreferenceDescriptor {
  const resolved = currentValue === undefined ? property.default : currentValue;
  const issues = validateValue(property, resolved);
  const fieldKind = getFieldKind(property.type);
  const cardinality = getCardinality(property.type);

  return {
    key,
    type: property.type,
    fieldKind,
    valueKind: getValueKind(property.type),
    cardinality,
    description: property.description,
    value: resolved,
    defaultValue: property.default,
    scope: property.scope ?? 'user',
    overridable: property.overridable ?? true,
    enumItems: 'enumItems' in property ? property.enumItems : undefined,
    constraints: {},
    capabilities: {
      canSet: true,
      canAdd: cardinality === 'many',
      canRemove: cardinality === 'many',
      canEditItems: cardinality === 'many',
    },
    issues,
  };
}

export function ensureCollectionForType(type: PreferenceType, value: unknown): PreferenceCollectionItem[] {
  if (!isArrayType(type)) return [];
  return Array.isArray(value) ? (value as PreferenceCollectionItem[]) : [];
}
