import { FC, FocusEvent, useState } from 'react';
import { NumberProperty } from '../../types/properties';
import { ConfigurationBaseProperty, ConfigurationBasePropertyProps } from '../ConfigurationBaseProperty';


export interface ConfigurationNumberPropertyProps extends Omit<ConfigurationBasePropertyProps, "onSetDefaultValue"|"onCopyToClipboard"|"onError"> { 

    property: NumberProperty;
    value: number;
    id: string;
    onChange: (Key: string, value: any) => void;
    
}

export const ConfigurationNumberProperty: FC<ConfigurationNumberPropertyProps> = ({ id, value, property, onChange }) => {

    const [inputValue, setInputValue] = useState(value);
    const [error, setError] = useState<string>('')
    const [inputColor, setInputColor] = useState('')

    const handleSetDefaultValue = ()=>{
        setInputColor('')
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
            if (inputValue >= property?.min && inputValue <= property?.max) {
                setInputValue(Number(e.target.value))
                setInputColor('')
                // If the user changed the value of the id, call onChange
                if(Number(e.target.value) !==  Number(value)){
                    onChange(id, inputValue);
                }
            }
            else {
                setError(`ERROR: The value must be a number between ${property.min} and ${property.max}.`)
                setTimeout(()=>setError(''), 5000)
                setInputColor('border-red-600')
                setInputValue(Number(e.target.value))
                // setInputValue(value)
            }
        }
        else{
            setInputValue(Number(e.target.value))
            if(Number(e.target.value) !==  value){
                onChange(id, inputValue);
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
        <ConfigurationBaseProperty property={property} onSetDefaultValue={handleSetDefaultValue} onCopyToClipboard={handleCopyToClipboard} onError={error}>
            <input type="number" className={'rounded-sm p-1 border-2 '+inputColor} onFocus={() => console.log('focus')} onBlur={handleBlur} onChange={handleChange} value={inputValue} min={property.min} max={property.max} />
        </ConfigurationBaseProperty>
    );

};
