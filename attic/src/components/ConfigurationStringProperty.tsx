import React, { FC } from 'react';
import { StringPropertyArray, StringPropertyOne } from '../types/properties';
import { ConfigurationStringPropertyOne } from './ConfigurationStringPropertyOne';
import { ConfigurationStringPropertyArray } from './ConfigurationStringPropertyArray';
import { ConfigurationBasePropertyProps } from './ConfigurationBaseProperty';


export interface ConfigurationStringPropertyProps extends Omit<ConfigurationBasePropertyProps, "onSetDefaultValue" | "onCopyToClipboard" | "onError"> {

    id: string;
    value: string | string[];

    property: StringPropertyOne | StringPropertyArray;

    onChange: (Key: string, value: any) => void;

}




export const ConfigurationStringProperty: FC<ConfigurationStringPropertyProps> = ({ id, value, property, onChange }) => {

    const nullable: boolean = property.type.endsWith('|null');
    
    if (property.type.startsWith('string[]')) {
        return <ConfigurationStringPropertyArray nullable={nullable} id={id} property={property as StringPropertyArray} value={value as string[]} onChange={onChange}/>
    } else if (property.type.startsWith('string')) {
        return <ConfigurationStringPropertyOne nullable={nullable} id={id} property={property as StringPropertyOne} value={value as string} onChange={onChange} />
    } else{
        return null;
    }

};
