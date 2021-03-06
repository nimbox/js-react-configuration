import { ComponentMeta, ComponentStory } from '@storybook/react';
import { BooleanProperty } from '../../types/properties';
import { ConfigurationBooleanProperty } from './ConfigurationBooleanProperty';


export default {
    title: 'Components/BooleanProperty',
    component: ConfigurationBooleanProperty,
} as ComponentMeta<typeof ConfigurationBooleanProperty>;

//
// Stories
//

export const Default: ComponentStory<typeof ConfigurationBooleanProperty> = () => {

    const property: BooleanProperty = {
        defaultValue: false,
        type: 'boolean',
        title: 'Boolean Field Title',
        description: 'Description of a **boolean** field, click <FONT COLOR="blue">[here](https://www.google.com)</FONT> and go to Google'
    };

    const key: string = 'keyTest';
    const value: boolean = true;

    return (
        <ConfigurationBooleanProperty id={key} value={value} property={property} onChange={(property, value) => console.log('Setting', property, 'to', value)} />
    );

};

