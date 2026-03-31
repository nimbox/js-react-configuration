import { PreferenceProperty } from './generated/types';

export interface PropertyGroup {

    key: string;
    title: string;

    groups: PropertyGroup[];
    properties: PreferenceProperty[];

}
