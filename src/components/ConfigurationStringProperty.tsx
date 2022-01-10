import { FC, FocusEvent, useState } from 'react';
import { StringProperty } from '../types/properties';
import { ConfigurationBaseProperty, ConfigurationBasePropertyProps } from './ConfigurationBaseProperty';


export interface ConfigurationStringPropertyProps extends Omit<ConfigurationBasePropertyProps, "onSetDefaultValue"|"onCopyToClipboard"|"onError"> {

    property: StringProperty;
    value: string;
    id: string;
    onChange: (Key: string, value: any) => void;
    
}


export const ConfigurationStringProperty: FC<ConfigurationStringPropertyProps> = ({ id, value, property, onChange }) => {

    const [inputValue, setInputValue] = useState(value)
    const [error, setError] = useState<string>('')
    const [inputColor, setInputColor] = useState('')
    

    const handleSetDefaultValue = ()=>{
        setInputColor('')
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
                setInputColor('')
                // If the user changed the value of the id, call onChange
                if(e.target.value !==  value){
                    onChange(id, inputValue);
                }
            }
            else if(inputValue.length < property?.minLength){
                setError(`ERROR: The value must be at least ${property?.minLength} characters long`)
                setTimeout(()=>setError(''), 5000)
                setInputColor('border-red-600')
                setInputValue(e.target.value)
                // setInputValue(value)
            }
            else if(inputValue.length > property?.maxLength){
                setError(`ERROR: The value must have a maximum of ${property?.maxLength} characters.`)
                setTimeout(()=>setError(''), 5000)
                setInputColor('border-red-600')
                setInputValue(e.target.value)
                // setInputValue(value)
            }
        }
        else{
            setInputValue(e.target.value)
            if(e.target.value !==  value){
                onChange(id, inputValue);
            }
        }
    };

    return (
        <ConfigurationBaseProperty property={property} onSetDefaultValue={handleSetDefaultValue} onCopyToClipboard={handleCopyToClipboard} onError={error}>
            <input type="text" className={'rounded-sm p-1 border-2 '+inputColor} onFocus={() => console.log('focus')} onBlur={handleBlur} onChange={handleChange} value={inputValue}  />
        </ConfigurationBaseProperty>
    );

};
