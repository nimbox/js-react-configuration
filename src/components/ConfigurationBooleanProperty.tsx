import { FC, FocusEvent, useState } from 'react';
import { BooleanProperty } from '../types/properties';
import { ConfigurationBaseProperty, ConfigurationBasePropertyProps } from './ConfigurationBaseProperty';


export interface ConfigurationBooleanPropertyProps extends ConfigurationBasePropertyProps {

    property: BooleanProperty;

}

export const ConfigurationBooleanProperty: FC<ConfigurationBooleanPropertyProps> = ({ property, onChange }) => {

    const [inputValue, setInputValue] = useState(property.defaultValue);

    const handleBlur: (e: FocusEvent<HTMLInputElement>) => void = (e) => {
        console.log('blur');

    };

    const handleChange: (e: FocusEvent<HTMLInputElement>) => void = (e) => {
        if (Boolean(e) === property.defaultValue) {
            return setInputValue(Boolean(e))
        }
        setInputValue(!inputValue);
    }


    return (
        <ConfigurationBaseProperty property={property} onChange={onChange}>
            <input type="checkbox" checked={inputValue} onFocus={() => console.log('focus')} onBlur={handleBlur} onChange={handleChange} className='rounded-sm p-1 h-5 w-5' />
        </ConfigurationBaseProperty>
    );

};
