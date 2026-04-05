import { stratify, type ParsePropertyValue, type PropertyNode } from '@nimbox/preferences';
import type { PreferenceProperty } from '../../../preferences/dist/generated/types';
import { useMemo } from 'react';


export interface UsePreferencesProps {

    scopes: string[];
    scope: string;

    properties: Record<string, PreferenceProperty>;
    propertyPredicate?: (key: string, property: PreferenceProperty) => boolean;

    parse?: ParsePropertyValue;
    onChange?: (scope: string, key: string, value: unknown) => void;

    messages?: Record<string, string>;

    debug?: boolean;

};

export interface UsePreferencesResult {

    nodes: PropertyNode[];

}

export function usePreferences(props: UsePreferencesProps): UsePreferencesResult {

    const {
        scopes, scope, properties, messages = {}, debug = false
    } = props;

    const nodes = useMemo(() => {
        return stratify(scopes, scope, properties, messages, { debug });
    }, [scopes, scope, properties, messages, debug]);

    return {
        nodes
    };

}