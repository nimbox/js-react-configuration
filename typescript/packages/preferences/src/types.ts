import { PreferenceProperty } from './generated/types';


export interface PropertyGroup {

    kind: 'group';

    key: string;
    title: string;

    children: PropertyNode[];

}

export interface PropertyItem {

    kind: 'item';

    key: string;
    title: string;

    property: PreferenceProperty;

}

export type PropertyNode = PropertyGroup | PropertyItem;

export interface PreferenceValue {

    value: unknown;
    isDefined: boolean;
    isOverriden: boolean;

    inheritedValue: unknown;
    inheritedScope: string | null;

    defaultValue: unknown;
    defaultScope: string;

}
