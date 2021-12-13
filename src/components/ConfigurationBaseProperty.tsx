import { FC, FocusEvent, useState } from 'react';
import { BaseProperty } from '../types/properties';
const { marked } = require('marked');


export interface ConfigurationBasePropertyProps {

    property: BaseProperty<any>;

    onChange: (key: string, value: any) => void;

}

export const ConfigurationBaseProperty: FC<ConfigurationBasePropertyProps> = ({ property, children }) => {

    const [showDropdown, setShowDropdown] = useState(false);

    const callOnChange = () => {
        setShowDropdown(!showDropdown);
        children.props.onChange(property.defaultValue);
    }

    const getMarkdownDescription = () => {
        const parsedDescription = marked.parse(property.description);
        return { __html: parsedDescription }
    }

    const handleBlur: (e: FocusEvent<HTMLInputElement>) => void = (e) => {
        console.log('AFUERA')
        setShowDropdown(false);
    }

    const handleFocus: (e: FocusEvent<HTMLInputElement>) => void = (e) => {
        console.log('DENTRO')
    }

    const copyToClipboard = (e: any) => {
        setShowDropdown(false);
        if (children.props.type === 'checkbox') {
            return navigator.clipboard.writeText(children?.props?.checked).then(function () {
            }, function () {
                /* clipboard write failed */
            })
        }
        navigator.clipboard.writeText(children.props.value).then(function () {
            /* clipboard successfully set */
        }, function () {
            /* clipboard write failed */
        });
    };

    return (
        <div className="group bg-gray-300 p-2.5 w-6/12 m-1">

            <div className="font-bold pt-1.5 pl-1.5">{property.title}</div>
            <div dangerouslySetInnerHTML={getMarkdownDescription()} className='pb-1.5 pl-1.5' />
            <div className='flex justify-start p-1.5'>

                <div className='p-1.5 flex justify-center items-center'>
                    {children}
                </div>

                <div className='p-1.5'>
                    <button onClick={() => { setShowDropdown(!showDropdown) }} type="button" className="inline-flex justify-center rounded-md border border-gray-300 shadow-sm h-full w-full m-0 px-1 py-1 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-100 focus:ring-indigo-500" id="menu-button" aria-expanded="true" aria-haspopup="true">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 hover:text-blue-600 cursor-pointer" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </button>
                </div>

                {showDropdown &&
                    <div className="origin-top-right absolute mt-10 ml-16 w-40 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none" role="menu" aria-orientation="vertical" aria-labelledby="menu-button" tabIndex={-1} onBlur={handleBlur} onFocus={handleFocus}>
                        <div className="py-1" role="none">
                            <a onClick={callOnChange} className="text-gray-700 block px-4 py-2 text-sm cursor-pointer" role="menuitem" tabIndex={-1} id="menu-item-0">Set default values</a>
                            <a onClick={copyToClipboard} className="text-gray-700 block px-4 py-2 text-sm cursor-pointer" role="menuitem" tabIndex={-1} id="menu-item-0">Copy current value</a>
                        </div>
                    </div>
                }

            </div>
        </div>
    );

};
