import { FC, FocusEvent, useState } from 'react';
import { EnumProperty } from '../types/properties';
import { ConfigurationBaseProperty, ConfigurationBasePropertyProps } from './ConfigurationBaseProperty';



export interface ConfigurationEnumPropertyProps extends Omit<ConfigurationBasePropertyProps, "onSetDefaultValue" | "onCopyToClipboard" | "onError"> {

    id: string;
    value: string;

    property: EnumProperty;

    onChange: (Key: string, value: any) => void;

}

export const ConfigurationEnumProperty: FC<ConfigurationEnumPropertyProps> = ({ id, value, property, onChange }) => {

    const [inputValue, setInputValue] = useState(value);
    const [previousValue, setPreviousValue] = useState<string>(value);


    const handleSetDefaultValue = () => {
        setInputValue(property.defaultValue);
        onChange(id, property.defaultValue);
    }

    const handleCopyToClipboard = () => {
        navigator.clipboard.writeText(String(currentDescription)).then(function () {
            /* clipboard successfully set */
        }, function () {
            /* clipboard write failed */
        });
    }

    const handleChange: (e: React.ChangeEvent<HTMLSelectElement>) => void = (e) => {
        
        setInputValue(e.target.value);
        
    }

    const handleBlur: (e: FocusEvent<HTMLSelectElement>) => void = (e) => {
        console.log('blur');
        if (inputValue !== previousValue) {
            setPreviousValue(inputValue);
            onChange(id, inputValue);
        }
    };

    const handleEscKeyDown: (e: React.KeyboardEvent<HTMLSelectElement>) => void = (e) => {
        if (e.key === 'Escape') {
            setInputValue(previousValue);
        }
    }

    //Variable used for the handleCopyToClipboard function to know the current description.
    var currentDescription: string|null = null;
        
    return (
        <ConfigurationBaseProperty
            property={property}
            onSetDefaultValue={handleSetDefaultValue}
            onCopyToClipboard={handleCopyToClipboard}
            onError={null}
            >
            <select         
                value={inputValue}
                onFocus={() => console.log('focus')}
                onKeyDown={handleEscKeyDown}
                onChange={handleChange}
                onBlur={handleBlur}
                className='form-select appearance-none
                block
                w-full
                px-3
                py-1.5
                text-base
                font-normal
                text-gray-700
                bg-white bg-clip-padding bg-no-repeat
                border border-solid border-gray-300
                rounded
                transition
                ease-in-out
                m-0
                focus:text-gray-700 focus:bg-white focus:border-blue-600 focus:outline-none'
                >
                {
                    property.options.map((option, key) =>{
                        if(option === inputValue){
                            currentDescription = property.optionsDescriptions[key];
                        }
                        return <option value={option} key={key}>{property.optionsDescriptions[key]}</option>;
                    })
                }
            </select>
        </ConfigurationBaseProperty>
    );

};

