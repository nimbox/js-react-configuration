import { ParseError, isParseError, parse, type ParsePropertyValue, type PreferenceProperty } from "@nimbox/preferences";
import { useCallback, useMemo } from 'react';
import { buildGroups } from '../utils/buildGroups';

export type LocalizationMessages = Record<string, Record<string, string>>;

export type UsePreferencesProps = {

    scopes: string[];
    scope?: string;

    properties: Record<string, PreferenceProperty>;
    parse?: ParsePropertyValue;
    onChange?: (scope: string, key: string, value: unknown) => void;
    propertyPredicate?: (key: string, property: PreferenceProperty) => boolean;

    locale?: string;
    messages?: LocalizationMessages;

    debug?: boolean;

};

export function usePreferences(props: UsePreferencesProps) {

    const {
        scopes,
        scope,
        properties,
        parse: parsePropertyValue = parse,
        onChange: persistChange,
        propertyPredicate,
        locale,
        messages,
        debug = false
    } = props;

    const localeMessages = useMemo(() => {
        if (!locale) {
            return undefined;
        }
        return messages?.[locale];
    }, [locale, messages]);

    const translate = useMemo(() => {
        return (key: string, fallback: 'key' | 'lastSegment' = 'key') => {
            const translated = localeMessages?.[key];
            if (translated) {
                return translated;
            }
            if (debug && locale) {
                console.warn(`[usePreferences] Missing message for locale="${locale}" key="${key}"`);
            }
            if (fallback === 'lastSegment') {
                const segments = key.split('.').filter(Boolean);
                return segments[segments.length - 1] ?? key;
            }
            return key;
        };
    }, [locale, localeMessages, debug]);

    const localizedProperties = useMemo(() => {
        const entries = Object.entries(properties).map(([propertyKey, property]) => {
            const localizedProperty: PreferenceProperty = {
                ...property,
                __propertyKey: propertyKey,
                description: translate(String(property.description ?? ''), 'lastSegment')
            };
            if (property.deprecationMessage) {
                localizedProperty.deprecationMessage = translate(property.deprecationMessage, 'key');
            }
            if (property.patternErrorMessage) {
                localizedProperty.patternErrorMessage = translate(property.patternErrorMessage, 'key');
            }
            if (property.enumLabels) {
                localizedProperty.enumLabels = property.enumLabels.map((label) => translate(label, 'key'));
            }
            if (Array.isArray(property.enumDescriptions)) {
                localizedProperty.enumDescriptions = property.enumDescriptions.map((messageKey) => {
                    return translate(String(messageKey), 'key');
                });
            }
            return [propertyKey, localizedProperty] as const;
        });
        return Object.fromEntries(entries) as Record<string, PreferenceProperty>;
    }, [properties, translate]);

    const scopeIndex = useMemo(() => {
        return new Map(scopes.map((scopeName, index) => [scopeName, index]));
    }, [scopes]);

    const selectedScope = useMemo(() => {
        if (scope && scopeIndex.has(scope)) {
            return scope;
        }
        return scopes[scopes.length - 1];
    }, [scope, scopeIndex, scopes]);

    const scopeFilteredProperties = useMemo(() => {
        if (!selectedScope) {
            return localizedProperties;
        }
        const selectedScopeIndex = scopeIndex.get(selectedScope);
        if (selectedScopeIndex === undefined) {
            return localizedProperties;
        }
        return Object.fromEntries(
            Object.entries(localizedProperties).filter(([, property]) => {
                const propertyScopeIndex = scopeIndex.get(property.scope);
                if (propertyScopeIndex === undefined) {
                    return false;
                }
                if (propertyScopeIndex === selectedScopeIndex) {
                    return true;
                }
                return propertyScopeIndex < selectedScopeIndex && property.overridable;
            })
        ) as Record<string, PreferenceProperty>;
    }, [localizedProperties, scopeIndex, selectedScope]);

    const filteredProperties = useMemo(() => {
        if (!propertyPredicate) {
            return scopeFilteredProperties;
        }
        return Object.fromEntries(
            Object.entries(scopeFilteredProperties).filter(([key, property]) => propertyPredicate(key, property))
        ) as Record<string, PreferenceProperty>;
    }, [scopeFilteredProperties, propertyPredicate]);

    const groups = useMemo(() => {
        const initialGroups = buildGroups(filteredProperties);
        const localizeGroup = (group: (typeof initialGroups)[number]): (typeof initialGroups)[number] => {
            return {
                ...group,
                title: translate(group.key, 'lastSegment'),
                groups: group.groups.map((childGroup) => localizeGroup(childGroup))
            };
        };
        return initialGroups.map((group) => localizeGroup(group));
    }, [filteredProperties, translate]);

    const onChange = useCallback((targetScope: string, key: string, value: unknown) => {
        const property = properties[key];
        if (!property) {
            throw new ParseError([{
                code: 'property-not-found',
                input: value,
                path: [key],
                message: 'validation.property.notFound'
            }]);
        }

        let parsedValue: unknown;
        try {
            parsedValue = parsePropertyValue(property, value);
        } catch (error) {
            if (isParseError(error)) {
                throw error;
            }
            throw new ParseError([{
                code: 'parse-unexpected',
                input: value,
                path: [key],
                message: 'validation.parse.unexpected'
            }]);
        }

        try {
            persistChange?.(targetScope, key, parsedValue);
        } catch (error) {
            if (isParseError(error)) {
                throw error;
            }
            throw new ParseError([{
                code: 'persistence-failed',
                input: parsedValue,
                path: [key],
                message: 'validation.persistence.failed'
            }]);
        }

        return parsedValue;
    }, [properties, parsePropertyValue, persistChange]);

    return {
        preferences: [],
        scopes,
        scope: selectedScope,
        properties: filteredProperties,
        groups,
        onChange
    };

}
