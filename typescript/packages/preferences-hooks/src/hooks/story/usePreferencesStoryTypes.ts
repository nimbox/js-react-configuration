import type { ParseError, PreferenceProperty } from '@nimbox/preferences';
import type { LocalizationMessages, UsePreferencesProps } from '../usePreferences';
export type { ParseError } from '@nimbox/preferences';

export type UsePreferencesStoryProps = UsePreferencesProps & {
  maxDepth: number;
  initialQuery?: string;
  values?: ScopedPropertyValues;
};

export type ScopedPropertyValues = Record<string, Record<string, unknown>>;

export type PropertyChangeHandler = (scope: string, key: string, value: unknown) => unknown;

export type InvalidDraftValues = Record<string, Record<string, unknown>>;
export type ValidationErrorValues = Record<string, Record<string, ParseError>>;

export interface PropertyDisplayItem {
  propertyKey: string;
  propertyTitle: string;
  property: PreferenceProperty;
}

export interface PropertyCardEditorProps {
  scope: string;
  propertyItem: PropertyDisplayItem;
  level: number;
  committedValue: unknown;
  invalidDraft?: unknown;
  validationError?: ParseError;
  onChange: PropertyChangeHandler;
  onInvalidDraft: (scope: string, key: string, draft: unknown, error: ParseError) => void;
  onClearInvalid: (scope: string, key: string) => void;
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
