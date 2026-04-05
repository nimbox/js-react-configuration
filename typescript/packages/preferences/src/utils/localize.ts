import { type PreferenceProperty } from '../generated/types';
import { translate, type TranslateOptions } from './translate';


export type LocalizeResult = (property: PreferenceProperty) => PreferenceProperty;

export function localize(
    messages: Record<string, string>,
    options: TranslateOptions = {}
): LocalizeResult {

    const t = translate(messages, options);

    return (property: PreferenceProperty) => {

        const localized: PreferenceProperty = {
            ...property,
            description: t(String(property.description))
        };

        if (property.deprecationMessage) {
            localized.deprecationMessage = t(property.deprecationMessage);
        }
        if (property.patternErrorMessage) {
            localized.patternErrorMessage = t(property.patternErrorMessage);
        }
        if (property.enumLabels) {
            localized.enumLabels = property.enumLabels.map((label) => {
                return t(String(label));
            });
        }
        if (Array.isArray(property.enumDescriptions)) {
            localized.enumDescriptions = property.enumDescriptions.map((messageKey) => {
                return t(String(messageKey));
            });
        }

        return localized;

    };

}
