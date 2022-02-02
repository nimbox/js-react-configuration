import React, { FC, FocusEvent, useState } from 'react';
import { StringPropertyOne, ValidationError } from '../types/properties';
import { validateMultiple } from '../utils/validateMultiple';
import { ConfigurationBaseProperty, ConfigurationBasePropertyProps } from './ConfigurationBaseProperty';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import classnames from 'classnames';
import { useTranslation } from 'react-i18next';
import dayjs from 'dayjs';
dayjs.extend(customParseFormat);

export interface ConfigurationStringPropertyProps extends Omit<ConfigurationBasePropertyProps, "onSetDefaultValue" | "onCopyToClipboard" | "onError"> {

    id: string;
    value: string;
    
    property: StringPropertyOne;
    nullable: boolean;

    onChange: (Key: string, value: any) => void;

}




export const ConfigurationStringPropertyOne: FC<ConfigurationStringPropertyProps> = ({ id, value, property, nullable, onChange }) => {
    const { t } = useTranslation("common");
    const [inputValue, setInputValue] = useState(value);
    const [errorMessage, setErrorMessage] = useState<string|null>(null);
    const [previousValue, setPreviousValue] = useState<string>(String(value));
    

    const handleSetDefaultValue = () => {
        setErrorMessage(null);
        setInputValue(String(property.defaultValue));
        onChange(id, property.defaultValue);
    }

    const handleCopyToClipboard = () => {
        navigator.clipboard.writeText(String(inputValue)).then(function () {
            /* clipboard successfully set */
        }, function () {
            /* clipboard write failed */
        });
    }

    const validate = (value: string) => validateMultiple([validateLength, validatePattern, validateFormat], property, value);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let error: ValidationError|null = null;
        setInputValue(e.target.value);
        if(nullable){
            if (e.target.value.trim().length !== 0) {
                error = validate(e.target.value);
            }
        } else{
            error = validate(e.target.value);
        }

        if (error) {
            const { message, values } = error;
            setErrorMessage(t(message, values));
        } else {
            setErrorMessage(null);
        }

    };

    const handleBlur = (e: FocusEvent<HTMLInputElement>)  => {
        console.log('blur');
        let error: ValidationError|null = null;
        if (nullable) {
            if (e.target.value.trim().length === 0) {
                return onChange(id, null);
            } else{
                error = validate(e.target.value);
            }
        } else{
            error = validate(e.target.value);
        }
        if (!error) {
            if (e.target.value !== previousValue) {
                setPreviousValue(String(e.target.value));
                return onChange(id, e.target.value);
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
                className={classnames('p-1 rounded-sm border-2', { 'border-red-500': errorMessage })}
                />
        </ConfigurationBaseProperty>
    )
    
};


const validateLength = (property: StringPropertyOne, value: string): ValidationError | null => {
    if(property.minLength && property.maxLength){
        if(property.maxLength === property.minLength){
            const definedLength = property.maxLength;
            if(value.length !== definedLength){
                return { 
                    message: 'property.string.invalidLength',
                    values: { value, minLength: property.minLength, maxLength: property.maxLength }
                }
            }
        } 
        else if(value.length < property.minLength || value.length > property.maxLength) {
            return {
                message: 'property.string.invalidMinMaxLength',
                values: { value, minLength: property.minLength, maxLength: property.maxLength }
            }
        }
    }

    if (property.minLength) {
        if (value.length < property.minLength) {
            return {
                message: 'property.string.invalidMinLength',
                values: { value, minLength: property.minLength }
            };
        }
    }
    if (property.maxLength) {
        if (value.length > property.maxLength) {
            return {
                message: 'property.string.invalidMaxLength',
                values: { value, maxLength: property.maxLength }
            };
        }
    }

    return null;

};

const validatePattern = (property: StringPropertyOne, value: string): ValidationError | null => {

    if (property.pattern) {
        const regexPattern = new RegExp(property.pattern);
        if (!regexPattern.test(value)) {
            if (property.patternErrorMessage) {
                return {
                    message: property.patternErrorMessage,
                    values: { value }
                }
            } else {
                return {
                    message: 'property.string.invalidPattern',
                    values: { value }
                }
            }
        }
    }

    return null;

};

const validateFormat = (property: StringPropertyOne, value: string): ValidationError | null => {

    if (property.format) {

        switch (property.format) {
            case 'date':
                if (!dayjs(value, "YYYY-MM-DD", true).isValid()) {
                    return {
                        message: 'property.string.invalidFormatDate',
                        values: { value }
                    }
                }
                break;
            case 'time':
                if (!dayjs(value, 'HH:mm:ss', true).isValid()) {
                    return {
                        message: 'property.string.invalidFormatTime',
                        values: { value }
                    }
                }
                break;
            case 'datetime':
                if(!dayjs(value, 'MM/DD/YY H:mm:ss A Z', true).isValid()) {
                    return {
                        message: 'property.string.invalidFormatDatetime',
                        values: { value }
                    }
                }
                break;
            case 'uri':
                const uriRegex = /^https?:\/\/[\w\-]+(\.[\w\-]+)+[/#?]?.*$/;
                if (!uriRegex.test(value)) {
                    return {
                        message: 'property.string.invalidFormatUri',
                        values: { value }
                    }
                }
                break;
            case 'ip':
                const ipRegex = /^((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)(\.|$)){4}$/;
                if (!ipRegex.test(value)) {
                    return {
                        message: 'property.string.invalidFormatIp',
                        values: { value }
                    }
                }
                break;
            case 'color':
                const colorRegex = /^#[0-9A-F]{6}$/i;
                if (!colorRegex.test(value)) {
                    return {
                        message: 'property.string.invalidFormatColor',
                        values: { value }
                    }
                }
                break;
            case 'email':
                const emailRegex = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
                if (!emailRegex.test(value)) {
                    return {
                        message: 'property.string.invalidFormatEmail',
                        values: { value }
                    }
                }
                break;
        }

    }

    return null;

}


