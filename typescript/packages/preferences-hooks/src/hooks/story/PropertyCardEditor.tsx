import { useMemo, useState, type CSSProperties } from 'react';
import { isParseError } from '@nimbox/preferences';
import type { ParseError } from '@nimbox/preferences';
import type { PropertyCardEditorProps } from './usePreferencesStoryTypes';

function stringifyDraftValue(value: unknown): string {
  if (typeof value === 'string') {
    return value;
  }
  if (value === undefined) {
    return '';
  }
  if (typeof value === 'number') {
    return Number.isFinite(value) ? String(value) : '';
  }
  if (typeof value === 'boolean') {
    return value ? 'true' : 'false';
  }
  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return '';
  }
}

function resolveMessage(
  error: ParseError,
  locale: string | undefined,
  messages: PropertyCardEditorProps['messages']
): string {
  const messageKey = error.issues[0]?.message ?? 'validation.unknown';
  return locale ? messages?.[locale]?.[messageKey] ?? messageKey : messageKey;
}

function valuesAreEqual(left: unknown, right: unknown): boolean {
  if (Object.is(left, right)) {
    return true;
  }
  try {
    return JSON.stringify(left) === JSON.stringify(right);
  } catch {
    return false;
  }
}

function getInitialDraftValue(property: PropertyCardEditorProps['propertyItem']['property'], committedValue: unknown, invalidDraft?: unknown): unknown {
  if (invalidDraft !== undefined) {
    return invalidDraft;
  }
  if (property.type === 'boolean') {
    return Boolean(committedValue);
  }
  return stringifyDraftValue(committedValue);
}

export function PropertyCardEditor(props: PropertyCardEditorProps) {

  const {
    scope,
    propertyItem,
    level,
    committedValue,
    invalidDraft,
    validationError,
    onChange,
    onInvalidDraft,
    onClearInvalid,
    locale,
    messages
  } = props;

  const { propertyKey, propertyTitle, property } = propertyItem;
  const [draft, setDraft] = useState<unknown>(() => getInitialDraftValue(property, committedValue, invalidDraft));

  const errorMessage = useMemo(() => {
    if (!validationError) {
      return null;
    }
    return resolveMessage(validationError, locale, messages);
  }, [validationError, locale, messages]);

  const enumOptions = useMemo(() => {
    if (!Array.isArray(property.enum) || property.enum.length === 0) {
      return null;
    }
    return property.enum.map((optionValue, index) => {
      const label = property.enumLabels?.[index] ?? String(optionValue);
      const description = property.enumDescriptions?.[index];
      return {
        index,
        value: optionValue,
        label,
        description
      };
    });
  }, [property.enum, property.enumDescriptions, property.enumLabels]);

  const selectedEnumIndex = useMemo(() => {
    if (!enumOptions) {
      return '';
    }
    const match = enumOptions.find((option) => valuesAreEqual(option.value, draft));
    return match ? String(match.index) : '';
  }, [enumOptions, draft]);

  const commitDraft = () => {
    try {
      const parsed = onChange(scope, propertyKey, draft);
      onClearInvalid(scope, propertyKey);
      void parsed;
    } catch (error) {
      if (isParseError(error)) {
        onInvalidDraft(scope, propertyKey, draft, error);
        return;
      }
      throw error;
    }
  };

  const resetDraft = () => {
    setDraft(getInitialDraftValue(property, committedValue));
    onClearInvalid(scope, propertyKey);
  };

  return (
    <div
      className="usePreferencesStoryPropertyCard"
      style={{ '--indent': `${level * 12}px` } as CSSProperties}
    >
      <div className="usePreferencesStoryPropertyMeta">
        {property.type} - {property.scope} - {property.overridable ? 'overridable' : 'locked'}
      </div>
      <div className="usePreferencesStoryPropertyTitle">{propertyTitle}</div>
      {enumOptions ? (
        <select
          className={`usePreferencesStoryPropertyEditor${validationError ? ' hasError' : ''}`}
          value={selectedEnumIndex}
          onChange={(event) => {
            const optionIndex = Number(event.target.value);
            if (!Number.isInteger(optionIndex) || !enumOptions[optionIndex]) {
              return;
            }
            setDraft(enumOptions[optionIndex].value);
          }}
          onBlur={commitDraft}
        >
          {selectedEnumIndex === '' ? (
            <option value="" disabled>
              Select value...
            </option>
          ) : null}
          {enumOptions.map((option) => (
            <option key={String(option.index)} value={String(option.index)}>
              {option.description ? `${option.label} - ${option.description}` : option.label}
            </option>
          ))}
        </select>
      ) : (property.type === 'object' || property.type === 'array') ? (
        <textarea
          className={`usePreferencesStoryPropertyEditor usePreferencesStoryPropertyEditorTextarea${validationError ? ' hasError' : ''}`}
          value={typeof draft === 'string' ? draft : stringifyDraftValue(draft)}
          onChange={(event) => {
            setDraft(event.target.value);
          }}
          onBlur={commitDraft}
          rows={4}
        />
      ) : property.type === 'boolean' ? (
        <label className="usePreferencesStoryPropertyCheckboxWrap">
          <input
            type="checkbox"
            checked={draft === true}
            onChange={(event) => {
              setDraft(event.target.checked);
            }}
            onBlur={commitDraft}
          />
          <span>{draft === true ? 'true' : 'false'}</span>
        </label>
      ) : (
        <input
          className={`usePreferencesStoryPropertyEditor${validationError ? ' hasError' : ''}`}
          type="text"
          value={typeof draft === 'string' ? draft : stringifyDraftValue(draft)}
          onChange={(event) => {
            setDraft(event.target.value);
          }}
          onBlur={commitDraft}
        />
      )}

      {errorMessage && (
        <>
          <div className="usePreferencesStoryPropertyError">
            {errorMessage}
          </div>
          <button
            type="button"
            className="usePreferencesStoryPropertyReset"
            onClick={resetDraft}
          >
            Reset
          </button>
        </>
      )}

    </div>
  );
}
