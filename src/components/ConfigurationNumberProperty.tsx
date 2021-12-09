import { FC } from 'react';
import { NumberProperty } from '../types/properties';
import { ConfigurationBaseProperty } from './ConfigurationBaseProperty';


export interface ConfigurationStringPropertyProps { 

    property: NumberProperty;

}

export const ConfigurationStringProperty: FC<ConfigurationStringPropertyProps> = ({ property }) => {

    return (
        <ConfigurationBaseProperty property={property}>
            <input type="number" />
        </ConfigurationBaseProperty>
    );

};
