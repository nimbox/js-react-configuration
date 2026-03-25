import {
  ensureCollectionForProperty,
  normalizeDescriptor,
  resolvePropertyValue,
} from './fieldAdapters';
import type {
  ConfigurationEngine,
  ConfigurationProperty,
  ConfigurationScope,
  ConfigurationScopeValues,
  ConfigurationSchema,
  ConfigurationValuesByScope,
  EffectivePreferences,
  UnknownKeyPolicy,
} from './types';

type CreateConfigurationEngineInput = {
  schema: ConfigurationSchema;
  scopeOrder: ConfigurationScope[];
  initialValuesByScope?: ConfigurationValuesByScope;
  unknownKeyPolicy?: UnknownKeyPolicy;
};

function cloneValuesByScope(valuesByScope: ConfigurationValuesByScope): ConfigurationValuesByScope {
  return Object.fromEntries(
    Object.entries(valuesByScope).map(([scope, values]) => [scope, { ...values }]),
  );
}

function createUnknownKeyWarning(scope: string, key: string, policy: UnknownKeyPolicy): string {
  if (policy === 'reject') {
    return `Rejected unknown property key "${key}" in scope "${scope}".`;
  }
  return `Unknown property key "${key}" in scope "${scope}".`;
}

export function createConfigurationEngine({
  schema,
  scopeOrder,
  initialValuesByScope = {},
  unknownKeyPolicy = 'warn',
}: CreateConfigurationEngineInput): ConfigurationEngine {
  const valuesByScope: ConfigurationValuesByScope = cloneValuesByScope(initialValuesByScope);

  const getKeys = (): string[] => Object.keys(schema);
  const isKnownKey = (key: string): boolean => key in schema;

  const getProperty = (key: string): ConfigurationProperty | undefined => schema[key];

  const ensureScopeValues = (scope: ConfigurationScope): ConfigurationScopeValues => {
    const existing = valuesByScope[scope];
    if (existing) return existing;
    valuesByScope[scope] = {};
    return valuesByScope[scope];
  };

  const getEffectivePreferences = (): EffectivePreferences => {
    const entries = Object.entries(schema)
      .map(([key, property]) => {
        const value = resolvePropertyValue({
          key,
          property,
          scopeOrder,
          valuesByScope,
        });
        return value === undefined ? undefined : [key, value];
      })
      .filter((entry): entry is [string, EffectivePreferences[string]] => Boolean(entry));

    return Object.fromEntries(entries);
  };

  const getWarnings = (): string[] => {
    if (unknownKeyPolicy === 'ignore') return [];

    return Object.entries(valuesByScope).flatMap(([scope, scopedValues]) =>
      Object.keys(scopedValues)
        .filter((key) => !isKnownKey(key))
        .map((key) => createUnknownKeyWarning(scope, key, unknownKeyPolicy)),
    );
  };

  const listDescriptors: ConfigurationEngine['listDescriptors'] = (scope) =>
    getKeys().map((key) =>
      normalizeDescriptor({
        key,
        property: schema[key],
        scope,
        scopeOrder,
        valuesByScope,
      }),
    );

  const getDescriptor: ConfigurationEngine['getDescriptor'] = (scope, key) => {
    const property = getProperty(key);
    if (!property) return undefined;
    return normalizeDescriptor({
      key,
      property,
      scope,
      scopeOrder,
      valuesByScope,
    });
  };

  const getValuesByScope: ConfigurationEngine['getValuesByScope'] = () =>
    cloneValuesByScope(valuesByScope);

  const getIssuesByScope: ConfigurationEngine['getIssuesByScope'] = (scope) => {
    const issues: Record<string, string[]> = {};
    for (const descriptor of listDescriptors(scope)) {
      if (descriptor.issues.length > 0) {
        issues[descriptor.key] = descriptor.issues;
      }
    }
    return issues;
  };

  const canEditAtScope = (scope: ConfigurationScope, key: string): boolean => {
    const property = getProperty(key);
    if (!property) return false;
    const propertyScopeIndex = scopeOrder.indexOf(property.scope);
    const selectedScopeIndex = scopeOrder.indexOf(scope);
    if (propertyScopeIndex === -1 || selectedScopeIndex === -1) return false;
    if (selectedScopeIndex < propertyScopeIndex) return false;
    return property.overridable || scope === property.scope;
  };

  const setScopedValue: ConfigurationEngine['setScopedValue'] = (scope, key, next) => {
    if (!isKnownKey(key) || !canEditAtScope(scope, key)) return;
    const scopeValues = ensureScopeValues(scope);
    scopeValues[key] = next;
  };

  const insertScopedItem: ConfigurationEngine['insertScopedItem'] = (scope, key, item, index) => {
    const property = getProperty(key);
    if (!property || !canEditAtScope(scope, key)) return;
    const scopeValues = ensureScopeValues(scope);
    const current = ensureCollectionForProperty(property, scopeValues[key] ?? property.default);
    if (index === undefined || index < 0 || index > current.length) {
      scopeValues[key] = [...current, item];
      return;
    }
    const next = [...current];
    next.splice(index, 0, item);
    scopeValues[key] = next;
  };

  const updateScopedItemAt: ConfigurationEngine['updateScopedItemAt'] = (scope, key, index, item) => {
    const property = getProperty(key);
    if (!property || !canEditAtScope(scope, key)) return;
    const scopeValues = ensureScopeValues(scope);
    const current = ensureCollectionForProperty(property, scopeValues[key] ?? property.default);
    if (index < 0 || index >= current.length) return;
    const next = [...current];
    next[index] = item;
    scopeValues[key] = next;
  };

  const removeScopedItemAt: ConfigurationEngine['removeScopedItemAt'] = (scope, key, index) => {
    const property = getProperty(key);
    if (!property || !canEditAtScope(scope, key)) return;
    const scopeValues = ensureScopeValues(scope);
    const current = ensureCollectionForProperty(property, scopeValues[key] ?? property.default);
    if (index < 0 || index >= current.length) return;
    scopeValues[key] = current.filter((_, idx) => idx !== index);
  };

  return {
    listDescriptors,
    getDescriptor,
    getValuesByScope,
    getEffectivePreferences,
    getWarnings,
    getIssuesByScope,
    setScopedValue,
    insertScopedItem,
    updateScopedItemAt,
    removeScopedItemAt,
  };
}
