import { FC, FocusEvent, useState } from 'react';
import { StringProperty } from '../types/properties';
import { ConfigurationBaseProperty, ConfigurationBasePropertyProps } from './ConfigurationBaseProperty';


export interface ConfigurationStringPropertyProps extends ConfigurationBasePropertyProps {

    property: StringProperty;

}


export const ConfigurationStringProperty: FC<ConfigurationStringPropertyProps> = ({ key, value, property, onChange }) => {

    const [inputValue, setInputValue] = useState(property.defaultValue)

    const handleChange: (e: FocusEvent<HTMLInputElement>) => void = (e) => {

        // Validate if e is the defaultValue
        if (String(e) == property.defaultValue) {
            return (setInputValue(String(e)))
        }
        // Validate if the user entered a number
        var matchError = e.target.value.match(/\d+/g);
        if (matchError === null) {
            setInputValue(e.target.value)
        }
        // ONCHANGE...
    }

    const handleBlur: (e: FocusEvent<HTMLInputElement>) => void = (e) => {
        
        console.log('blur');

        // If erorr, setError('number.outOfRange');
        // onChange(property.key, inputValue);

        onChange('ar.months', inputValue);

        if (property.minLength !== undefined && property.maxLength !== undefined) {
            if (inputValue.length >= property?.minLength && inputValue.length <= property?.maxLength) {
                setInputValue(e.target.value)
            }
            else {
                setInputValue(property.defaultValue)
            }
        }
    };

    return (
        <ConfigurationBaseProperty property={property} onChange={onChange}>
            <input type="text" onFocus={() => console.log('focus')} onBlur={handleBlur} onChange={handleChange} value={inputValue} className='rounded-sm p-1' />
        </ConfigurationBaseProperty>
    );

};
