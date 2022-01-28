import React, { FC, FocusEvent, useState } from 'react';
import { ArrayStringProperty, StringProperty, ValidationError } from '../types/properties';
import { validateMultiple } from '../utils/validateMultiple';
import { ConfigurationBaseProperty, ConfigurationBasePropertyProps } from './ConfigurationBaseProperty';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import classnames from 'classnames';
import { useTranslation } from 'react-i18next';
import dayjs from 'dayjs';
dayjs.extend(customParseFormat);

export interface ConfigurationStringPropertyProps extends Omit<ConfigurationBasePropertyProps, "onSetDefaultValue" | "onCopyToClipboard" | "onError"> {

    id: string;
    value: string | string[];

    property: StringProperty | ArrayStringProperty;

    onChange: (Key: string, value: any) => void;

}




export const ConfigurationStringProperty: FC<ConfigurationStringPropertyProps> = ({ id, value, property, onChange }) => {
    const { t } = useTranslation("common");
    const [inputValue, setInputValue] = useState(value);
    const [inputValueItem, setInputValueItem] = useState<Array<any>>(value as string[]);
    const [disabledList, setDisabledList] = useState<boolean[]>(Array(value.length).fill(true));
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [previousValue, setPreviousValue] = useState<string>(String(value));
    

    const handleSetDefaultValue = () => {
        console.log(property.defaultValue)
        setErrorMessage(null);
        if(property.type==='string'){
            setInputValue(String(property.defaultValue));
        } else if(property.type==='string[]'){
            setInputValueItem(property.defaultValue as string[]);
        }
        onChange(id, property.defaultValue);
        console.log(property.defaultValue)
    }

    const handleCopyToClipboard = () => {
        navigator.clipboard.writeText(String(inputValue)).then(function () {
            /* clipboard successfully set */
        }, function () {
            /* clipboard write failed */
        });
    }

    const validate = (value: string) => validateMultiple([validateLength, validatePattern, validateFormat], property, value);

    const handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void = (e) => {
        console.log(property)
        if(property.type === 'string[]'){
            let newInputValueItem: string[] = inputValueItem as string[];
            newInputValueItem[Number(e.target.name)] = e.target.value;
            setInputValueItem(newInputValueItem);
        }

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
        if(property.type==='string'){
            if (!error) {
                if (inputValue !== previousValue) {
                    // inputValue === '' ? null : inputValue;
                    setPreviousValue(String(inputValue));
                    onChange(id, inputValue);
                }
            }
        } else if(property.type==='string[]'){
            if (!error) {
                disabledList.fill(true);
                setDisabledList([...disabledList]);
                onChange(id, inputValueItem);
            }
        }

    };

    const handleEscKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void = (e) => {
        if (e.key === 'Escape') {
            setErrorMessage(null);
            setInputValue(previousValue);
        }
    }

    const editItem: (key:number) => void = (key) => {
        let newDisabledList = disabledList;
        // Make the other inputs disabled.
        if(disabledList.includes(false)){
            let index = disabledList.indexOf(false);
            newDisabledList[index] = !disabledList[index];
        }
        newDisabledList[key] = !disabledList[key];
        setDisabledList([...newDisabledList]);

    }

    const addItem: (e: React.MouseEvent<HTMLElement>) => void = (e) => {
        // Validate if the number of items the user wants is acceptable.
        const inputValueItemDesiredLength = inputValueItem.length+1;
        const error = validateArrayLength(property as ArrayStringProperty, inputValueItemDesiredLength);
        
        if(!error){
            (inputValueItem as string[]).push('');
            disabledList.push(true);
            disabledList.fill(true);
            setDisabledList([...disabledList]);
            setInputValue([...inputValueItem]);
        } else{
            const { message, values } = error;
            setErrorMessage(t(message, values));
        }

    }

    const deleteItem: (key: number) => void = (key) => {
        // Validate if the number of items the user wants is acceptable.
        const inputValueItemDesiredLength = inputValueItem.length-1;
        const error: ValidationError|null = validateArrayLength(property as ArrayStringProperty, inputValueItemDesiredLength);
        
        if(!error){
            (inputValueItem as string[]).splice(key,1);
            disabledList.splice(key,1);
            disabledList.fill(true);
            setDisabledList([...disabledList]);
            onChange(id, [...inputValueItem]);
            setInputValueItem([...inputValueItem]);
        } else{
            const { message, values } = error;
            setErrorMessage(t(message, values));
        }

    }
    
    if(property.type === 'string'){
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
    } else if(property.type === 'string[]' ){
        return(
            <ConfigurationBaseProperty
                property={property}
                onSetDefaultValue={handleSetDefaultValue}
                onCopyToClipboard={handleCopyToClipboard}
                onError={errorMessage}>
                <div className="flex-row">
                    { value ? (inputValueItem as string[]).map((item: string, key: number) => {
                        return(
                            <div className="flex flex-row" key={key}>
                                <input type="text"
                                key={key}
                                name={String(key)}
                                value={inputValueItem[key]}
                                onFocus={() => console.log('focus')}
                                onKeyDown={handleEscKeyDown}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                className={classnames('p-1 rounded-sm border-2', { 'border-red-500': errorMessage })}
                                disabled={disabledList[key]}
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
                            </div>
                        )
                    }) : null }
                <button onClick={addItem} className="bg-blue-500 mt-3 mb-2 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                    Add Element
                </button>
                </div>
            </ConfigurationBaseProperty>
        )
    } else{
        return null;
    }
    
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

const validateArrayLength = (property: ArrayStringProperty, arrayItemsLength: number): ValidationError | null => {
    // To know if the user's desired length is valid.
    if(property.minArrayLength && property.maxArrayLength){
        if(property.maxArrayLength === property.minArrayLength){
            const definedLength = property.maxArrayLength;
            if(arrayItemsLength !== definedLength){
                return { 
                    message: 'property.string[].invalidLength',
                    values: { minArrayLength: property.minArrayLength, maxArrayLength: property.maxArrayLength }
                }
            }
        } 
        else if(arrayItemsLength < property.minArrayLength || arrayItemsLength > property.maxArrayLength) {
            return {
                message: 'property.string[].invalidMinMaxLength',
                values: { minArrayLength: property.minArrayLength, maxArrayLength: property.maxArrayLength }
            }
        }
    }

    if (property.minArrayLength) {
        if (arrayItemsLength < property.minArrayLength) {
            return {
                message: 'property.string[].invalidMinLength',
                values: { minArrayLength: property.minArrayLength }
            };
        }
    }
    if (property.maxArrayLength) {
        if (arrayItemsLength > property.maxArrayLength) {
            return {
                message: 'property.string[].invalidMaxLength',
                values: { maxArrayLength: property.maxArrayLength }
            };
        }
    }

    return null;
}

