import { ComponentStory, Meta, storiesOf, Story } from '@storybook/react';
import { StringPropertyArray, StringPropertyOne } from '../types/properties';
import { ConfigurationStringProperty } from './ConfigurationStringProperty';


export default {
    title: 'Components/StringProperty',
    component: ConfigurationStringProperty,
} as Meta;

//
// Stories 
//

const StringTemplate: ComponentStory<any> = (args) => {

    const property = args.property;
    const id = args.id;
    const value = args.value;

    return (
        <ConfigurationStringProperty id={id} property={property} value={value} onChange={(property, value) => console.log('Setting', property, 'to', value)} />
    )
};

export const StringOne = StringTemplate.bind({});
StringOne.args = { 
    property: { 
        defaultValue: 'None',
        type: 'string',
        title: 'String Field Title',
        minLength: 4,
        maxLength: 12,
        description: 'Description of a **string** field, click <FONT COLOR="blue">[here](https://www.google.com)</FONT> and go to Google'
    },
    id: 'keyTest',
    value: 'default'
};  

export const StringOneNull = StringTemplate.bind({});
StringOneNull.args = {
    property: { 
        defaultValue: 'None',
        type: 'string|null',
        title: 'String Field Title',
        minLength: 4,
        maxLength: 12,
        description: 'Description of a **string** field, click <FONT COLOR="blue">[here](https://www.google.com)</FONT> and go to Google'
    },
    id: 'keyTest',
    value: 'default'
}

export const StringArray = StringTemplate.bind({});
StringArray.args = {
    property: { 
        defaultValue: ['None'],
        type: 'string[]',
        title: 'Array String Field Title',
        minLength: 4,
        maxLength: 12,
        minArrayLength: 2,
        maxArrayLength: 5,
        description: 'Description of a **array string** field, click <FONT COLOR="blue">[here](https://www.google.com)</FONT> and go to Google'
    },
    id: 'keyTest',
    value: ['Item1', 'Item2', 'Item3']
}

export const StringArrayNull = StringTemplate.bind({});
StringArrayNull.args = {
    property: { 
        defaultValue: ['None'],
        type: 'string[]|null',
        title: 'Array String Field Title',
        minLength: 4,
        maxLength: 12,
        minArrayLength: 2,
        maxArrayLength: 5,
        description: 'Description of a **array string** field, click <FONT COLOR="blue">[here](https://www.google.com)</FONT> and go to Google'
    },
    id: 'keyTest',
    value: ['Item1', 'Item2', 'Item3']
}

