import { ComponentMeta, ComponentStory } from '@storybook/react';
import { NumberProperty } from '../types/properties';
import { ConfigurationNumberProperty } from './ConfigurationNumberProperty';

export default {
    title: 'Components/NumberProperty',
    component: ConfigurationNumberProperty,
} as ComponentMeta<typeof ConfigurationNumberProperty>;

//
// Stories
//

export const Default: ComponentStory<typeof ConfigurationNumberProperty> = () => {

    const property: NumberProperty = {
        defaultValue: 12,
        type: 'number',
        title: 'Number Field Title',
        min: 10,
        max: 20,
        description: 'Description of a **number** field, click <FONT COLOR="blue">[here](https://www.google.com)</FONT> and go to Google'
    };

    return (
        <ConfigurationNumberProperty property={property} onChange={(property, value) => console.log('Setting', property, 'to', value)}/>
    );

};

