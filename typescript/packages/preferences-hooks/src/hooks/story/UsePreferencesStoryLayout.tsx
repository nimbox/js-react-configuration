import type { PreferenceProperty, PropertyGroup } from '@nimbox/preferences';
import { useCallback, useMemo, useRef, useState, type CSSProperties } from 'react';
import { usePreferences } from '../usePreferences';
import { useSectionNavigationSync } from '../useSectionNavigationSync';
import { PropertyCardEditor } from './PropertyCardEditor';
import './usePreferencesStory.css';
import { buildRenderedSections } from './usePreferencesStorySections';
import type { InvalidDraftValues, ParseError, RenderedSection, UsePreferencesStoryProps, ValidationErrorValues } from './usePreferencesStoryTypes';


function GroupNav(props: {
  groups: PropertyGroup[];
  level?: number;
  maxDepth: number;
  activeNavKey: string | null;
  onSelect: (groupKey: string) => void;
}) {
  const {
    groups,
    level = 0,
    maxDepth,
    activeNavKey,
    onSelect
  } = props;

  return (
    <ul className="usePreferencesStoryNavList">
      {groups.map((group) => (
        <li
          key={group.key}
          className="usePreferencesStoryNavItem"
          style={{ '--indent': `${level * 12}px` } as CSSProperties}
        >
          <button
            type="button"
            className={`usePreferencesStoryNavButton${activeNavKey === group.key ? ' isActive' : ''}`}
            onClick={() => {
              onSelect(group.key);
            }}
          >
            {group.title}
          </button>
          {(group.groups.length > 0 && level < maxDepth)
            ? (
              <GroupNav
                groups={group.groups}
                level={level + 1}
                maxDepth={maxDepth}
                activeNavKey={activeNavKey}
                onSelect={onSelect}
              />
            )
            : null}
        </li>
      ))}
    </ul>
  );
}

function formatValueVersion(value: unknown): string {
  if (typeof value === 'string') {
    return `s:${value}`;
  }
  if (typeof value === 'number') {
    return `n:${value}`;
  }
  if (typeof value === 'boolean') {
    return `b:${value ? '1' : '0'}`;
  }
  if (value === null) {
    return 'null';
  }
  if (value === undefined) {
    return 'undefined';
  }
  try {
    return `j:${JSON.stringify(value)}`;
  } catch {
    return 'unknown';
  }
}

function updateScopedValue<T>(
  current: Record<string, Record<string, T>>,
  scope: string,
  key: string,
  value: T
): Record<string, Record<string, T>> {
  return {
    ...current,
    [scope]: {
      ...(current[scope] ?? {}),
      [key]: value
    }
  };
}

function clearScopedValue<T>(
  current: Record<string, Record<string, T>>,
  scope: string,
  key: string
): Record<string, Record<string, T>> {
  const scopeValues = current[scope];
  if (!scopeValues || !(key in scopeValues)) {
    return current;
  }
  const rest = Object.fromEntries(
    Object.entries(scopeValues).filter(([entryKey]) => entryKey !== key)
  ) as Record<string, T>;
  if (Object.keys(rest).length === 0) {
    const restScopes = Object.fromEntries(
      Object.entries(current).filter(([scopeKey]) => scopeKey !== scope)
    ) as Record<string, Record<string, T>>;
    return restScopes;
  }
  return {
    ...current,
    [scope]: rest
  };
}

function PropertiesSections(props: {
  sections: RenderedSection[];
  scope: string;
  values?: UsePreferencesStoryProps['values'];
  committedOverrides: Record<string, Record<string, unknown>>;
  invalidDraftValues: InvalidDraftValues;
  validationErrorValues: ValidationErrorValues;
  onChange: (scope: string, key: string, value: unknown) => void;
  onInvalidDraft: (scope: string, key: string, draft: unknown, error: ParseError) => void;
  onClearInvalid: (scope: string, key: string) => void;
  locale?: string;
  messages?: UsePreferencesStoryProps['messages'];
  registerSection: (sectionId: string, element: HTMLElement | null) => void;
}) {
  const {
    sections,
    scope,
    values,
    committedOverrides,
    invalidDraftValues,
    validationErrorValues,
    onChange,
    onInvalidDraft,
    onClearInvalid,
    locale,
    messages,
    registerSection
  } = props;

  return (
    <>
      {sections.map((section) => (
        <article
          key={section.sectionId}
          data-section-id={section.sectionId}
          ref={(element) => {
            registerSection(section.sectionId, element);
          }}
          className="usePreferencesStorySection"
        >
          <div
            className="usePreferencesStorySectionTitle"
            style={{ '--indent': `${section.level * 12}px` } as CSSProperties}
          >
            {section.headingTitle}
          </div>

          {section.propertyItems.map((propertyItem) => {
            const committedValue = (propertyItem.propertyKey in (committedOverrides[scope] ?? {}))
              ? committedOverrides[scope]?.[propertyItem.propertyKey]
              : values?.[scope]?.[propertyItem.propertyKey];
            const resolvedCommittedValue = committedValue !== undefined
              ? committedValue
              : propertyItem.property.default;
            const invalidDraft = invalidDraftValues[scope]?.[propertyItem.propertyKey];
            const validationError = validationErrorValues[scope]?.[propertyItem.propertyKey];
            const firstIssue = validationError?.issues[0];
            const editorKey = `${scope}::${propertyItem.propertyKey}::${formatValueVersion(resolvedCommittedValue)}::${formatValueVersion(invalidDraft)}::${firstIssue?.code ?? ''}::${firstIssue?.message ?? ''}`;
            return (
              <PropertyCardEditor
                key={editorKey}
                scope={scope}
                propertyItem={propertyItem}
                level={section.level}
                committedValue={resolvedCommittedValue}
                invalidDraft={invalidDraft}
                validationError={validationError}
                onChange={onChange}
                onInvalidDraft={onInvalidDraft}
                onClearInvalid={onClearInvalid}
                locale={locale}
                messages={messages}
              />
            );
          })}
        </article>
      ))}
    </>
  );
}

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
  const [committedOverrides, setCommittedOverrides] = useState<Record<string, Record<string, unknown>>>({});
  const [invalidDraftValues, setInvalidDraftValues] = useState<InvalidDraftValues>({});
  const [validationErrorValues, setValidationErrorValues] = useState<ValidationErrorValues>({});
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

  const { groups, onChange: onPreferenceChange } = usePreferences({
    ...preferencesProps,
    scopes,
    scope: selectedScope,
    onChange: providedOnChange,
    locale,
    messages,
    propertyPredicate
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
  const handlePropertyChange = useCallback((scopeName: string, key: string, value: unknown) => {
    const persistedValue = onPreferenceChange(scopeName, key, value);
    setCommittedOverrides((previous) => updateScopedValue(previous, scopeName, key, value));
    setInvalidDraftValues((previous) => clearScopedValue(previous, scopeName, key));
    setValidationErrorValues((previous) => clearScopedValue(previous, scopeName, key));
    return persistedValue;
  }, [onPreferenceChange]);
  const handleInvalidDraft = useCallback((scopeName: string, key: string, draft: unknown, error: ParseError) => {
    setInvalidDraftValues((previous) => updateScopedValue(previous, scopeName, key, draft));
    setValidationErrorValues((previous) => updateScopedValue(previous, scopeName, key, error));
  }, []);
  const handleClearInvalid = useCallback((scopeName: string, key: string) => {
    setInvalidDraftValues((previous) => clearScopedValue(previous, scopeName, key));
    setValidationErrorValues((previous) => clearScopedValue(previous, scopeName, key));
  }, []);
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
              scope={selectedScope}
              values={values}
              committedOverrides={committedOverrides}
              invalidDraftValues={invalidDraftValues}
              validationErrorValues={validationErrorValues}
              onChange={handlePropertyChange}
              onInvalidDraft={handleInvalidDraft}
              onClearInvalid={handleClearInvalid}
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
