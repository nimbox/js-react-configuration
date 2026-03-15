import { ComponentStory, Meta, Story } from '@storybook/react';
import { NumberPropertyOne, NumberPropertyArray } from '../types/properties';
import { ConfigurationNumberProperty } from './ConfigurationNumberProperty';


export default {
    title: 'Components/NumberProperty',
    component: ConfigurationNumberProperty,
} as Meta;

//
// Stories
//

const NumberTemplate: ComponentStory<any> = (args) => {

    const property = args.property;
    const id = args.id;
    const value = args.value;

    return (
        <ConfigurationNumberProperty id={id} property={property} value={value} onChange={(property, value) => console.log('Setting', property, 'to', value)} />
    )
};

export const NumberOne = NumberTemplate.bind({});
NumberOne.args = { 
    property: { 
        defaultValue: 12,
        type: 'number',
        title: 'Number Field Title',
        min: -10,
        max: 20,
        description: 'Description of a **number** field, click <FONT COLOR="blue">[here](https://www.google.com)</FONT> and go to Google'
    },
    id: 'keyTest',
    value: '15'
};  

export const NumberOneNull = NumberTemplate.bind({});
NumberOneNull.args = {
    property: { 
        defaultValue: 12,
        type: 'number|null',
        title: 'Number Field Title',
        min: -10,
        max: 20,
        description: 'Description of a **number** field, click <FONT COLOR="blue">[here](https://www.google.com)</FONT> and go to Google'
    },
    id: 'keyTest',
    value: '15'
}

export const NumberArray = NumberTemplate.bind({});
NumberArray.args = {
    property: { 
        defaultValue: [15, 20],
        type: 'number[]',
        title: 'Array Number Field Title',
        min: -5,
        max: 20,
        minArrayLength: 2,
        maxArrayLength: 10,
        description: 'Description of a **array number** field, click <FONT COLOR="blue">[here](https://www.google.com)</FONT> and go to Google'
    },
    id: 'keyTest',
    value: [15, 10]
}

export const NumberArrayNull = NumberTemplate.bind({});
NumberArrayNull.args = {
    property: { 
        defaultValue: [15, 20],
        type: 'number[]|null',
        title: 'Array Number Field Title',
        min: -5,
        max: 20,
        minArrayLength: 2,
        maxArrayLength: 10,
        description: 'Description of a **array number** field, click <FONT COLOR="blue">[here](https://www.google.com)</FONT> and go to Google'
    },
    id: 'keyTest',
    value: [15, 10]
}

