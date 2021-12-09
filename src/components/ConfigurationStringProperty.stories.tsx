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
        type: 'string',
        title: 'title',
        description: "<bold>description<bold> **en bold** apreta este [link](https://www.google.com) <a>google.com</a> y te lleva a google",
    };

    return (
        <ConfigurationStringProperty property={property}/>
    );

};
