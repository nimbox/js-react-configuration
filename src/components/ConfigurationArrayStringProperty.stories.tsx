import { ComponentMeta, ComponentStory } from '@storybook/react';
import { ArrayStringProperty } from '../types/properties';
import { ConfigurationArrayStringProperty } from './ConfigurationArrayStringProperty';


export default {
    title: 'Components/ArrayStringProperty',
    component: ConfigurationArrayStringProperty,
} as ComponentMeta<typeof ConfigurationArrayStringProperty>;

//
// Stories
//

export const Default: ComponentStory<typeof ConfigurationArrayStringProperty> = () => {

    const property: ArrayStringProperty = {
        defaultValue: ['None'],
        type: 'string[]',
        title: 'Array String Field Title',
        minArrayLength: 4,
        maxArrayLength: 10,
        description: 'Description of a **array string** field, click <FONT COLOR="blue">[here](https://www.google.com)</FONT> and go to Google'
    };

    const key: string = 'keyTest';
    const value: string[] = ['Xs', 'Hey', 'Hey again'];

    return (
        <ConfigurationArrayStringProperty id={key} property={property} value={value} onChange={(property, value) => console.log('Setting', property, 'to', value)} />
    );

};
