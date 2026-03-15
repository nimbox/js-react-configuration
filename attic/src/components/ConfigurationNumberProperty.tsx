import { FC, FocusEvent, useState } from 'react';
import { NumberPropertyOne, NumberPropertyArray } from '../types/properties';
import { ConfigurationNumberPropertyOne } from './ConfigurationNumberPropertyOne';
import { ConfigurationNumberPropertyArray } from './ConfigurationNumberPropertyArray';
import { ConfigurationBaseProperty, ConfigurationBasePropertyProps } from './ConfigurationBaseProperty';



export interface ConfigurationNumberPropertyProps extends Omit<ConfigurationBasePropertyProps, "onSetDefaultValue" | "onCopyToClipboard" | "onError"> {

    id: string;
    value: number | number[];

    property: NumberPropertyOne | NumberPropertyArray;

    onChange: (Key: string, value: any) => void;

}

export const ConfigurationNumberProperty: FC<ConfigurationNumberPropertyProps> = ({ id, value, property, onChange }) => {

    const nullable: boolean = property.type.endsWith('|null');

    if (property.type.startsWith('number[]')) {
        return <ConfigurationNumberPropertyArray nullable={nullable} id={id} property={property as NumberPropertyArray} value={value as number[]} onChange={onChange}/>
    } else if (property.type.startsWith('number')) {
        return <ConfigurationNumberPropertyOne nullable={nullable} id={id} property={property as NumberPropertyOne} value={value as number} onChange={onChange} />
    } else{
        return null;
    }

};

