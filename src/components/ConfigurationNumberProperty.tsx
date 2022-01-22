import classNames from 'classnames';
import {  FC, FocusEvent, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { NumberProperty } from '../types/properties';
import { objectError, validateMultiple } from '../utils/validateMultiple';
import { ConfigurationBaseProperty, ConfigurationBasePropertyProps } from './ConfigurationBaseProperty';



export interface ConfigurationNumberPropertyProps extends Omit<ConfigurationBasePropertyProps, "onSetDefaultValue"|"onCopyToClipboard"|"onError"> { 
    
    id: string;
    value: number;
    
    property: NumberProperty;
    
    onChange: (Key: string, value: any) => void;
    
}

export const ConfigurationNumberProperty: FC<ConfigurationNumberPropertyProps> = ({ id, value, property, onChange }) => {
    const { t, i18n } = useTranslation("common");

    const [inputValue, setInputValue] = useState(value);
    const [errorMessage, setErrorMessage] = useState<string|null>(null);
    const [previousValue, setPreviousValue] = useState<number>(value);


    const handleSetDefaultValue = ()=>{
        setErrorMessage('');
        setInputValue(property.defaultValue);
        onChange(id, property.defaultValue);
    }

    const handleCopyToClipboard =()=>{
        navigator.clipboard.writeText(String(inputValue)).then(function () {
            /* clipboard successfully set */
        }, function () {
            /* clipboard write failed */
        });
    }
    
    const handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void = (e) => {
        setInputValue(Number(e.target.value));
        
        const objectError: objectError|null = validateMultiple([validateMagnitude], property, e.target.value);
        
        if(objectError) {
            let {message, values} = objectError;
            let translatedMessage = t(message, { t: String(Object.values(values)) });
            setErrorMessage('ERROR: '+translatedMessage);
        } else{
            setErrorMessage(null);
        }
    }

    const handleBlur: (e: FocusEvent<HTMLInputElement>) => void = (e) => {
        console.log('blur');
        if(!errorMessage){
            if(inputValue !== previousValue){
                setPreviousValue(inputValue);
                onChange(id, inputValue);
            }
        }
    };
    
    const handleEscKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void = (e) => {
        if (e.key === 'Escape') {
            setErrorMessage(null);
            setInputValue(previousValue);
        }
    }

    return (
        <ConfigurationBaseProperty 
            property={property} 
            onSetDefaultValue={handleSetDefaultValue}
            onCopyToClipboard={handleCopyToClipboard} 
            onError={errorMessage}
        >
            <input type="number"
                value={inputValue} 
                min={property.min} 
                max={property.max} 
                onFocus={() => console.log('focus')} 
                onKeyDown={handleEscKeyDown}
                onChange={handleChange} 
                onBlur={handleBlur} 
                className={classNames('rounded-sm p-1 border-2', { 'border-red-500': errorMessage })} 
            />
        </ConfigurationBaseProperty>
    );

};

const validateMagnitude = (property: NumberProperty, value: number): objectError | null => {
    
    let errorObject:  objectError|null = null;
    
    if (property.min){
        if (value < property.min) {
            errorObject = {
                message: 'property.number.invalidMin',
                values: { min: property?.min } 
            }
        }
    }
    if(property.max){
        if (value > property.max) {
            errorObject = { 
                message: 'property.number.invalidMax', 
                values: { maxLength: property?.max } 
            };
        }
    }

    return errorObject;

};
