import { FC, FocusEvent, useState } from 'react';
import { StringProperty } from '../types/properties';
import { validateMultiple } from '../utils/validateMultiple';
import { ConfigurationBaseProperty, ConfigurationBasePropertyProps } from './ConfigurationBaseProperty';
import dayjs from 'dayjs';


export interface ConfigurationStringPropertyProps extends Omit<ConfigurationBasePropertyProps, "onSetDefaultValue" | "onCopyToClipboard" | "onError"> {

    property: StringProperty;
    value: string;
    id: string;
    onChange: (Key: string, value: any) => void;

}


export const ConfigurationStringProperty: FC<ConfigurationStringPropertyProps> = ({ id, value, property, onChange }) => {

    const [inputValue, setInputValue] = useState(value)
    const [errorMessage, setErrorMessage] = useState<string>('')
    const [inputColor, setInputColor] = useState('')
    const [previousValue, setPreviousValue] = useState<string>(value)


    const handleSetDefaultValue = () => {
        setInputColor('');
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

    const validateLength = (property: StringProperty, value: string): string | null => {
        let errorValidation: string = '';
        if (property.minLength !== undefined && property.maxLength !== undefined) {
            if (value.length < property?.minLength) {
                setErrorMessage(`ERROR: The value must be at least ${property?.minLength} characters long`)
                errorValidation = `ERROR: The value must be at least ${property?.minLength} characters long`
            }
            else if (value.length > property?.maxLength) {
                setErrorMessage(`ERROR: The value must have a maximum of ${property?.maxLength} characters.`)
                errorValidation = `ERROR: The value must have a maximum of ${property?.maxLength} characters.`
            }
        }

        if(errorValidation){
            return errorValidation
        }
        else{
            return null
        }

    };

    const validatePattern = (property: StringProperty, value: string): string | null => {
        if (property.pattern && property.patternMessage) {
            const regexValidator = new RegExp(property.pattern)
            console.log(regexValidator)
            if(!regexValidator.test(value)){
                return `ERROR: ${property.patternMessage}.`
            }
        }
        return null;
    };

    const validateFormat = (property: StringProperty, value: string): string | null => {
        if(property.format){
            console.log(property)
            switch (property.format) {
                case 'date':
                    // Check Dayjs, bad result
                    // if (!dayjs(value, 'YYYY-MM-DD').isValid()) {
                    //     return "Date value must be in the format YYYY-MM-DD";
                    // }
                    const date_regex = /((?:19|20)[0-9][0-9])-(0?[1-9]|1[012])-(0?[1-9]|[12][0-9]|3[01])$/;
                    if(!date_regex.test(value)){
                        return "Date value must be in the format YYYY-MM-DD";
                    }
                    break;
                case 'time':
                    // Check Dayjs, bad result
                    // if (!dayjs(value, 'HH:mm:ss').isValid()) {
                    //     return "Time value must be in the format HH:MM:SS";
                    // }
                    const time_regex = /(?:[01]\d|2[0-3]):(?:[0-5]\d):(?:[0-5]\d)/;
                    if(!time_regex.test(value)){
                        return "Time value must be in the format HH:MM:SS";
                    }
                    break;
                case 'ip':
                    const ip_regex = /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/
                    if (ip_regex.test(value)) {
                        return "The value it must be a valid IP direction";
                    }
                break;
                case 'color':
                    if (!/#[0-9A-F]{6}/i.test(value)) {
                        return "mensaje de error";
                    }
                break;
            }
        }
        return null
    }
    
    const handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void = (e) => {
        setInputValue(e.target.value);

        const message = validateMultiple([validateLength, validatePattern, validateFormat], property, e.target.value);

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
            <input type="text" className={'rounded-sm p-1 border-2 ' + inputColor} onFocus={() => console.log('focus')} onBlur={handleBlur} onChange={handleChange} value={inputValue} onKeyDown={escapeButtonHandler} />
        </ConfigurationBaseProperty>
    );

};

