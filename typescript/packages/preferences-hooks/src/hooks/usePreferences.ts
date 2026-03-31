import type { PreferenceProperty } from "@nimbox/preferences";
import { useMemo } from 'react';
import { makeGroups } from './makeGroups';

export type LocalizationMessages = Record<string, Record<string, string>>;

export type UsePreferencesProps = {
    scopes: string[];
    properties: Record<string, PreferenceProperty>;
    propertyPredicate?: (key: string, property: PreferenceProperty) => boolean;
    locale?: string;
    messages?: LocalizationMessages;
    debug?: boolean;
};

export function usePreferences(props: UsePreferencesProps) {

    const { scopes, properties, propertyPredicate, locale, messages, debug = false } = props;

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

    const filteredProperties = useMemo(() => {
        if (!propertyPredicate) {
            return localizedProperties;
        }
        return Object.fromEntries(
            Object.entries(localizedProperties).filter(([key, property]) => propertyPredicate(key, property))
        ) as Record<string, PreferenceProperty>;
    }, [localizedProperties, propertyPredicate]);

    const groups = useMemo(() => {
        const initialGroups = makeGroups(filteredProperties);
        const localizeGroup = (group: (typeof initialGroups)[number]): (typeof initialGroups)[number] => {
            return {
                ...group,
                title: translate(group.key, 'lastSegment'),
                groups: group.groups.map((childGroup) => localizeGroup(childGroup))
            };
        };
        return initialGroups.map((group) => localizeGroup(group));
    }, [filteredProperties, translate]);
    
    return {
        preferences: [],
        scopes,
        properties: filteredProperties,
        groups
    };

}
