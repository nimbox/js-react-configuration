import { ComponentMeta, ComponentStory } from '@storybook/react';
import { ArrayStringProperty, StringProperty } from '../types/properties';
import { ConfigurationStringProperty } from './ConfigurationStringProperty';


export default {
    title: 'Components/StringProperty',
    component: ConfigurationStringProperty,
} as ComponentMeta<typeof ConfigurationStringProperty>;

//
// Stories
//

export const Default: ComponentStory<typeof ConfigurationStringProperty> = () => {

    // const property: StringProperty = {
    //     defaultValue: 'None',
    //     type: 'string',
    //     title: 'String Field Title',
    //     minLength: 4,
    //     maxLength: 10,
    //     description: 'Description of a **string** field, click <FONT COLOR="blue">[here](https://www.google.com)</FONT> and go to Google'
    // };
    // const key: string = 'keyTest';
    // const value: string = 'valueTest';

    const property: ArrayStringProperty = {
        defaultValue: ['None'],
        type: 'string[]',
        title: 'Array String Field Title',
        minLength: 4,
        maxLength: 8,
        minArrayLength: 2,
        maxArrayLength: 10,
        description: 'Description of a **array string** field, click <FONT COLOR="blue">[here](https://www.google.com)</FONT> and go to Google'
    };
    const key: string = 'keyTest';
    const value: string[] = ['Xs', 'Hey', 'Hey again'];

    return (
        <ConfigurationStringProperty id={key} property={property} value={value} onChange={(property, value) => console.log('Setting', property, 'to', value)} />
    );

};
