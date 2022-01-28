import { ComponentMeta, ComponentStory } from '@storybook/react';
import { useState } from 'react';
import { ConfigurationListOfComponents } from './ListOfComponents';
// import * as configurations from '../test/data/configurations.json';

export default {
    title: 'Components/ListOfComponents',
    component: ConfigurationListOfComponents,
} as ComponentMeta<typeof ConfigurationListOfComponents>;

//
// Stories
//

export const Default: ComponentStory<typeof ConfigurationListOfComponents> = () => {

    const objConfig = [
        {
            "title": "First Title",
            "properties": {
                "ar.dueOffset":{
                    "defaultValue": "None",
                    "type": "string",
                    "title": "String Field Title",
                    "minLength": 4,
                    "maxLength": 10,
                    "description": "Value must be between 4 and characters. Description of a **string** field, click <FONT COLOR=\"blue\">[here](https://www.google.com)</FONT> and go to Google"
                }
            },
        },
        {
            "title": "Second Title",
            "properties": {
                "br.overDueClasses":{
                    "defaultValue": "1",
                    "type": "string",
                    "title": "Second String Field Title",
                    "format": "datetime",
                    "description": "Date value must be in the format YYYY-MM-DD. Description of a **boolean** field, click <FONT COLOR=\"blue\">[here](https://www.google.com)</FONT> and go to Google"
                }, 
                "br.underDueClasses": {
                    "defaultValue": "2",
                    "type": "string",
                    "pattern": "[a-zA-Z0-9]{4,10}",
                    "patternMessage": "Must be an identifier with 4 to 10 characters long",
                    "title": "Third string Field Title",
                    "description": "Testing pattern, Must be an identifier with 4 to 10 characters long. Description of a **number** field, click <FONT COLOR=\"blue\">[here](https://www.google.com)</FONT> and go to Google"
                },
                "br.dueOffset": {
                    "defaultValue": ['None'],
                    "type": "string[]",
                    "title": "Array String Field Title",
                    "minLength": "4",
                    "maxLength": "8",
                    "minArrayLength": "2",
                    "maxArrayLength": "10",
                    "description": "Description of a **array string** field, click <FONT COLOR=\"blue\">[here](https://www.google.com)</FONT> and go to Google",
                }
            },
        }
    ];

    const configurations = JSON.parse(JSON.stringify(objConfig));

    const [values, setValues] = useState<any>({
            "ar.dueOffset": "Some text",
            "ar.overDueClasses": true,
            "ar.underDueClasses": 15,
            "br.dueOffset": ['Item 1', 'Item 2', 'Item 3'],
            "br.overDueClasses": "false",
            "br.underDueClasses": 18,

    });

    const handleChange = (key: string, value: any) => {

        console.log('change property', key, 'to', value);

        setValues({ ...values, [key]: value });

    };



    return (
        <ConfigurationListOfComponents
            configurations={configurations}
            values={values}
            onChange={handleChange}
        />
    );

};
