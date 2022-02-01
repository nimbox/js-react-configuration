import { ComponentMeta, ComponentStory, configure, Meta, storiesOf, Story } from '@storybook/react';
import { StringPropertyArray, StringPropertyOne } from '../types/properties';
import { ConfigurationStringProperty } from './ConfigurationStringProperty';


export default {
    title: 'Components/StringProperty',
    component: ConfigurationStringProperty,
} as Meta;

//
// Stories
//


// StringOne: 
const propertyString: StringPropertyOne = {
    nullable: false,
    defaultValue: 'None',
    type: 'string',
    title: 'String Field Title',
    // minLength: 4,
    format: 'date',
    // maxLength: 12,
    description: 'Description of a **string** field, click <FONT COLOR="blue">[here](https://www.google.com)</FONT> and go to Google'
};
const keyString: string = 'keyTest';
const valueString: string = 'valueTest';

export const StringOne: Story = (args) => (

    <ConfigurationStringProperty id={keyString} property={propertyString} value={valueString} onChange={(property, value) => console.log('Setting', property, 'to', value)} />
    
);


 // String Array: 
const propertyArray: StringPropertyArray = {
    nullable: false,
    defaultValue: ['None'],
    type: 'string[]|null',
    title: 'Array String Field Title',
    minLength: 4,
    maxLength: 12,
    minArrayLength: 2,
    maxArrayLength: 10,
    description: 'Description of a **array string** field, click <FONT COLOR="blue">[here](https://www.google.com)</FONT> and go to Google'
};
const keyArray: string = 'keyTest';
const valueArray: string[] = ['Item1', 'Item2', 'Item3'];

export const StringArray: Story = (args) => (

    <ConfigurationStringProperty id={keyArray} property={propertyArray} value={valueArray} onChange={(property, value) => console.log('Setting', property, 'to', value)} />
    
);

