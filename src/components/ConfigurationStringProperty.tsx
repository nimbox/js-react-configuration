import { FC, FocusEvent, useState } from 'react';
import { StringProperty } from '../types/properties';
import { validateMultiple } from '../utils/validateMultiple';
import { ConfigurationBaseProperty, ConfigurationBasePropertyProps } from './ConfigurationBaseProperty';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import classnames from 'classnames';
import { useTranslation } from 'react-i18next';
import {objectError} from '../utils/validateMultiple'
import dayjs from 'dayjs';
dayjs.extend(customParseFormat);

export interface ConfigurationStringPropertyProps extends Omit<ConfigurationBasePropertyProps, "onSetDefaultValue" | "onCopyToClipboard" | "onError"> {
    
    id: string;
    value: string;
    
    property: StringProperty;
    
    onChange: (Key: string, value: any) => void;
    
}




export const ConfigurationStringProperty: FC<ConfigurationStringPropertyProps> = ({ id, value, property, onChange }) => {
    const { t } = useTranslation("common");
    
    const [inputValue, setInputValue] = useState(value);
    const [previousValue, setPreviousValue] = useState<string>(value);
    const [errorMessage, setErrorMessage] = useState<string|null>('');
    

    const handleSetDefaultValue = () => {
        setErrorMessage('');
        setInputValue(property.defaultValue);
        onChange(id, property.defaultValue);
    }

    const handleCopyToClipboard = () => {
        navigator.clipboard.writeText(inputValue).then(function () {
            /* clipboard successfully set */
        }, function () {
            /* clipboard write failed */
        });
    }

    const handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void = (e) => {
        setInputValue(e.target.value);

        const objectError: objectError|null = validateMultiple([validateLength, validatePattern, validateFormat], property, e.target.value);

        if(objectError) {
            let {message, values} = objectError;
            let translatedMessage = t(message, { t: String(Object.values(values)) })
            setErrorMessage('ERROR: '+translatedMessage);
        } else{
            setErrorMessage(null);
        }

    }

    const handleBlur: (e: FocusEvent<HTMLInputElement>) => void = (e) => {
        console.log('blur');
        if (!errorMessage) {
            if (inputValue !== previousValue) {
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
            <input type="text"
                value={inputValue}
                onFocus={() => console.log('focus')}
                onKeyDown={handleEscKeyDown}
                onChange={handleChange}
                onBlur={handleBlur}
                className={classnames('rounded-sm p-1 border-2', { 'border-red-500': errorMessage })}
            />
        </ConfigurationBaseProperty>
    );

};


const validateLength = (property: StringProperty, value: string): objectError|null => {

    let errorObject:  objectError|null = null;

    if (property.minLength) {
        if (value.length < property.minLength) {
            errorObject = { 
                message: 'property.string.invalidMinLength', 
                values: { minLength: property?.minLength } 
            };
        }
    }
    if(property.maxLength){
        if (value.length > property.maxLength) {
            errorObject = { 
                message: 'property.string.invalidMaxLength', 
                values: { maxLength: property?.maxLength } 
            };
        }
    }

    return errorObject;

};

const validatePattern = (property: StringProperty, value: string): objectError|null => {
    let errorObject:  objectError|null = null;
    if (property.pattern) {
        const regexPattern = new RegExp(property.pattern);
        if (!regexPattern.test(value)) {
            if(property.patternMessage){
                return errorObject = {
                    message: 'property.string.invalidPattern',
                    values: { patternMessage: property.patternMessage }
                }
            } else{
                return errorObject = {
                    message: 'property.string.invalidPattern',
                    values: {patternMessage: 'value does not match the pattern' }
                }
            }
        }
    }
    return null;
};

const validateFormat = (property: StringProperty, value: string): objectError|null => {
    let errorObject:  objectError|null = null;
    if (property.format) {
        switch (property.format) {
            case 'date':
                if (!dayjs(value, "YYYY-MM-DD", true).isValid()) {
                    return errorObject = {
                        message: 'property.string.invalidFormatDate',
                        values: { inputValue: value }
                    }
                }
                break;
            case 'time':
                if (!dayjs(value, 'HH:mm:ss', true).isValid()) {
                    return errorObject = {
                        message: 'property.string.invalidFormatTime',
                        values: { inputValue: value }
                    }
                }
                break;
            case 'uri':
                const uriRegex = /^https?:\/\/[\w\-]+(\.[\w\-]+)+[/#?]?.*$/;
                if(!uriRegex.test(value)) {
                    return errorObject = {
                        message: 'property.string.invalidFormatUri',
                        values: { inputValue: value }
                    }
                }
                break;
            case 'ip':
                const ipRegex = /^\b((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)(\.|$)){4}\b/;
                if (!ipRegex.test(value)) {
                    return errorObject = {
                        message: 'property.string.invalidFormatIp',
                        values: { inputValue: value }
                    }
                }
                break;
            case 'color':
                const colorRegex = /^#[0-9A-F]{6}$/i;
                if (!colorRegex.test(value)) {
                    return errorObject = {
                        message: 'property.string.invalidFormatColor',
                        values: { inputValue: value }
                    }
                }
                break;
            case 'email':
                const emailRegex = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
                if (!emailRegex.test(value)) {
                    return errorObject = {
                        message: 'property.string.invalidFormatEmail',
                        values: { inputValue: value }
                    }
                }
                break;
        }
    }
    return null
}

