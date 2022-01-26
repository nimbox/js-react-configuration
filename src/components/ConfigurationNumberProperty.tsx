import classNames from 'classnames';
import { FC, FocusEvent, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { NumberProperty, ValidationError } from '../types/properties';
import { validateMultiple } from '../utils/validateMultiple';
import { ConfigurationBaseProperty, ConfigurationBasePropertyProps } from './ConfigurationBaseProperty';



export interface ConfigurationNumberPropertyProps extends Omit<ConfigurationBasePropertyProps, "onSetDefaultValue" | "onCopyToClipboard" | "onError"> {

    id: string;
    value: number;

    property: NumberProperty;

    onChange: (Key: string, value: any) => void;

}

export const ConfigurationNumberProperty: FC<ConfigurationNumberPropertyProps> = ({ id, value, property, onChange }) => {
    const { t } = useTranslation("common");

    const [inputValue, setInputValue] = useState(value);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [previousValue, setPreviousValue] = useState<number>(value);


    const handleSetDefaultValue = () => {
        setErrorMessage(null);
        setInputValue(property.defaultValue);
        onChange(id, property.defaultValue);
    }

    const handleCopyToClipboard = () => {
        navigator.clipboard.writeText(String(inputValue)).then(function () {
            /* clipboard successfully set */
        }, function () {
            /* clipboard write failed */
        });
    }

    const validate = (value: string) => validateMultiple([validateMagnitude], property, value);

    const handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void = (e) => {
        
        setInputValue(Number(e.target.value));
        const error = validate(e.target.value);

        const objectError: ValidationError | null = validateMultiple([validateMagnitude], property, e.target.value);

        if (error) {
            const { message, values } = error;
            setErrorMessage(t(message, values));
        } else {
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

const validateMagnitude = (property: NumberProperty, value: number): ValidationError | null => {
    if(property.min && property.max){
        if(property.max === property.min){
            const definedMagnitude = property.max;
            if(value !== definedMagnitude){
                return { 
                    message: 'property.number.invalidMagnitud',
                    values: { value, magnitude: definedMagnitude}
                }
            }
        } 
        else if(value < property.min || value > property.max) {
            return {
                message: 'property.number.invalidMinMax',
                values: { value, min: property.min, max: property.max }
            }
        }
    }

    if (property.min) {
        if (value < property.min) {
            return {
                message: 'property.number.invalidMin',
                values: { value, min: property.min }
            };
        }
    }
    if (property.max) {
        if (value > property.max) {
            return {
                message: 'property.number.invalidMax',
                values: { value, max: property.max }
            };
        }
    }

    return null;

};
