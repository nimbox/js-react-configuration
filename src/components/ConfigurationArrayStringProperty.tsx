import { FC, FocusEvent, useEffect, useState } from 'react';
import { ArrayStringProperty, StringProperty, ValidationError } from '../types/properties';
import { validateMultiple } from '../utils/validateMultiple';
import { ConfigurationBaseProperty, ConfigurationBasePropertyProps } from './ConfigurationBaseProperty';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import classnames from 'classnames';
import { useTranslation } from 'react-i18next';
import dayjs from 'dayjs';
dayjs.extend(customParseFormat);

export interface ConfigurationArrayStringPropertyProps extends Omit<ConfigurationBasePropertyProps, "onSetDefaultValue" | "onCopyToClipboard" | "onError"> {

    id: string;
    value: string[];

    property: ArrayStringProperty;

    onChange: (Key: string, value: any) => void;

}




export const ConfigurationArrayStringProperty: FC<ConfigurationArrayStringPropertyProps> = ({ id, value, property, onChange }) => {
    const { t } = useTranslation("common");

    const [inputValue, setInputValue] = useState(value);
    const [arrayItems, setArrayItems] = useState<Array<any>>(value);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [previousValue, setPreviousValue] = useState<string>(value);


    const handleSetDefaultValue = () => {
        setErrorMessage(null);
        setArrayItems(property.defaultValue);
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

    const editItem =(key:number)=>{
        console.log('editItem');
    }

    const deleteItem = (key: number)=>{
        arrayItems.splice(key,1);
        onChange(id, [...arrayItems]);
        return setArrayItems([...arrayItems]);
    }
        
    return (
        <ConfigurationBaseProperty
        property={property}
        onSetDefaultValue={handleSetDefaultValue}
        onCopyToClipboard={handleCopyToClipboard}
        onError={errorMessage}>
        <div className="flex-row">
            { arrayItems.map((item,key) => {
                return(<div className="flex flex-row">
                <input type="text"
                key={key}
                value={item}
                onFocus={() => console.log('focus')}
                onKeyDown={handleEscKeyDown}
                onChange={handleChange}
                onBlur={handleBlur}
                className={classnames('p-1 rounded-sm border-2', { 'border-red-500': errorMessage })}
                disabled
                />
                <div onClick={()=>editItem(key)} className="m-1 p-1 flex flex-center rounded-sm align-middle bg-transparent hover:bg-gray-400 cursor-pointer">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                </div>
                <div onClick={()=>deleteItem(key)}  className="m-1 p-0.5 flex flex-center rounded-sm align-middle bg-transparent hover:bg-gray-400 cursor-pointer">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </div>
            </div>)
            }) }
        </div>
    </ConfigurationBaseProperty>
    );

};


const validateLength = (property: StringProperty, value: string): ValidationError | null => {
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

