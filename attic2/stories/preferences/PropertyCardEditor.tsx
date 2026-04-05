import type { ParseError } from '@nimbox/preferences';
import { useMemo, type CSSProperties } from 'react';
import type { PropertyCardEditorProps } from './usePreferencesStoryTypes';


export function PropertyCardEditor(props: PropertyCardEditorProps) {

  const {
    propertyItem,
    level,
    preference,
    error,
    field,
    locale,
    messages
  } = props;

  const { propertyTitle, property } = propertyItem;
  const { value, isDefined, isOverriden } = preference;
  const { onClear, onDefault, ...inputField } = field;

  const errorMessage = useMemo(() => {
    if (!error) { return null; }
    return resolveMessage(error, locale, messages);
  }, [error, locale, messages]);

  const hasEnum = Array.isArray(property.enum) && property.enum.length > 0;
  const enumOptions = useMemo(() => {
    if (!hasEnum) { return undefined; }
    const enumValues = property.enum ?? [];
    return enumValues.map((optionValue, index) => {
      const label = property.enumLabels?.[index] ?? String(optionValue);
      const description = property.enumDescriptions?.[index];
      return {
        index,
        value: optionValue,
        label,
        description
      };
    });
  }, [hasEnum, property.enum, property.enumDescriptions, property.enumLabels]);

  const selectedEnumIndex = useMemo(() => {
    if (!enumOptions) {
      return '';
    }
    const match = enumOptions.find((option) => valuesAreEqual(option.value, value));
    return match ? String(match.index) : '';
  }, [enumOptions, value]);
  const selectField = useMemo(() => {
    return {
      ...inputField,
      value: selectedEnumIndex,
      onChange: (event: { target: { value: string } }) => {
        if (!enumOptions) {
          return;
        }
        const optionIndex = Number(event.target.value);
        if (!Number.isInteger(optionIndex) || !enumOptions[optionIndex]) {
          return;
        }
        inputField.onChange(enumOptions[optionIndex].value);
      }
    };
  }, [enumOptions, inputField, selectedEnumIndex]);
  const editorInput = (() => {

    if (enumOptions) {
      return (
        <select
          className={`usePreferencesStoryPropertyEditor${error ? ' hasError' : ''}`}
          {...selectField}
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
      );
    }

    switch (property.type) {
      case 'boolean':
        return (
          <label className="usePreferencesStoryPropertyCheckboxWrap">
            <input type="checkbox" {...inputField} />
            <span>{value === true ? 'true' : 'false'}</span>
          </label>
        );
      case 'array':
      case 'object':
        return (
          <textarea
            {...inputField}
            rows={4}
            className={`usePreferencesStoryPropertyEditor usePreferencesStoryPropertyEditorTextarea${error ? ' hasError' : ''}`}
          />
        );
      case 'number':
        return (
          <input
            type="number"
            {...inputField}
            className={`usePreferencesStoryPropertyEditor${error ? ' hasError' : ''}`}
          />
        );
      case 'string':
      default:
        return (
          <input
            type="text"
            {...inputField}
            className={`usePreferencesStoryPropertyEditor${error ? ' hasError' : ''}`}
          />
        );
    }
  })();

  const resetToInherited = () => {
    if (isDefined) {
      onClear();
      return;
    }

    onDefault();

  };

  return (
    <div
      className={`usePreferencesStoryPropertyCard${isOverriden ? ' isOverridden' : ''}`}
      style={{ '--indent': `${level * 12}px` } as CSSProperties}
    >
      <div className="usePreferencesStoryPropertyMeta">
        {property.type} - {property.scope} - {property.overridable ? 'overridable' : 'locked'}
        {isOverriden ? ' - overridden' : ''}
      </div>
      <div className="usePreferencesStoryPropertyTitle">{propertyTitle}</div>

      {editorInput}

      {errorMessage && (
        <div className="usePreferencesStoryPropertyError">
          {errorMessage}
        </div>
      )}

      {(errorMessage || isOverriden) && (
        <div className="usePreferencesStoryPropertyActions">
          {errorMessage && (
            <button type="button" className="usePreferencesStoryPropertyReset" onClick={() => {
              inputField.onChange(preference.value);
            }}>
              Cancel
            </button>
          )}
          {isOverriden && (
            <button type="button" className="usePreferencesStoryPropertyDefault" onClick={resetToInherited}>
              Reset
            </button>
          )}
        </div>
      )}

    </div>
  );
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
