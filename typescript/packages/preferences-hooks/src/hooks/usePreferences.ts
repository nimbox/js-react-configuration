import type { PreferenceProperty } from "@nimbox/preferences";
import { useMemo } from 'react';
import { makeGroups } from './makeGroups';

export type UsePreferencesProps = {
    scopes: string[];
    properties: Record<string, PreferenceProperty>;
    propertyPredicate?: (key: string, property: PreferenceProperty) => boolean;
};

export function usePreferences(props: UsePreferencesProps) {

    const { scopes, properties, propertyPredicate } = props;

    const filteredProperties = useMemo(() => {
        if (!propertyPredicate) {
            return properties;
        }
        return Object.fromEntries(
            Object.entries(properties).filter(([key, property]) => propertyPredicate(key, property))
        ) as Record<string, PreferenceProperty>;
    }, [properties, propertyPredicate]);

    const groups = useMemo(() => makeGroups(filteredProperties), [filteredProperties]);
    
    return {
        preferences: [],
        scopes,
        properties: filteredProperties,
        groups
    };

}
