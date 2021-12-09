import { FocusEvent, FC } from 'react';
import { StringProperty } from '../types/properties';
import { ConfigurationBaseProperty, ConfigurationBasePropertyProps } from './ConfigurationBaseProperty';


export interface ConfigurationStringPropertyProps extends ConfigurationBasePropertyProps {

    property: StringProperty;

}

export const ConfigurationStringProperty: FC<ConfigurationStringPropertyProps> = ({ property, onChange }) => {

    const handleBlur: (e: FocusEvent<HTMLInputElement>) => void = (e) => {
        console.log('blur');
    };

    return (
        <ConfigurationBaseProperty property={property} onChange={onChange}>
            <input type="text" onFocus={() => console.log('focus')} onBlur={handleBlur} />
        </ConfigurationBaseProperty>
    );

};
