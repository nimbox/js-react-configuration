import type { PreferenceProperty } from "@nimbox/preferences";
import { useMemo } from 'react';
import { makeGroups } from './makeGroups';

export type UsePreferencesProps = {
    scopes: string[];
    properties: Record<string, PreferenceProperty>;
};

export function usePreferences(props: UsePreferencesProps) {

    const { scopes, properties } = props;

    const groups = useMemo(() => makeGroups(properties), [properties]);
    
    return {
        preferences: [],
        scopes,
        properties,
        groups
    };

}
