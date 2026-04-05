import type { PreferenceProperty } from '@nimbox/preferences';
import { useCallback, useMemo, useRef, useState } from 'react';
import { useInstantEditor } from '../../hooks/useInstantEditor';
import { usePreferences } from '../../hooks/usePreferences';
import { useSectionNavigationSync } from '../../hooks/useSectionNavigationSync';
import { GroupNav } from './GroupNav';
import { PropertiesSections } from './PropertiesSections';
import './usePreferencesStory.css';
import { buildRenderedSections } from './usePreferencesStorySections';
import type { UsePreferencesStoryProps } from './usePreferencesStoryTypes';

export function UsePreferencesStoryLayout(props: UsePreferencesStoryProps) {

  const {
    maxDepth,
    initialQuery = '',
    scope: providedScope,
    scopes,
    onChange: providedOnChange,
    values,
    locale,
    messages,
    ...preferencesProps
  } = props;

  const [query, setQuery] = useState(initialQuery);
  const [manualScope, setManualScope] = useState<string>(() => {
    if (providedScope && scopes.includes(providedScope)) {
      return providedScope;
    }
    return '';
  });

  const propertiesScrollRef = useRef<HTMLElement | null>(null);
  const normalizedQuery = useMemo(() => query.trim().toLowerCase(), [query]);

  const selectedScope = useMemo(() => {
    if (manualScope && scopes.includes(manualScope)) {
      return manualScope;
    }
    if (providedScope && scopes.includes(providedScope)) {
      return providedScope;
    }
    return scopes[scopes.length - 1] ?? '';
  }, [providedScope, scopes, manualScope]);

  const propertyPredicate = useMemo(() => {
    if (!normalizedQuery) {
      return undefined;
    }
    return (key: string, property: PreferenceProperty) => {
      const description = String(property.description ?? '').toLowerCase();
      return key.toLowerCase().includes(normalizedQuery) || description.includes(normalizedQuery);
    };
  }, [normalizedQuery]);

  const { groups, properties, onChange: onPreferenceChange } = usePreferences({
    ...preferencesProps,
    scopes,
    scope: selectedScope,
    onChange: providedOnChange,
    locale,
    messages,
    propertyPredicate
  });
  const {
    preferences,
    errors,
    register
  } = useInstantEditor({
    scopes,
    scope: selectedScope,
    properties,
    values,
    onChange: onPreferenceChange
  });

  const sections = useMemo(() => buildRenderedSections(groups, maxDepth), [groups, maxDepth]);
  const sectionIds = useMemo(() => sections.map((section) => section.sectionId), [sections]);
  const sectionById = useMemo(() => {
    return new Map(sections.map((section) => [section.sectionId, section]));
  }, [sections]);
  const {
    activeSectionId,
    registerSection,
    scrollToSection,
    releaseForcedActiveSection
  } = useSectionNavigationSync({
    containerRef: propertiesScrollRef,
    sectionIds
  });

  const activeNavKey = activeSectionId ? sectionById.get(activeSectionId)?.navKey ?? null : null;
  const handleNavSelect = useCallback((groupKey: string) => {
    void scrollToSection(groupKey, { behavior: 'auto' });
  }, [scrollToSection]);

  return (
    <div className="usePreferencesStoryRoot">
      <div className="usePreferencesStoryLayout">
        <div className="usePreferencesStoryRow">
          <div className="usePreferencesStoryTopBar">
            <span>Max depth: {maxDepth}</span>
            <label className="usePreferencesStoryQueryControl">
              <span>Query</span>
              <input
                type="search"
                value={query}
                onChange={(event) => {
                  setQuery(event.target.value);
                }}
                placeholder="Filter by key or description..."
              />
            </label>
          </div>
        </div>

        <div className="usePreferencesStoryRow">
          <div className="usePreferencesStoryTopBar">
            <span>Scope</span>
            <div className="usePreferencesStoryScopeButtons" role="group" aria-label="Scope selector">
              {scopes.map((scopeName) => (
                <button
                  key={scopeName}
                  type="button"
                  className={`usePreferencesStoryScopeButton${selectedScope === scopeName ? ' isActive' : ''}`}
                  onClick={() => {
                    setManualScope(scopeName);
                  }}
                >
                  {scopeName}
                </button>
              ))}
            </div>
          </div>
        </div>
        <div className="usePreferencesStoryContent">

          <aside className="usePreferencesStoryNav">
            <GroupNav
              groups={groups}
              maxDepth={maxDepth}
              activeNavKey={activeNavKey}
              onSelect={handleNavSelect}
            />
          </aside>

          <section
            ref={propertiesScrollRef}
            className="usePreferencesStoryProperties"
            onScroll={releaseForcedActiveSection}
          >
        
            <PropertiesSections
              sections={sections}
              preferences={preferences}
              errors={errors}
              register={register}
              locale={locale}
              messages={messages}
              registerSection={registerSection}
            />
        
          </section>

        </div>
      </div>
    </div>
  );

}
