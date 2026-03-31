import type { PreferenceProperty } from '@nimbox/preferences';
import type { UsePreferencesProps } from '../usePreferences';

export type UsePreferencesStoryProps = UsePreferencesProps & {
  maxDepth: number;
};

export interface PropertyDisplayItem {
  propertyKey: string;
  propertyTitle: string;
  property: PreferenceProperty;
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
