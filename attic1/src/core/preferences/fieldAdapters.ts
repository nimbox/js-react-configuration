import type {
  ConfigurationCardinality,
  ConfigurationCollectionItem,
  ConfigurationDescriptor,
  ConfigurationFieldKind,
  ConfigurationProperty,
  ConfigurationPropertyType,
  ConfigurationScope,
  ConfigurationScopeValues,
  ConfigurationValueKind,
  ConfigurationValuesByScope,
} from './types';

function isArrayType(type: ConfigurationPropertyType): boolean {
  return type === 'array';
}

export function getFieldKind(type: ConfigurationPropertyType): ConfigurationFieldKind {
  return isArrayType(type) ? 'collection' : 'scalar';
}

export function getCardinality(type: ConfigurationPropertyType): ConfigurationCardinality {
  return isArrayType(type) ? 'many' : 'one';
}

export function getValueKind(property: ConfigurationProperty): ConfigurationValueKind {
  if (property.type === 'array') return property.items.type;
  return property.type;
}

function validateConstraintConsistency(property: ConfigurationProperty): string[] {
  const issues: string[] = [];

  if (
    property.minimum !== undefined &&
    property.maximum !== undefined &&
    property.minimum > property.maximum
  ) {
    issues.push('minimum must be less than or equal to maximum');
  }
  if (
    property.minLength !== undefined &&
    property.maxLength !== undefined &&
    property.minLength > property.maxLength
  ) {
    issues.push('minLength must be less than or equal to maxLength');
  }
  if (
    property.minItems !== undefined &&
    property.maxItems !== undefined &&
    property.minItems > property.maxItems
  ) {
    issues.push('minItems must be less than or equal to maxItems');
  }

  if (property.pattern) {
    try {
      // Validate the pattern definition itself.
      new RegExp(property.pattern);
    } catch {
      issues.push('pattern must be a valid regular expression');
    }
  }

  return issues;
}

export function validateValue(property: ConfigurationProperty, value: unknown): string[] {
  const issues: string[] = [];

  switch (property.type) {
    case 'string': {
      if (typeof value !== 'string') {
        issues.push('Expected string value');
        break;
      }
      if (property.enum && !property.enum.includes(value)) {
        issues.push(`Expected one of: ${property.enum.join(', ')}`);
      }
      if (property.minLength !== undefined && value.length < property.minLength) {
        issues.push(`Expected length >= ${property.minLength}`);
      }
      if (property.maxLength !== undefined && value.length > property.maxLength) {
        issues.push(`Expected length <= ${property.maxLength}`);
      }
      if (property.pattern && !new RegExp(property.pattern).test(value)) {
        issues.push(property.patternErrorMessage ?? 'Value does not match required pattern');
      }
      break;
    }
    case 'number':
      if (typeof value !== 'number' || Number.isNaN(value)) {
        issues.push('Expected number value');
        break;
      }
      if (property.minimum !== undefined && value < property.minimum) {
        issues.push(`Expected value >= ${property.minimum}`);
      }
      if (property.maximum !== undefined && value > property.maximum) {
        issues.push(`Expected value <= ${property.maximum}`);
      }
      break;
    case 'boolean':
      if (typeof value !== 'boolean') {
        issues.push('Expected boolean value');
      }
      break;
    case 'array':
      if (!Array.isArray(value)) {
        issues.push('Expected array value');
        break;
      }
      if (property.minItems !== undefined && value.length < property.minItems) {
        issues.push(`Expected at least ${property.minItems} item(s)`);
      }
      if (property.maxItems !== undefined && value.length > property.maxItems) {
        issues.push(`Expected at most ${property.maxItems} item(s)`);
      }

      if (property.items.type === 'string') {
        if (value.some((item) => typeof item !== 'string')) {
          issues.push('Expected array of strings');
        }
      } else if (property.items.type === 'number') {
        if (value.some((item) => typeof item !== 'number' || Number.isNaN(item))) {
          issues.push('Expected array of numbers');
        }
      } else if (value.some((item) => typeof item !== 'boolean')) {
        issues.push('Expected array of booleans');
      }
      break;
    default:
      issues.push('Unsupported type');
  }

  if (property.type === 'string' && property.enum && !property.enum.includes(property.default)) {
    issues.push(`Default must be one of: ${property.enum.join(', ')}`);
  }

  if (property.type === 'string' && property.enumLabels && property.enumLabels.length !== property.enum?.length) {
    issues.push('enumLabels length must match enum length');
  }
  if (
    property.type === 'string' &&
    property.enumDescriptions &&
    property.enumDescriptions.length !== property.enum?.length
  ) {
    issues.push('enumDescriptions length must match enum length');
  }

  issues.push(...validateConstraintConsistency(property));
  return issues;
}

function getScopedValues(valuesByScope: ConfigurationValuesByScope, scope: ConfigurationScope): ConfigurationScopeValues {
  return valuesByScope[scope] ?? {};
}

export function resolvePropertyValue({
  key,
  property,
  scopeOrder,
  valuesByScope,
}: {
  key: string;
  property: ConfigurationProperty;
  scopeOrder: ConfigurationScope[];
  valuesByScope: ConfigurationValuesByScope;
}): unknown {
  const propertyScopeIndex = scopeOrder.indexOf(property.scope);
  if (propertyScopeIndex === -1) return undefined;

  const baselineValues = getScopedValues(valuesByScope, property.scope);
  const startValue = baselineValues[key] ?? property.default;
  if (!property.overridable) return startValue;

  return scopeOrder.slice(propertyScopeIndex + 1).reduce((current, scope) => {
    const scopedValue = getScopedValues(valuesByScope, scope)[key];
    return scopedValue ?? current;
  }, startValue);
}

export function normalizeDescriptor({
  key,
  property,
  scope,
  scopeOrder,
  valuesByScope,
}: {
  key: string;
  property: ConfigurationProperty;
  scope: ConfigurationScope;
  scopeOrder: ConfigurationScope[];
  valuesByScope: ConfigurationValuesByScope;
}): ConfigurationDescriptor {
  const resolved = resolvePropertyValue({ key, property, scopeOrder, valuesByScope });
  const value = resolved === undefined ? property.default : resolved;
  const issues = validateValue(property, value);
  const fieldKind = getFieldKind(property.type);
  const cardinality = getCardinality(property.type);
  const propertyScopeIndex = scopeOrder.indexOf(property.scope);
  const selectedScopeIndex = scopeOrder.indexOf(scope);
  const canSet =
    propertyScopeIndex !== -1 &&
    selectedScopeIndex !== -1 &&
    selectedScopeIndex >= propertyScopeIndex &&
    (property.overridable || scope === property.scope);

  return {
    key,
    type: property.type,
    fieldKind,
    valueKind: getValueKind(property),
    cardinality,
    descriptionKey: property.descriptionKey,
    value,
    defaultValue: property.default,
    scope: property.scope,
    overridable: property.overridable,
    enum: property.type === 'string' ? property.enum : undefined,
    constraints: {
      minimum: property.minimum,
      maximum: property.maximum,
      minLength: property.minLength,
      maxLength: property.maxLength,
      pattern: property.pattern,
      minItems: property.minItems,
      maxItems: property.maxItems,
    },
    capabilities: {
      canSet,
      canAdd: canSet && cardinality === 'many',
      canRemove: canSet && cardinality === 'many',
      canEditItems: canSet && cardinality === 'many',
    },
    issues,
  };
}

export function ensureCollectionForProperty(
  property: ConfigurationProperty,
  value: unknown,
): ConfigurationCollectionItem[] {
  if (property.type !== 'array') return [];
  return Array.isArray(value) ? (value as ConfigurationCollectionItem[]) : [];
}
