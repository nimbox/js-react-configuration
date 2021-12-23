import { FC, FocusEvent, useState } from 'react';
import { NumberProperty } from '../../types/properties';
import { ConfigurationBaseProperty, ConfigurationBasePropertyProps } from '../ConfigurationBaseProperty';


export interface ConfigurationNumberPropertyProps extends Omit<ConfigurationBasePropertyProps, "onSetDefaultValue"|"onCopyToClipboard"> { 

    property: NumberProperty;
    value: number;
    id: string;
    onChange: (Key: string, value: any) => void;
    
}

export const ConfigurationNumberProperty: FC<ConfigurationNumberPropertyProps> = ({ id, value, property, onChange }) => {

    const [inputValue, setInputValue] = useState(value)

    const handleBlur: (e: FocusEvent<HTMLInputElement>) => void = (e) => {
        console.log('blur');
        if(property.min!== undefined && property.max!== undefined){
            if(inputValue >= property?.min && inputValue <= property?.max){
                setInputValue(Number(e.target.value))
            }
            else{
                setInputValue(Number(property.defaultValue))
            }
        }
    };

    const handleChange: (e: FocusEvent<HTMLInputElement>) => void = (e) => {
        if(Number(e) === property.defaultValue){
            return setInputValue(Number(e))
        }
        setInputValue(Number(e.target.value));
    }

    return (
        <ConfigurationBaseProperty property={property} onChange={onChange} key={id}>
            <input type="number" onFocus={() => console.log('focus')} onBlur={handleBlur} onChange={handleChange} value={inputValue} min={property.min} max={property.max} className='rounded-sm p-1'/>
        </ConfigurationBaseProperty>
    );

};
