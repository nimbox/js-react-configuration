import { FC, FocusEvent, useState } from 'react';
import { StringProperty } from '../types/properties';
import { ConfigurationBaseProperty, ConfigurationBasePropertyProps } from './ConfigurationBaseProperty';


export interface ConfigurationStringPropertyProps extends Omit<ConfigurationBasePropertyProps, "onSetDefaultValue"|"onCopyToClipboard"> {

    property: StringProperty;
    value: string;
    id: string;
    onChange: (Key: string, value: any) => void;
    
}


export const ConfigurationStringProperty: FC<ConfigurationStringPropertyProps> = ({ id, value, property, onChange }) => {

    const [inputValue, setInputValue] = useState(value)

    const handleSetDefaultValue = ()=>{
        setInputValue(property.defaultValue);
        onChange(id, property.defaultValue)
    }

    const handleCopyToClipboard =()=>{
        navigator.clipboard.writeText(inputValue).then(function () {
            /* clipboard successfully set */
        }, function () {
            /* clipboard write failed */
        });
    }

    const handleChange: (e: FocusEvent<HTMLInputElement>) => void = (e) => {
        setInputValue(e.target.value)
    }

    const handleBlur: (e: FocusEvent<HTMLInputElement>) => void = (e) => {
        
        console.log('blur');

        // If the object has minLength and maxLength constraints, use them, otherwise, simply accept the value.
        if (property.minLength !== undefined && property.maxLength !== undefined) {
            if (inputValue.length >= property?.minLength && inputValue.length <= property?.maxLength) {
                setInputValue(e.target.value)
                // If the user changed the value of the id, call onChange
                if(e.target.value !==  value){
                    onChange(id, inputValue);
                }
            }
            else {
                setInputValue(value)
            }
        }
        else{
            setInputValue(e.target.value)
        }
    };

    return (
        <ConfigurationBaseProperty property={property} onSetDefaultValue={handleSetDefaultValue} onCopyToClipboard={handleCopyToClipboard}>
            <input type="text" onFocus={() => console.log('focus')} onBlur={handleBlur} onChange={handleChange} value={inputValue} className='rounded-sm p-1' />
        </ConfigurationBaseProperty>
    );

};
