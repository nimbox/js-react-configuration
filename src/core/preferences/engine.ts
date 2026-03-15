import { ensureCollectionForType, normalizeDescriptor } from './fieldAdapters';
import type {
  PreferenceEngine,
  PreferenceProperty,
  PreferenceSchema,
  PreferenceValues,
} from './types';

type CreatePreferenceEngineInput = {
  schema: PreferenceSchema;
  initialValue?: PreferenceValues;
};

export function createPreferenceEngine({
  schema,
  initialValue = {},
}: CreatePreferenceEngineInput): PreferenceEngine {
  const values: PreferenceValues = { ...initialValue };

  const getKeys = (): string[] => Object.keys(schema);

  const getProperty = (key: string): PreferenceProperty | undefined => schema[key];

  const getDescriptor: PreferenceEngine['getDescriptor'] = (key) => {
    const property = getProperty(key);
    if (!property) return undefined;
    return normalizeDescriptor(key, property, values[key]);
  };

  const listDescriptors: PreferenceEngine['listDescriptors'] = () =>
    getKeys().map((key) => normalizeDescriptor(key, schema[key], values[key]));

  const getValues: PreferenceEngine['getValues'] = () => ({ ...values });

  const getIssues: PreferenceEngine['getIssues'] = () => {
    const issues: Record<string, string[]> = {};
    for (const descriptor of listDescriptors()) {
      if (descriptor.issues.length > 0) {
        issues[descriptor.key] = descriptor.issues;
      }
    }
    return issues;
  };

  const setValue: PreferenceEngine['setValue'] = (key, next) => {
    if (!getProperty(key)) return;
    values[key] = next;
  };

  const insertItem: PreferenceEngine['insertItem'] = (key, item, index) => {
    const property = getProperty(key);
    if (!property) return;
    const current = ensureCollectionForType(property.type, values[key] ?? property.default);
    if (index === undefined || index < 0 || index > current.length) {
      values[key] = [...current, item];
      return;
    }
    const next = [...current];
    next.splice(index, 0, item);
    values[key] = next;
  };

  const updateItemAt: PreferenceEngine['updateItemAt'] = (key, index, item) => {
    const property = getProperty(key);
    if (!property) return;
    const current = ensureCollectionForType(property.type, values[key] ?? property.default);
    if (index < 0 || index >= current.length) return;
    const next = [...current];
    next[index] = item;
    values[key] = next;
  };

  const removeItemAt: PreferenceEngine['removeItemAt'] = (key, index) => {
    const property = getProperty(key);
    if (!property) return;
    const current = ensureCollectionForType(property.type, values[key] ?? property.default);
    if (index < 0 || index >= current.length) return;
    values[key] = current.filter((_, idx) => idx !== index);
  };

  return {
    listDescriptors,
    getDescriptor,
    getValues,
    getIssues,
    setValue,
    insertItem,
    updateItemAt,
    removeItemAt,
  };
}
