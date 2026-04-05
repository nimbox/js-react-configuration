import type { CSSProperties } from 'react';
import { PropertyCardEditor } from './PropertyCardEditor';
import type {
  ErrorsByKey,
  PreferencesByKey,
  RenderedSection,
  UsePreferencesStoryProps
} from './usePreferencesStoryTypes';
import type { RegisterOptions, RegisterResult } from '../../hooks/useInstantEditor';

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

export function PropertiesSections(props: {
  sections: RenderedSection[];
  preferences: PreferencesByKey;
  errors: ErrorsByKey;
  register: (key: string, options?: RegisterOptions) => RegisterResult;
  locale?: string;
  messages?: UsePreferencesStoryProps['messages'];
  registerSection: (sectionId: string, element: HTMLElement | null) => void;
}) {
  const {
    sections,
    preferences,
    errors,
    register,
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
            const preference = preferences[propertyItem.propertyKey] ?? {
              value: propertyItem.property.default,
              isDefined: false,
              isOverriden: false,
              inheritedValue: propertyItem.property.default,
              inheritedScope: propertyItem.property.scope,
              defaultValue: propertyItem.property.default,
              defaultScope: propertyItem.property.scope
            };
            const error = errors[propertyItem.propertyKey];
            const firstIssue = error?.issues[0];
            const editorKey = `${propertyItem.propertyKey}::${formatValueVersion(preference.value)}::${firstIssue?.code ?? ''}::${firstIssue?.message ?? ''}`;
            const field = register(
              propertyItem.propertyKey,
              {
                commitMode: Array.isArray(propertyItem.property.enum) ? 'onChange' : 'onBlur',
                inputType: propertyItem.property.type === 'boolean'
                  ? 'checkbox'
                  : (propertyItem.property.type === 'object' || propertyItem.property.type === 'array')
                    ? 'textarea'
                    : 'text'
              }
            );
            return (
              <PropertyCardEditor
                key={editorKey}
                propertyItem={propertyItem}
                level={section.level}
                preference={preference}
                error={error}
                field={field}
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
