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
                "description": "Description of a **string** field, click <FONT COLOR=\"blue\">[here](https://www.google.com)</FONT> and go to Google"
            },
            "ar.overDueClasses":{
                "defaultValue": false,
                "type": "boolean",
                "title": "Number Field Title",
                "description": "Description of a **boolean** field, click <FONT COLOR=\"blue\">[here](https://www.google.com)</FONT> and go to Google"
            }, 
            "ar.underDueClasses": {
                "defaultValue": 12,
                "type": "number",
                "title": "Number Field Title",
                "min": 10,
                "max": 20,
                "description": "Description of a **number** field, click <FONT COLOR=\"blue\">[here](https://www.google.com)</FONT> and go to Google"
            }
        },
    },
    {
        "title": "Second Title",
        "properties": {
            "br.dueOffset":{
                "defaultValue": "None",
                "type": "string",
                "title": "Second String Field Title",
                "minLength": 4,
                "maxLength": 10,
                "description": "Description of a **string** field, click <FONT COLOR=\"blue\">[here](https://www.google.com)</FONT> and go to Google"
            },
            "br.overDueClasses":{
                "defaultValue": false,
                "type": "boolean",
                "title": "Second Number Field Title",
                "description": "Description of a **boolean** field, click <FONT COLOR=\"blue\">[here](https://www.google.com)</FONT> and go to Google"
            }, 
            "br.underDueClasses": {
                "defaultValue": 12,
                "type": "number",
                "title": "Second Number Field Title",
                "min": 10,
                "max": 20,
                "description": "Description of a **number** field, click <FONT COLOR=\"blue\">[here](https://www.google.com)</FONT> and go to Google"
            }
        },
    }
        ];

    const configurations = JSON.parse(JSON.stringify(objConfig));

    const [values, setValues] = useState<any>({
            "ar.dueOffset": "Some text",
            "ar.overDueClasses": true,
            "ar.underDueClasses": 15,
            "br.dueOffset": "Another",
            "br.overDueClasses": false,
            "br.underDueClasses": 18,

    });

    const handleChange = (key: string, value: any) => {

        console.log('change property', key, 'to', value);

        // const { [key], ... oldValues} = values;
        // setValues(values, { ...oldValues, [key]: value });

        // Not good!!!
        // values[key] = value;

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
