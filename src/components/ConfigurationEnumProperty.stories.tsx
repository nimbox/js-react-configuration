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

const EnumTemplate: ComponentStory<any> = (args) => {

    const property = args.property;
    const id = args.id;
    const value = args.value;

    return (
        <ConfigurationEnumProperty id={id} property={property} value={value} onChange={(property, value) => console.log('Setting', property, 'to', value)} />
    )
};

export const Enum = EnumTemplate.bind({});
Enum.args = { 
    property: { 
        type: "enum",
        title: 'Select Input',
        description: 'Description of a Select input',
		options: ["option1", "option2", 'option3'],
		defaultValue: "option3",
		optionsDescriptions: ["Esta es la opcion 1", "Esta es la opcion 2", "Esta es la opcion 3"]
    },
    id: 'keyTest',
    value: 'option2'
}; 

export const EnumNull = EnumTemplate.bind({});
EnumNull.args = { 
    property: { 
        type: "enum|null",
        title: 'Select Input',
        description: 'Description of a Select input',
		options: ["option1", "option2", 'option3'],
		defaultValue: "option3",
		optionsDescriptions: ["Esta es la opcion 1", "Esta es la opcion 2", "Esta es la opcion 3"]
    },
    id: 'keyTest',
    value: 'option2'
}; 

