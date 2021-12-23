import { FC, FocusEvent, useState } from 'react';
import { BooleanProperty } from '../../types/properties';
import { ConfigurationBaseProperty, ConfigurationBasePropertyProps } from '../ConfigurationBaseProperty';


export interface ConfigurationBooleanPropertyProps extends Omit<ConfigurationBasePropertyProps, "onSetDefaultValue"|"onCopyToClipboard"> {

    property: BooleanProperty;
    value: boolean;
    id: string;
    onChange: (Key: string, value: any) => void;

}

export const ConfigurationBooleanProperty: FC<ConfigurationBooleanPropertyProps> = ({ id, value, property, onChange }) => {

    const [inputValue, setInputValue] = useState(value);

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
        <ConfigurationBaseProperty property={property} onChange={onChange} key={id}>
            <input type="checkbox" checked={inputValue} onFocus={() => console.log('focus')} onBlur={handleBlur} onChange={handleChange} className='rounded-sm p-1 h-5 w-5' />
        </ConfigurationBaseProperty>
    );

};
