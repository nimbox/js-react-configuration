import type { PreferenceProperty } from '@nimbox/preferences';
import { useCallback } from 'react';
import type { ChangeHandler, RefCallback } from '../types';
import type { ScopedValues } from './useInstantEditor';


export interface UsePreferencesFormProps {

    scopes: string[];
    scope: string;
    properties: Record<string, PreferenceProperty>;

    values: ScopedValues;

    onChange: (scope: string, key: string, value: unknown) => void;

}

export type UsePreferencesFormResult = {
    register: UsePreferencesFormRegister
};

export type UsePreferencesFormRegister = (key: string, options?: UsePreferencesFormRegisterOptions) => UsePreferencesFormRegisterResult;
export type UsePreferencesFormRegisterOptions = {};
export type UsePreferencesFormRegisterResult = {
    ref: RefCallback;
    name: string;
    onChange: ChangeHandler;
    onBlur: ChangeHandler;
};


export function usePreferencesForm(_props: UsePreferencesFormProps): UsePreferencesFormResult {

    const register = useCallback<UsePreferencesFormRegister>((key: string, options?: UsePreferencesFormRegisterOptions): UsePreferencesFormRegisterResult => {
        void options;
        return {
            ref: () => {
            },
            name: key,
            onChange: () => {
            },
            onBlur: () => {
            }
        };
    }, []);

    return {
        register
    };

}
