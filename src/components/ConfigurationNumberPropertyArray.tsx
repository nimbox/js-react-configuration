import classnames from 'classnames';
import { FC, FocusEvent, useState } from 'react';
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
    const [inputValueItem, setInputValueItem] = useState<number[]>(value);
    const [disabledList, setDisabledList] = useState<boolean[]>(Array(inputValueItem.length).fill(true));
    const [errorMessage, setErrorMessage] = useState<string|null>(null);
    const [previousValue, setPreviousValue] = useState<number[]>(value);


    const handleSetDefaultValue = () => {
        setErrorMessage(null);
        setInputValueItem(property.defaultValue);
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
        let newInputValueItem: any[] = inputValueItem;
      
        if(e.target.value === '-'){
            newInputValueItem[Number(e.target.name)] = e.target.value;
            setInputValueItem([...newInputValueItem]);
        } else if(!isNaN(Number(e.target.value))){
            newInputValueItem[Number(e.target.name)] = Number(e.target.value);
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
        if (!error) {
            disabledList.fill(true);
            setDisabledList([...disabledList]);
            if(nullable && inputValueItem.length === 0) {
                onChange(id, null);
            } else{
                let newArrayItems: number[] = [];
                inputValueItem.forEach((item) => {
                    if(validate(item) === null){
                        newArrayItems.push(item);
                    }
                })
                setInputValueItem(newArrayItems);
                setPreviousValue(newArrayItems);
                onChange(id, newArrayItems);
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
        let newDisabledList = disabledList;
        // Make the other inputs disabled.
        if(disabledList.includes(false)){
            let index = disabledList.indexOf(false);
            newDisabledList[index] = !disabledList[index];
        }
        newDisabledList[key] = !disabledList[key];
        setDisabledList([...newDisabledList]);

    }

    const addItem = (e: React.MouseEvent<HTMLElement>) => {
        // Validate if the number of items the user wants is acceptable.
        let error: ValidationError|null = null;

        const inputValueItemDesiredLength = inputValueItem.length+1;
        error = validateArrayLength(property, inputValueItemDesiredLength);
        
        // If it is nullable, that items are added regardless of validation errors with the
        // length of the Array, because if the array is empty, null must be registered.
        if(nullable){
            if(property.maxArrayLength){
                if(inputValueItemDesiredLength < property.maxArrayLength){
                    inputValueItem.push(0);
                    disabledList.push(true);
                    disabledList.fill(true);
                    setDisabledList([...disabledList]);
                    return setInputValueItem([...inputValueItem]);
                }
            }
        }

        if(!error){
            inputValueItem.push(0);
            disabledList.push(true);
            disabledList.fill(true);
            setDisabledList([...disabledList]);
            return setInputValueItem([...inputValueItem]);
        } else{
            const { message, values } = error;
            setErrorMessage(t(message, values));
            return setTimeout(()=>setErrorMessage(null), 3000);
        }

    }

    const deleteItem: (key: number) => void = (key) => {
        // Validate if the number of items the user wants is acceptable.
        let error: ValidationError|null = null;
        const inputValueItemDesiredLength = inputValueItem.length-1;
        
        // If it is nullable, items are deleted regardless of validation errors with the length
        // of the Array, because if the array is empty, null must be registered.
        if (nullable) {
            if(inputValueItemDesiredLength !== 0){
                error = validateArrayLength(property, inputValueItemDesiredLength);
            }
        } else{
            error = validateArrayLength(property, inputValueItemDesiredLength);
        }
        
        if(!error){
            (inputValueItem).splice(key,1);
            disabledList.splice(key,1);
            disabledList.fill(true);
            setDisabledList([...disabledList]);
            if(nullable && inputValueItemDesiredLength === 0){
                onChange(id, null);
            }
            setInputValueItem([...inputValueItem]);
        } else{
            if(nullable){
                (inputValueItem).splice(key,1);
                disabledList.splice(key,1);
                disabledList.fill(true);
                setDisabledList([...disabledList]);
                setInputValueItem([...inputValueItem]);
            }
            const { message, values } = error;
            setErrorMessage(t(message, values));
            setTimeout(()=>setErrorMessage(null), 3000);
        }

    }

    return(
        <ConfigurationBaseProperty
            property={property}
            onSetDefaultValue={handleSetDefaultValue}
            onCopyToClipboard={handleCopyToClipboard}
            onError={errorMessage}>
            <div className="flex-row">
                { id ? (inputValueItem as number[]).map((item: number, key: number) => {
                    return(
                        <div className="flex flex-row" key={key}>
                            <input type="number"
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
