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

    const [inputValue, setInputValue] = useState(value);

    const handleSetDefaultValue = ()=>{
        setInputValue(property.defaultValue);
        onChange(id, property.defaultValue)
    }

    const handleCopyToClipboard =()=>{
        navigator.clipboard.writeText(String(inputValue)).then(function () {
            /* clipboard successfully set */
        }, function () {
            /* clipboard write failed */
        });
    }

    const handleBlur: (e: FocusEvent<HTMLInputElement>) => void = (e) => {
        console.log('blur');
        if(property.min!== undefined && property.max!== undefined){
            if(inputValue >= property?.min && inputValue <= property?.max){
                setInputValue(Number(e.target.value))
                // If the user changed the value of the id, call onChange
                if(Number(e.target.value) !==  Number(value)){
                    onChange(id, inputValue);
                }
            }
            else{
                setInputValue(Number(value))
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
        <ConfigurationBaseProperty property={property} onSetDefaultValue={handleSetDefaultValue} onCopyToClipboard={handleCopyToClipboard}>
            <input type="number" onFocus={() => console.log('focus')} onBlur={handleBlur} onChange={handleChange} value={inputValue} min={property.min} max={property.max} className='rounded-sm p-1'/>
        </ConfigurationBaseProperty>
    );

};
