import type { PreferenceProperty } from '@nimbox/preferences';
import type { UsePreferencesFormResult } from '../../hooks/usePreferencesForm';


export type PropertyCardProps = {

    level: number;

    property: PreferenceProperty;
    form: UsePreferencesFormResult;

}

export function PropertyCard(props: PropertyCardProps) {
    return (
        <div>
            INPUT
        </div>
    );
}