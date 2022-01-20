import {  FC, FocusEvent, useState } from 'react';
import { NumberProperty } from '../../types/properties';
import { validateMultiple } from '../../utils/validateMultiple';
import { ConfigurationBaseProperty, ConfigurationBasePropertyProps } from '../ConfigurationBaseProperty';



export interface ConfigurationNumberPropertyProps extends Omit<ConfigurationBasePropertyProps, "onSetDefaultValue"|"onCopyToClipboard"|"onError"> { 

    property: NumberProperty;
    value: number;
    id: string;
    onChange: (Key: string, value: any) => void;
    
}

export const ConfigurationNumberProperty: FC<ConfigurationNumberPropertyProps> = ({ id, value, property, onChange }) => {

    const [inputValue, setInputValue] = useState(value);
    const [errorMessage, setErrorMessage] = useState<string>('')
    const [inputColor, setInputColor] = useState('')
    const [previousValue, setPreviousValue] = useState<number>(value)


    const handleSetDefaultValue = ()=>{
        setInputColor('');
        setErrorMessage('');
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

    const validateLength = (property: NumberProperty, value: number): string | null => {
        let errorValidation: string = '';
        if (property.min !== undefined && property.max !== undefined) {
            if (value < property?.min) {
                setErrorMessage(`ERROR: The value must be at least ${property?.min}.`)
                errorValidation = `ERROR: The value must be at least ${property?.min}.`
            }
            else if (value > property?.max) {
                setErrorMessage(`ERROR: The value must have a maximum of ${property?.max}.`)
                errorValidation = `ERROR: The value must have a maximum of ${property?.max}.`
            }
        }

        if(errorValidation){
            return errorValidation
        }
        else{
            return null
        }

    };

    
    const handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void = (e) => {
        setInputValue(Number(e.target.value));
        
        const message = validateMultiple([validateLength], property, e.target.value);
        
        if(message){
            setErrorMessage(message)
            setInputColor('border-red-600')
        }
        else{
            setErrorMessage('')
            setInputColor('')
        }
    }

    const handleBlur: (e: FocusEvent<HTMLInputElement>) => void = (e) => {
        console.log('blur');
        if(inputValue != previousValue){
            if(!errorMessage){
                setPreviousValue(inputValue)
                onChange(id, inputValue);
            }
        }
    };
    
    const escapeButtonHandler: (e: React.KeyboardEvent<HTMLInputElement>) => void = (e) => {
        const keyboardButton = e.which || e.keyCode;
        if(keyboardButton === 27){
            setInputColor('');
            setErrorMessage('');
            setInputValue(previousValue);
        }
    }

    return (
        <ConfigurationBaseProperty property={property} onSetDefaultValue={handleSetDefaultValue} onCopyToClipboard={handleCopyToClipboard} onError={errorMessage}>
            <input type="number" className={'rounded-sm p-1 border-2 '+inputColor} onFocus={() => console.log('focus')} onBlur={handleBlur} onChange={handleChange} value={inputValue} min={property.min} max={property.max}  onKeyDown={escapeButtonHandler}/>
        </ConfigurationBaseProperty>
    );

};
