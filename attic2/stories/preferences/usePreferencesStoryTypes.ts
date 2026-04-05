import type { ParseError, PreferenceValue, PreferenceProperty } from '@nimbox/preferences';
import type { RegisterResult } from '../../hooks/useInstantEditor';
import type { LocalizationMessages, UsePreferencesProps } from '../../hooks/usePreferences';
export type { ParseError } from '@nimbox/preferences';


export type UsePreferencesStoryProps = UsePreferencesProps & {
  maxDepth: number;
  initialQuery?: string;
  values?: ScopedPropertyValues;
};

export type ScopedPropertyValues = Record<string, Record<string, unknown>>;

export type PreferencesByKey = Record<string, PreferenceValue>;
export type ErrorsByKey = Record<string, ParseError | undefined>;

export interface PropertyDisplayItem {
  propertyKey: string;
  propertyTitle: string;
  property: PreferenceProperty;
}

export interface PropertyCardEditorProps {
  propertyItem: PropertyDisplayItem;
  level: number;
  preference: PreferenceValue;
  error?: ParseError;
  field: RegisterResult;
  locale?: string;
  messages?: LocalizationMessages;
}

export interface RenderedSection {
  sectionId: string;
  navKey: string;
  groupKey: string;
  groupTitle: string;
  headingTitle: string;
  level: number;
  propertyItems: PropertyDisplayItem[];
}
