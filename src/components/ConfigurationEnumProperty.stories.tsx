import { ComponentMeta, ComponentStory } from '@storybook/react';
import { EnumProperty } from '../types/properties';
import { ConfigurationEnumProperty } from './ConfigurationEnumProperty';


export default {
    title: 'Components/EnumProperty',
    component: ConfigurationEnumProperty,
} as ComponentMeta<typeof ConfigurationEnumProperty>;

//
// Stories
//

export const Default: ComponentStory<typeof ConfigurationEnumProperty> = () => {

    const property: EnumProperty = {
        type: "enum",
        title: 'Select Input',
        description: 'Description of a Select input',
		options: ["option1", "option2", 'option3'],
		defaultValue: "option3",
		optionsDescriptions: ["Esta es la opcion 1", "Esta es la opcion 2", "Esta es la opcion 3"]
    };

    const key: string = 'keyTest';
    const value: string = 'option2';

    return (
        <ConfigurationEnumProperty id={key} value={value} property={property} onChange={(property, value) => console.log('Setting', property, 'to', value)} />
    );

};

