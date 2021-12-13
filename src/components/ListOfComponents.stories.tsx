import { useMutation } from '@apollo/client';
import { ComponentMeta, ComponentStory } from '@storybook/react';
import { ConfigurationListOfComponents } from './ListOfComponents';


export default {
    title: 'Components/ListOfComponents',
    component: ConfigurationListOfComponents,
} as ComponentMeta<typeof ConfigurationListOfComponents>;

//
// Stories
//

export const Default: ComponentStory<typeof ConfigurationListOfComponents> = () => {

    const configurations: any[] = (
        [
            {
                defaultValue: 'None',
                type: 'string',
                title: 'String Field Title',
                minLength: 4,
                maxLength: 10,
                description: 'Description of a **string** field, click <FONT COLOR="blue">[here](https://www.google.com)</FONT> and go to Google'
            },
            {
                defaultValue: false,
                type: 'boolean',
                title: 'Number Field Title',
                description: 'Description of a **boolean** field, click <FONT COLOR="blue">[here](https://www.google.com)</FONT> and go to Google'
            },
            {
                defaultValue: 12,
                type: 'number',
                title: 'Number Field Title',
                min: 10,
                max: 20,
                description: 'Description of a **number** field, click <FONT COLOR="blue">[here](https://www.google.com)</FONT> and go to Google'
            }
        ]
    );

    const [values, setValues] = useState<any>({});

    const handleChange = (key: string, value: any) => {

        console.log('change property', key, 'to', value);

        // const { [key], ... oldValues} = values;
        // setValues(values, { ...oldValues, [key]: value });

        // Not good!!!
        // values[key] = value;

        setValues(values, { ...values, [key]: value });

    };



    return (
        <ConfigurationListOfComponents
            configurations={configurations}
            values={values}
            onChange={handleChange}
        />
    );

};
