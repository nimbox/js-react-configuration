import { ParseError, isParseError, resolve, type PreferenceValue, type PreferenceProperty } from '@nimbox/preferences';
import { useCallback, useMemo, useState } from 'react';


export type ScopedValues = Record<string, Record<string, unknown>>;
export type DraftEntry = { value: unknown; error?: ParseError };
export type DraftsByScope = Record<string, Record<string, DraftEntry>>;
export type CommitMode = 'onBlur' | 'onChange';
export type RegisterInputType = 'text' | 'textarea' | 'checkbox' | 'raw';

export interface UseInstantEditorOptions {
    scopes: string[];
    scope?: string;
    properties: Record<string, PreferenceProperty>;
    values?: ScopedValues;
    onChange: (scope: string, key: string, value: unknown) => unknown;
}

export interface RegisterOptions {
    commitMode?: CommitMode;
    inputType?: RegisterInputType;
}

export interface RegisterResult {
    name: string;
    value?: string | number | readonly string[];
    checked?: boolean;
    onChange: (eventOrValue: unknown) => void;
    onBlur: () => void;
    onClear: () => void;
    onDefault: () => void;
}

function resolveSelectedScope(scopes: string[], scope?: string): string {
    if (scope && scopes.includes(scope)) {
        return scope;
    }
    return scopes[scopes.length - 1] ?? '';
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

function toParseError(error: unknown, input: unknown, key: string): ParseError {
    if (isParseError(error)) {
        return error;
    }
    return new ParseError([{
        code: 'instant-editor-change-failed',
        input,
        path: [key],
        message: 'validation.persistence.failed'
    }]);
}

function extractInputValue(eventOrValue: unknown): unknown {
    if (
        eventOrValue
        && typeof eventOrValue === 'object'
        && 'target' in (eventOrValue as Record<string, unknown>)
    ) {
        const target = (eventOrValue as { target?: { type?: string; checked?: unknown; value?: unknown } }).target;
        if (target?.type === 'checkbox') {
            return target.checked;
        }
        return target?.value;
    }
    return eventOrValue;
}

function toInputValue(value: unknown): unknown {
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

export function useInstantEditor(options: UseInstantEditorOptions) {

    const { scopes, scope, properties, values, onChange: persistChange } = options;
    const selectedScope = useMemo(() => resolveSelectedScope(scopes, scope), [scopes, scope]);
    const [drafts, setDrafts] = useState<DraftsByScope>({});

    const preferences = useMemo(() => {
        return resolve(scopes, selectedScope, properties, values);
    }, [scopes, selectedScope, properties, values]);

    const errors = useMemo(() => {
        const scopedDrafts = drafts[selectedScope] ?? {};
        return Object.fromEntries(
            Object.entries(scopedDrafts).map(([key, entry]) => [key, entry.error])
        ) as Record<string, ParseError | undefined>;
    }, [drafts, selectedScope]);

    const setDraftValue = useCallback((scopeName: string, key: string, value: unknown) => {
        setDrafts((previous) => updateScopedValue<DraftEntry>(previous, scopeName, key, { value }));
    }, []);

    const clearDraftValue = useCallback((scopeName: string, key: string) => {
        setDrafts((previous) => clearScopedValue(previous, scopeName, key));
    }, []);

    const onChange = useCallback((scopeName: string, key: string, value: unknown) => {
        try {
            const persistedValue = persistChange(scopeName, key, value);
            clearDraftValue(scopeName, key);
            return persistedValue;
        } catch (error) {
            const parseError = toParseError(error, value, key);
            setDrafts((previous) => updateScopedValue<DraftEntry>(previous, scopeName, key, { value, error: parseError }));
            return undefined;
        }
    }, [clearDraftValue, persistChange]);

    const onClear = useCallback((scopeName: string, key: string) => {
        return onChange(scopeName, key, null);
    }, [onChange]);

    const onDefault = useCallback((scopeName: string, key: string) => {
        const fallbackDefault = properties[key]?.default;
        return onChange(scopeName, key, fallbackDefault);
    }, [onChange, properties]);

    const register = useCallback((key: string, registerOptions?: RegisterOptions): RegisterResult => {

        const commitMode = registerOptions?.commitMode ?? 'onBlur';
        const inputType = registerOptions?.inputType ?? 'raw';
        const scopedDraft = drafts[selectedScope]?.[key];
        const preference: PreferenceValue | undefined = preferences[key];
        const fieldValue = scopedDraft ? scopedDraft.value : preference?.value;

        const commit = (nextValue: unknown) => {
            return onChange(selectedScope, key, nextValue);
        };

        const baseResult = {
            name: key,
            onChange: (eventOrValue: unknown) => {
                const nextValue = extractInputValue(eventOrValue);
                setDraftValue(selectedScope, key, nextValue);
                if (commitMode === 'onChange') {
                    void commit(nextValue);
                }
            },
            onBlur: () => {
                if (commitMode !== 'onBlur') {
                    return;
                }
                const draftValue = drafts[selectedScope]?.[key]?.value;
                if (draftValue === undefined) {
                    return;
                }
                void commit(draftValue);
            },
            onClear: () => {
                void onClear(selectedScope, key);
            },
            onDefault: () => {
                void onDefault(selectedScope, key);
            }
        };
        if (inputType === 'checkbox') {
            return {
                ...baseResult,
                checked: fieldValue === true
            };
        }
        return {
            ...baseResult,
            value: toInputValue(fieldValue) as string | number | readonly string[]
        };
    }, [drafts, onChange, onClear, onDefault, preferences, selectedScope, setDraftValue]);

    return useMemo(() => ({
        scope: selectedScope,
        preferences,
        drafts,
        errors,
        register,
        onChange,
        onClear,
        onDefault
    }), [drafts, errors, onChange, onClear, onDefault, preferences, register, selectedScope]);

}
