import { FC, FocusEvent, useState } from 'react';
import { StringProperty } from '../types/properties';
import { validateMultiple } from '../utils/validateMultiple';
import { ConfigurationBaseProperty, ConfigurationBasePropertyProps } from './ConfigurationBaseProperty';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import classnames from 'classnames';
import { useTranslation } from 'react-i18next';
import { ValidationError } from '../utils/validateMultiple'
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
    const [errorMessage, setErrorMessage] = useState<string | null>(null);


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


    const validate = (value: string) => validateMultiple([validateLength, validatePattern, validateFormat], property, value);

    const handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void = (e) => {

        setInputValue(e.target.value);
        const error = validate(e.target.value);

        if (error) {
            const { message, values } = error;
            setErrorMessage(t(message, values));
        } else {
            setErrorMessage(null);
        }

    };

    const handleBlur: (e: FocusEvent<HTMLInputElement>) => void = (e) => {

        console.log('blur');
        const error = validate(e.target.value);
        if (!error) {
            if (inputValue !== previousValue) {
                setPreviousValue(inputValue);
                // inputValue === '' ? null : inputValue;
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
                className={classnames('p-1 rounded-sm border-2', { 'border-red-500': errorMessage })}
            />
        </ConfigurationBaseProperty>
    );

};


const validateLength = (property: StringProperty, value: string): ValidationError | null => {

    // return {
    //     message: 'property.string.invalidMinMaxLength',
    //     values: { value, minLength: property.minLength, maxLength: property.maxLength }
    // }

    // return {
    //     message: 'property.string.invalidLength',
    //     values: { value, minLength: property.minLength, maxLength: property.maxLength }
    // }

    if (property.minLength) {
        if (value.length < property.minLength) {
            return {
                message: 'property.string.invalidMinLength',
                values: { minLength: property.minLength }
            };
        }
    }
    if (property.maxLength) {
        if (value.length > property.maxLength) {
            return {
                message: 'property.string.invalidMaxLength',
                values: { maxLength: property.maxLength }
            };
        }
    }

    return null;

};

const validatePattern = (property: StringProperty, value: string): ValidationError | null => {

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

const validateFormat = (property: StringProperty, value: string): ValidationError | null => {

    if (property.format) {

        switch (property.format) {
            case 'date':
                if (!dayjs(value, "YYYY-MM-DD", true).isValid()) {
                    return {
                        message: 'property.string.invalidFormatDate',
                        values: { inputValue: value }
                    }
                }
                break;
            case 'time':
                if (!dayjs(value, 'HH:mm:ss', true).isValid()) {
                    return {
                        message: 'property.string.invalidFormatTime',
                        values: { inputValue: value }
                    }
                }
                break;
            case 'uri':
                const uriRegex = /^https?:\/\/[\w\-]+(\.[\w\-]+)+[/#?]?.*$/;
                if (!uriRegex.test(value)) {
                    return {
                        message: 'property.string.invalidFormatUri',
                        values: { inputValue: value }
                    }
                }
                break;
            case 'ip':
                const ipRegex = /^((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)(\.|$)){4}$/;
                if (!ipRegex.test(value)) {
                    return {
                        message: 'property.string.invalidFormatIp',
                        values: { inputValue: value }
                    }
                }
                break;
            case 'color':
                const colorRegex = /^#[0-9A-F]{6}$/i;
                if (!colorRegex.test(value)) {
                    return {
                        message: 'property.string.invalidFormatColor',
                        values: { inputValue: value }
                    }
                }
                break;
            case 'email':
                const emailRegex = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
                if (!emailRegex.test(value)) {
                    return {
                        message: 'property.string.invalidFormatEmail',
                        values: { inputValue: value }
                    }
                }
                break;
        }

    }

    return null;

}

