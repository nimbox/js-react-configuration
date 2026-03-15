export type PreferenceType =
  | 'string'
  | 'number'
  | 'boolean'
  | 'enum'
  | 'string[]'
  | 'number[]'
  | 'boolean[]'
  | 'enum[]'
  | 'object[]';

export type PreferenceScope = 'system' | 'global' | 'application' | 'user' | string;

export type PreferenceScalarValue = string | number | boolean;
export type PreferenceArrayValue =
  | string[]
  | number[]
  | boolean[]
  | string[]
  | unknown[];
export type PreferenceValue = PreferenceScalarValue | PreferenceArrayValue;
export type PreferenceCollectionItem = string | number | boolean | Record<string, unknown>;

export type PreferenceFieldKind = 'scalar' | 'collection';
export type PreferenceValueKind = 'string' | 'number' | 'boolean' | 'enum' | 'object';
export type PreferenceCardinality = 'one' | 'many';

type BasePreferenceProperty<TType extends PreferenceType, TDefault extends PreferenceValue> = {
  type: TType;
  description: string;
  default: TDefault;
  scope?: PreferenceScope;
  overridable?: boolean;
};

export type StringPreferenceProperty = BasePreferenceProperty<'string', string>;
export type NumberPreferenceProperty = BasePreferenceProperty<'number', number>;
export type BooleanPreferenceProperty = BasePreferenceProperty<'boolean', boolean>;

export type EnumPreferenceProperty = BasePreferenceProperty<'enum', string> & {
  enumItems: string[];
};

export type StringArrayPreferenceProperty = BasePreferenceProperty<'string[]', string[]>;
export type NumberArrayPreferenceProperty = BasePreferenceProperty<'number[]', number[]>;
export type BooleanArrayPreferenceProperty = BasePreferenceProperty<'boolean[]', boolean[]>;

export type EnumArrayPreferenceProperty = BasePreferenceProperty<'enum[]', string[]> & {
  enumItems: string[];
};

export type ObjectArrayPreferenceProperty = BasePreferenceProperty<'object[]', unknown[]>;

export type PreferenceProperty =
  | StringPreferenceProperty
  | NumberPreferenceProperty
  | BooleanPreferenceProperty
  | EnumPreferenceProperty
  | StringArrayPreferenceProperty
  | NumberArrayPreferenceProperty
  | BooleanArrayPreferenceProperty
  | EnumArrayPreferenceProperty
  | ObjectArrayPreferenceProperty;

export type PreferenceSchema = Record<string, PreferenceProperty>;
export type PreferenceValues = Record<string, unknown>;

export type PreferenceConstraints = {
  min?: number;
  max?: number;
  minLength?: number;
  maxLength?: number;
  pattern?: string;
  minItems?: number;
  maxItems?: number;
};

export type PreferenceCapabilities = {
  canSet: boolean;
  canAdd: boolean;
  canRemove: boolean;
  canEditItems: boolean;
};

export type PreferenceDescriptor = {
  key: string;
  type: PreferenceType;
  fieldKind: PreferenceFieldKind;
  valueKind: PreferenceValueKind;
  cardinality: PreferenceCardinality;
  description: string;
  value: unknown;
  defaultValue: PreferenceValue;
  scope: PreferenceScope;
  overridable: boolean;
  enumItems?: string[];
  constraints: PreferenceConstraints;
  capabilities: PreferenceCapabilities;
  issues: string[];
};

export type PreferenceEngine = {
  listDescriptors: () => PreferenceDescriptor[];
  getDescriptor: (key: string) => PreferenceDescriptor | undefined;
  getValues: () => PreferenceValues;
  getIssues: () => Record<string, string[]>;
  setValue: (key: string, next: unknown) => void;
  insertItem: (key: string, item: PreferenceCollectionItem, index?: number) => void;
  updateItemAt: (key: string, index: number, item: PreferenceCollectionItem) => void;
  removeItemAt: (key: string, index: number) => void;
};
