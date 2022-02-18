import classnames from 'classnames';
import { FC, FocusEvent, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { NumberPropertyOne, ValidationError } from '../types/properties';
import { validateMultiple } from '../utils/validateMultiple';
import { ConfigurationBaseProperty, ConfigurationBasePropertyProps } from './ConfigurationBaseProperty';



export interface ConfigurationNumberPropertyProps extends Omit<ConfigurationBasePropertyProps, "onSetDefaultValue" | "onCopyToClipboard" | "onError"> {

    id: string;
    value: number;

    property: NumberPropertyOne;
    nullable: boolean;

    onChange: (Key: string, value: any) => void;

}

export const ConfigurationNumberPropertyOne: FC<ConfigurationNumberPropertyProps> = ({ id, value, property, nullable, onChange }) => {
    const { t } = useTranslation("common");

    const [inputValue, setInputValue] = useState<string>(String(value));
    const [errorMessage, setErrorMessage] = useState<string|null>(null);
    const [previousValue, setPreviousValue] = useState<number>(value);


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

    const validate = (value: string) => validateMultiple([validateMagnitude], property, value);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {

        let value: string | null = e.target.value.trim();
        let error: ValidationError|null = null;

        // Ensure that the form only allows numbers.
        if(value === '-'){
            setInputValue(value)
        } else if(!isNaN(Number(value))){
            setInputValue(value)
        } else{
            return null;
        }

        if(nullable){
            if (value.length !== 0) {
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

    const handleBlur = (e: FocusEvent<HTMLInputElement>) => {

        console.log('blur');

        let value: string | null = e.target.value.trim();
        let error: ValidationError|null = null;

        if (nullable) {
            if (Number(value) === 0) {
                onChange(id, null);
            } else{
                error = validate(value);
            }
        } else{
            error = validate(value);
        }

        if (!error) {
            if (Number(value) !== previousValue) {
                setPreviousValue(Number(value) ?? '0');
                if(value === ''){
                    setInputValue('0')
                    onChange(id, 0);
                } else{
                    onChange(id, Number(value));
                }
            }
        }

    };

    const handleEscKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void = (e) => {
        
        if (e.key === 'Escape') {
            setErrorMessage(null);
            setInputValue(String(previousValue));
        }
        
    }

    return (
        <ConfigurationBaseProperty
            property={property}
            onSetDefaultValue={handleSetDefaultValue}
            onCopyToClipboard={handleCopyToClipboard}
            onError={errorMessage}
        >
            {nullable ? <input type="text"
                value={inputValue}
                onFocus={() => console.log('focus')}
                onKeyDown={handleEscKeyDown}
                onChange={handleChange}
                onBlur={handleBlur}
                className={classnames('rounded-sm p-1 border-2', { 'border-red-500': errorMessage })}
            /> : <input type="text"
                value={inputValue}
                onFocus={() => console.log('focus')}
                onKeyDown={handleEscKeyDown}
                onChange={handleChange}
                onBlur={handleBlur}
                className={classnames('rounded-sm p-1 border-2', { 'border-red-500': errorMessage })}
            />}
            
        </ConfigurationBaseProperty>
    );

};

const validateMagnitude = (property: NumberPropertyOne, value: number): ValidationError | null => {
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
