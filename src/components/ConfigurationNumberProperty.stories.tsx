import { Meta, Story } from '@storybook/react';
import { NumberPropertyOne, NumberPropertyArray } from '../types/properties';
import { ConfigurationNumberProperty } from './ConfigurationNumberProperty';


export default {
    title: 'Components/NumberProperty',
    component: ConfigurationNumberProperty,
} as Meta;

//
// Stories
//


// Number One: 
const propertyNumber: NumberPropertyOne = {
    nullable: false,
    defaultValue: 12,
    type: 'number|null',
    title: 'Number Field Title',
    min: -10,
    max: 20,
    description: 'Description of a **number** field, click <FONT COLOR="blue">[here](https://www.google.com)</FONT> and go to Google'
};
const keyNumber: string = 'keyTest';
const valueNumber: number = 15;

export const NumberOne: Story = (args) => (

    <ConfigurationNumberProperty id={keyNumber} property={propertyNumber} value={valueNumber} onChange={(property, value) => console.log('Setting', property, 'to', value)} />
    
);


 // Number Array: 
const propertyArray: NumberPropertyArray = {
    nullable: false,
    defaultValue: [15, 20],
    type: 'number[]',
    title: 'Array Number Field Title',
    min: 5,
    max: 20,
    minArrayLength: 2,
    maxArrayLength: 10,
    description: 'Description of a **array number** field, click <FONT COLOR="blue">[here](https://www.google.com)</FONT> and go to Google'
};
const keyArray: string = 'keyTest';
const valueArray: number[] = [10, 15];

export const NumberArray: Story = (args) => (

    <ConfigurationNumberProperty id={keyArray} property={propertyArray} value={valueArray} onChange={(property, value) => console.log('Setting', property, 'to', value)} />
    
);

