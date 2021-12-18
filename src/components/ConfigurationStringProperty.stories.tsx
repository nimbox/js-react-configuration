import { ComponentMeta, ComponentStory } from '@storybook/react';
import { StringProperty } from '../types/properties';
import { ConfigurationStringProperty } from './ConfigurationStringProperty';


export default {
    title: 'Components/StringProperty',
    component: ConfigurationStringProperty,
} as ComponentMeta<typeof ConfigurationStringProperty>;

//
// Stories
//

export const Default: ComponentStory<typeof ConfigurationStringProperty> = () => {

    const property: StringProperty = {
        defaultValue: 'None',
        type: 'string',
        title: 'String Field Title',
        minLength: 4,
        maxLength: 10,
        description: 'Description of a **string** field, click <FONT COLOR="blue">[here](https://www.google.com)</FONT> and go to Google'
    };

    const key: string = 'keyTest';
    const value: string = 'valueTest';

    return (
        <ConfigurationStringProperty key={key} property={property} value={value} onChange={(property, value) => console.log('Setting', property, 'to', value)}/>
    );

};
