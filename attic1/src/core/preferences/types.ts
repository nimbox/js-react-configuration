export type ConfigurationScope = 'system' | 'global' | 'application' | 'user' | string;
export type ConfigurationScalarType = 'string' | 'number' | 'boolean';
export type ConfigurationPropertyType = ConfigurationScalarType | 'array';
export type ConfigurationArrayItemType = 'string' | 'number' | 'boolean';

export type ConfigurationScalarValue = string | number | boolean;
export type ConfigurationArrayValue = string[] | number[] | boolean[];
export type ConfigurationValue = ConfigurationScalarValue | ConfigurationArrayValue;
export type ConfigurationCollectionItem = string | number | boolean;

export type ConfigurationFieldKind = 'scalar' | 'collection';
export type ConfigurationValueKind = 'string' | 'number' | 'boolean';
export type ConfigurationCardinality = 'one' | 'many';

type BaseConfigurationProperty<
  TType extends ConfigurationPropertyType,
  TDefault extends ConfigurationValue,
> = {
  type: TType;
  scope: ConfigurationScope;
  overridable: boolean;
  default: TDefault;
  descriptionKey: string;
  deprecationMessageKey?: string;
  order?: number;
  tags?: string[];
  additionalProperties?: boolean;
  minimum?: number;
  maximum?: number;
  minLength?: number;
  maxLength?: number;
  pattern?: string;
  patternErrorMessage?: string;
  format?: 'date' | 'time' | 'email' | 'uri' | 'ipv4' | string;
  minItems?: number;
  maxItems?: number;
};

export type StringConfigurationProperty = BaseConfigurationProperty<'string', string> & {
  enum?: string[];
  enumLabels?: string[];
  enumDescriptions?: string[];
};

export type NumberConfigurationProperty = BaseConfigurationProperty<'number', number>;
export type BooleanConfigurationProperty = BaseConfigurationProperty<'boolean', boolean>;
export type ArrayConfigurationProperty = BaseConfigurationProperty<'array', ConfigurationArrayValue> & {
  items: {
    type: ConfigurationArrayItemType;
  };
};

export type ConfigurationProperty =
  | StringConfigurationProperty
  | NumberConfigurationProperty
  | BooleanConfigurationProperty
  | ArrayConfigurationProperty;

export type ConfigurationSchema = Record<string, ConfigurationProperty>;
export type ConfigurationScopeValues = Record<string, unknown>;
export type ConfigurationValuesByScope = Record<string, ConfigurationScopeValues>;
export type EffectivePreferences = Record<string, ConfigurationValue>;

export type ConfigurationConstraints = {
  minimum?: number;
  maximum?: number;
  minLength?: number;
  maxLength?: number;
  pattern?: string;
  minItems?: number;
  maxItems?: number;
};

export type ConfigurationCapabilities = {
  canSet: boolean;
  canAdd: boolean;
  canRemove: boolean;
  canEditItems: boolean;
};

export type ConfigurationDescriptor = {
  key: string;
  type: ConfigurationPropertyType;
  fieldKind: ConfigurationFieldKind;
  valueKind: ConfigurationValueKind;
  cardinality: ConfigurationCardinality;
  descriptionKey: string;
  value: unknown;
  defaultValue: ConfigurationValue;
  scope: ConfigurationScope;
  overridable: boolean;
  enum?: string[];
  constraints: ConfigurationConstraints;
  capabilities: ConfigurationCapabilities;
  issues: string[];
};

export type UnknownKeyPolicy = 'warn' | 'ignore' | 'reject';

export type ConfigurationEngine = {
  listDescriptors: (scope: ConfigurationScope) => ConfigurationDescriptor[];
  getDescriptor: (scope: ConfigurationScope, key: string) => ConfigurationDescriptor | undefined;
  getValuesByScope: () => ConfigurationValuesByScope;
  getEffectivePreferences: () => EffectivePreferences;
  getWarnings: () => string[];
  getIssuesByScope: (scope: ConfigurationScope) => Record<string, string[]>;
  setScopedValue: (scope: ConfigurationScope, key: string, next: unknown) => void;
  insertScopedItem: (
    scope: ConfigurationScope,
    key: string,
    item: ConfigurationCollectionItem,
    index?: number,
  ) => void;
  updateScopedItemAt: (
    scope: ConfigurationScope,
    key: string,
    index: number,
    item: ConfigurationCollectionItem,
  ) => void;
  removeScopedItemAt: (scope: ConfigurationScope, key: string, index: number) => void;
};
