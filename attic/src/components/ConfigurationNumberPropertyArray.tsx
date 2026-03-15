import classnames from 'classnames';
import React, { FC, FocusEvent, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { NumberPropertyArray, ValidationError } from '../types/properties';
import { validateMultiple } from '../utils/validateMultiple';
import { ConfigurationBaseProperty, ConfigurationBasePropertyProps } from './ConfigurationBaseProperty';



export interface ConfigurationNumberPropertyProps extends Omit<ConfigurationBasePropertyProps, "onSetDefaultValue" | "onCopyToClipboard" | "onError"> {

    id: string;
    value: number[];

    property: NumberPropertyArray;
    nullable: boolean;

    onChange: (Key: string, value: any) => void;

}

export const ConfigurationNumberPropertyArray: FC<ConfigurationNumberPropertyProps> = ({ id, value, property, nullable, onChange }) => {
    
    const { t } = useTranslation("common");

    const initValue: string[] = [];
    Array(value.length).fill(value.forEach((item)=>initValue.push(String(item))))
    const [inputValueItem, setInputValueItem] = useState<string[]>(initValue);
    const [errorMessage, setErrorMessage] = useState<string|null>(null);
    const [previousValue, setPreviousValue] = useState<string[]>(initValue);
    const [inputIndex, setInputIndex] = useState<number|null>(null);
    const [disabledAddButton, setDisabledAddButton] = useState<boolean>(false);
    const [disabledDeleteButton, setDisabledDeleteButton] = useState<boolean>(value.length === property?.minArrayLength && !nullable ? true : false);


    const handleSetDefaultValue = () => {

        setDisabledAddButton(false);
        setErrorMessage(null);

        const newInputValues: string[] = [];
        property.defaultValue.map((item)=>{
            newInputValues.push(String(item))
        })
        setInputValueItem(newInputValues);

        onChange(id, property.defaultValue);
    }

    const handleCopyToClipboard = () => {
        navigator.clipboard.writeText(String(inputValueItem)).then(function () {
            /* clipboard successfully set */
        }, function () {
            /* clipboard write failed */
        });
    }

    const validate = (value: number) => validateMultiple([validateMagnitude], property, value);

    const handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void = (e) => {
        
        let newInputValueItem: string[] = inputValueItem;
      
        if(e.target.value === '-'){
            newInputValueItem[Number(e.target.name)] = e.target.value;
            setInputValueItem([...newInputValueItem]);
        } else if(!isNaN(Number(e.target.value))){
            newInputValueItem[Number(e.target.name)] = String(e.target.value);
            setInputValueItem([...newInputValueItem]);
        } else{
            return null;
        }

        const error = validate(Number(e.target.value));

        if (error) {
            const { message, values } = error;
            setErrorMessage(t(message, values));
        } else {
            setErrorMessage(null);
        }
        
    }

    const handleBlur: (e: FocusEvent<HTMLInputElement>) => void = (e) => {
        
        console.log('blur');
        
        const error = validate(Number(e.target.value));
        const errorArrayLength = validateArrayLength(property, inputValueItem.length);


        if (!error) {
            setInputIndex(null);
            setDisabledAddButton(false);

            // If the length of the array is the maximun, the add items button is blocked.
            if(property.maxArrayLength){
                if(inputValueItem.length === property.maxArrayLength){
                    setDisabledAddButton(true);
                }
            }
            
            let newArrayItems: string[] = [];
            inputValueItem.forEach((item) => {
                if(validate(Number(item)) === null){
                    if(item === ''){
                        newArrayItems.push('0');
                    } else{
                        newArrayItems.push(String(item));
                    }
                }
            })
            setInputValueItem(newArrayItems);
            setPreviousValue(newArrayItems);

            // The only way it will send data to the backend is if
            // (in order) the data for each item is validated and 
            // the number of items is correct (if it has to be validated at all).
            if(!errorArrayLength){
                onChange(id, newArrayItems.map(item => Number(item)));
            } else{
                const { message, values } = errorArrayLength;
                setErrorMessage(t(message, values));;
            }
            
        }
    };

    const handleEscKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void = (e) => {
        
        if (e.key === 'Escape') {
            setErrorMessage(null);
            setInputValueItem(previousValue);
        }
    
    }

    const editItem: (key:number) => void = (key) => {
        setInputIndex(key);
    }

    const addItem = (e: React.MouseEvent<HTMLElement>) => {
        // Validate if the number of items the user wants is acceptable.
        let error: ValidationError|null = null;

        const inputValueItemDesiredLength = inputValueItem.length+1;
        error = validateArrayLength(property, inputValueItemDesiredLength);

        if(!error){
            inputValueItem.push('');
            setDisabledDeleteButton(false);
            setDisabledAddButton(true);
            setInputIndex(inputValueItem.length-1);
            setInputValueItem([...inputValueItem]);
        } else{
            const { message, values } = error;
            setErrorMessage(t(message, values));

            // If it is nullable, that items are added regardless of validation errors with the
            // length of the Array, because if the array is empty, null must be registered.
            if(nullable){
                if(property.maxArrayLength){
                    if(inputValueItemDesiredLength < property.maxArrayLength){
                        inputValueItem.push('');
                        setInputValueItem([...inputValueItem]);
                        setInputIndex(inputValueItem.length-1);
                    }
                }
            }
        }

    }

    const deleteItem: (key: number) => void = (key) => {
        // Validate if the number of items the user wants is acceptable.
        let error: ValidationError|null = null;
        const inputValueItemDesiredLength = inputValueItem.length - 1;
        
        // If it is nullable, items are deleted regardless of validation errors with the length
        // of the Array, because if the array is empty, null must be registered.
        if (nullable) {
            if(inputValueItemDesiredLength !== 0){
                error = validateArrayLength(property, inputValueItemDesiredLength);
            }
        } else{
            error = validateArrayLength(property, inputValueItemDesiredLength);
        }

        if(!nullable) {
            if(property.minArrayLength){
                if(inputValueItemDesiredLength === property.minArrayLength){
                    setDisabledDeleteButton(true);
                }
            }
        }
        
        if(!error){
            setDisabledAddButton(false);
            inputValueItem.splice(key,1);
            if(nullable && inputValueItemDesiredLength === 0){
                setErrorMessage(null);
                onChange(id, null);
            } else{
                onChange(id, [...inputValueItem])
            }
            setInputValueItem([...inputValueItem]);
        } else{
            if(nullable){
                inputValueItem.splice(key,1);
                setInputValueItem([...inputValueItem]);
            }
            const { message, values } = error;
            setErrorMessage(t(message, values));
        }

    }

    return(
        <ConfigurationBaseProperty
            property={property}
            onSetDefaultValue={handleSetDefaultValue}
            onCopyToClipboard={handleCopyToClipboard}
            onError={errorMessage}>
            <div className="flex-row">
                { id ? inputValueItem.map((item: string, key: number) => {
                    return(
                        <div className="flex flex-row" key={key}>
                            { inputIndex === key ? 
                                <input type="text"
                                    autoFocus
                                    key={key}
                                    ref={React.createRef()}
                                    name={String(key)}
                                    value={inputValueItem[key]}
                                    onFocus={() => console.log('focus')}
                                    onKeyDown={handleEscKeyDown}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    className={classnames('p-1 rounded-sm border-2', { 'border-red-500': errorMessage })}
                                /> 
                                : 
                                <div>
                                    {inputValueItem[key]}
                                </div> 
                            }
                            <div onClick={()=>editItem(key)} className="m-1 p-1 flex flex-center rounded-sm align-middle bg-transparent hover:bg-gray-400 cursor-pointer">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                </svg>
                            </div>
                            { disabledDeleteButton ? '' : 
                            <div onClick={() => deleteItem(key)} className="m-1 p-0.5 flex flex-center rounded-sm align-middle bg-transparent hover:bg-gray-400 cursor-pointer">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </div>
                            }
                        </div>
                    )
                }) : null }
                <button onClick={addItem} disabled={disabledAddButton} className={classnames({'bg-blue-500 hover:bg-blue-700': !disabledAddButton}, ' mt-3 mb-2 text-white font-bold py-2 px-4 rounded', { 'bg-gray-500 hover:bg-gray-500 cursor-not-allowed': disabledAddButton })}>
                    Add Element
                </button>
            </div>
        </ConfigurationBaseProperty>
    );

};

const validateMagnitude = (property: NumberPropertyArray, value: number): ValidationError | null => {
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

const validateArrayLength = (property: NumberPropertyArray, arrayItemsLength: number): ValidationError | null => {
    // To know if the user's desired length is valid.
    if(property.minArrayLength && property.maxArrayLength){
        if(property.maxArrayLength === property.minArrayLength){
            const definedLength = property.maxArrayLength;
            if(arrayItemsLength !== definedLength){
                return { 
                    message: 'property.number[].invalidLength',
                    values: { minArrayLength: property.minArrayLength, maxArrayLength: property.maxArrayLength }
                }
            }
        } 
        else if(arrayItemsLength < property.minArrayLength || arrayItemsLength > property.maxArrayLength) {
            return {
                message: 'property.number[].invalidMinMaxLength',
                values: { minArrayLength: property.minArrayLength, maxArrayLength: property.maxArrayLength }
            }
        }
    }

    if (property.minArrayLength) {
        if (arrayItemsLength < property.minArrayLength) {
            return {
                message: 'property.number[].invalidMinLength',
                values: { minArrayLength: property.minArrayLength }
            };
        }
    }
    if (property.maxArrayLength) {
        if (arrayItemsLength > property.maxArrayLength) {
            return {
                message: 'property.number[].invalidMaxLength',
                values: { maxArrayLength: property.maxArrayLength }
            };
        }
    }

    return null;
}
