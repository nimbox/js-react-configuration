import { useMemo, useState } from 'react';
import type { Dispatch, SetStateAction } from 'react';
import type { PreferenceProperty } from '../../../preferences/dist/generated/types';
import type { PreferenceValue } from '../../../preferences/dist/types';
import { parseSafe, ParseError } from '../../../preferences/dist/utils/parse';
import { resolve } from '../../../preferences/dist/utils/resolve';
import type { ChangeHandler, RefCallback, RegisterElement } from '../types';


export interface UseEditorCommitError {
    type: 'commit';
    message: string;
}

export type ParseErrorLike = ParseError | UseEditorCommitError;

export interface UseEditorDraftEntry {
    value: string;
    error: ParseErrorLike | null;
}

export type UseEditorDrafts = Record<string, Record<string, UseEditorDraftEntry>>;

export interface UseEditorProps {

    scope: string;
    scopes: string[];

    properties: Record<string, PreferenceProperty>;
    values: Record<string, Record<string, unknown>>;

    onChange: (scope: string, key: string, value: unknown) => Promise<void>;

}

export interface UserEditorRegisterResult {

    ref: RefCallback;

    name: string;

    onChange: ChangeHandler;
    onBlur: ChangeHandler;

}

export interface UserEditorRegisterOptions {
    mode: 'change' | 'blur';
}

export interface UseEditorResult {

    preferences: Record<string, PreferenceValue>;
    drafts: UseEditorDrafts;

    register: (key: string, options: UserEditorRegisterOptions) => UserEditorRegisterResult;
    reset: (key: string) => void;

}

export function useEditor(props: UseEditorProps): UseEditorResult {

    const { scopes, scope, properties, values, onChange } = props;
    const [drafts, setDrafts] = useState<UseEditorDrafts>({});

    const preferences = useMemo(() => {
        return resolve(scopes, scope, properties, values);
    }, [scopes, scope, properties, values]);

    return {
        preferences,
        drafts,
        register: (key: string, options: UserEditorRegisterOptions) => {
            return {
                name: key,
                ref: (instance) => {

                    if (!instance) {
                        return;
                    }

                    const draftValue = drafts[scope]?.[key]?.value;
                    const value = draftValue ?? preferences[key]?.value;
                    if (instance.type === 'checkbox') {
                        instance.checked = toInputChecked(value);
                        return;
                    }

                    instance.value = toInputValue(value);

                },
                onChange: (event) => {
                    if (options.mode !== 'change') {
                        return;
                    }
                    void commitOnEvent({
                        event,
                        key,
                        scope,
                        property: properties[key],
                        onChange,
                        setDrafts
                    });
                },
                onBlur: (event) => {
                    if (options.mode !== 'blur') {
                        return;
                    }
                    void commitOnEvent({
                        event,
                        key,
                        scope,
                        property: properties[key],
                        onChange,
                        setDrafts
                    });
                },
            };
        },
        reset: (key: string) => {
            setDrafts((currentDrafts) => {
                return clearDraftEntry(currentDrafts, scope, key);
            });
        }
    };

}

// Utils

function toInputChecked(value: unknown): boolean {

    if (typeof value === 'string') {
        return value === 'true';
    }

    return Boolean(value);

}

function toInputValue(value: unknown): string {

    if (value === undefined || value === null) {
        return '';
    }

    if (typeof value === 'string') {
        return value;
    }

    if (typeof value === 'number' || typeof value === 'boolean') {
        return String(value);
    }

    return JSON.stringify(value);

}

async function commitOnEvent(params: {
    event: {
        target: RegisterElement;
    };
    key: string;
    scope: string;
    property: PreferenceProperty | undefined;
    onChange: (scope: string, key: string, value: unknown) => Promise<void>;
    setDrafts: Dispatch<SetStateAction<UseEditorDrafts>>;
}): Promise<void> {

    const { event, key, scope, property, onChange, setDrafts } = params;
    const rawDraftValue = isCheckboxInput(event.target)
        ? String(event.target.checked)
        : String(event.target.value ?? '');
    const rawInputValue: unknown = isCheckboxInput(event.target)
        ? event.target.checked
        : event.target.value;

    if (property) {
        const parseResult = parseSafe(property, rawInputValue);
        if (!parseResult.success) {
            setDrafts((currentDrafts) => {
                return setDraftEntry(currentDrafts, scope, key, {
                    value: rawDraftValue,
                    error: parseResult.error
                });
            });
            return;
        }

        try {
            await onChange(scope, key, parseResult.data);
            setDrafts((currentDrafts) => clearDraftEntry(currentDrafts, scope, key));
        } catch (error) {
            setDrafts((currentDrafts) => {
                return setDraftEntry(currentDrafts, scope, key, {
                    value: rawDraftValue,
                    error: createCommitError(error)
                });
            });
        }
        return;
    }

    try {
        await onChange(scope, key, rawInputValue);
        setDrafts((currentDrafts) => clearDraftEntry(currentDrafts, scope, key));
    } catch (error) {
        setDrafts((currentDrafts) => {
            return setDraftEntry(currentDrafts, scope, key, {
                value: rawDraftValue,
                error: createCommitError(error)
            });
        });
    }

}

function isCheckboxInput(target: RegisterElement): target is HTMLInputElement {
    return target instanceof HTMLInputElement && target.type === 'checkbox';
}

function createCommitError(error: unknown): UseEditorCommitError {

    const message = error instanceof Error
        ? error.message
        : 'Failed to save preference';
    return {
        type: 'commit',
        message
    };

}

function setDraftEntry(
    currentDrafts: UseEditorDrafts,
    scope: string,
    key: string,
    entry: UseEditorDraftEntry
): UseEditorDrafts {

    return {
        ...currentDrafts,
        [scope]: {
            ...(currentDrafts[scope] ?? {}),
            [key]: entry
        }
    };

}

function clearDraftEntry(
    currentDrafts: UseEditorDrafts,
    scope: string,
    key: string
): UseEditorDrafts {

    const scopeDrafts = currentDrafts[scope];
    if (!scopeDrafts || !(key in scopeDrafts)) {
        return currentDrafts;
    }

    const nextScopeDrafts = {
        ...scopeDrafts
    };
    delete nextScopeDrafts[key];

    if (Object.keys(nextScopeDrafts).length === 0) {
        const nextDrafts = {
            ...currentDrafts
        };
        delete nextDrafts[scope];
        return nextDrafts;
    }

    return {
        ...currentDrafts,
        [scope]: nextScopeDrafts
    };

}

