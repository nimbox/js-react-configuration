import { FC } from 'react';
import { ConfigurationBooleanProperty } from './Atico/ConfigurationBooleanProperty';
import { ConfigurationNumberProperty } from './Atico/ConfigurationNumberProperty';
import { ConfigurationStringProperty } from './ConfigurationStringProperty';

interface ConfigurationJson{
    title: string;
    properties: string;
}

export interface ConfigurationListOfComponents {
    configurations: Array<ConfigurationJson>;
    values: any;
    onChange: (key: string, value: any) => void
}

export const ConfigurationListOfComponents: FC<ConfigurationListOfComponents> = ({ configurations, values, onChange }) => {
    
    var body: Array<JSX.Element> = []

    // Render depending on type
    const getPropertyEditor = (property: any, value: any, key: string, onChange: (key: string, value: any) => void) => {
        if (property.type === 'string') {
            body.push(
                <ConfigurationStringProperty property={property} id={key} value={value} onChange={onChange} />
            )
        }
        else if (property.type === 'number') {
            body.push(
                <ConfigurationNumberProperty property={property} id={key} value={value} onChange={onChange} />
            )
        }
        else if (property.type === 'boolean') {
            body.push(
                <ConfigurationBooleanProperty property={property} id={key} value={value} onChange={onChange} />
            )
        }
    };

    // Iterate settings and values so that only those that exist in both are rendered (and avoid missing value errors).
    const getProperties = (configs: JSON)=>{
        for(var i=0; i<Object.keys(configs).length; i++){
            for(var j=0; j<Object.keys(values).length;j++){
                if(Object.keys(configs)[i] === Object.keys(values)[j]){
                    console.log(Object.keys(configs)[i], Object.values(values)[j], Object.values(configs)[i]); //Print: key-value-properties in order.
                    getPropertyEditor(Object.values(configs)[i], Object.values(values)[j], Object.keys(configs)[i], onChange)
                }
            }
        }
    }
    // Create an array of titles/sections.
    var arrTitles: Array<string> = [];
    // Create an array of objects containing its properties.
    var arrJSONConfigs: Array<any> = [];

    // Assign values to arrTitles and arrJsonConfigs.
    configurations.forEach((configuration) =>{
        arrJSONConfigs.push(configuration.properties);
        arrTitles.push(configuration.title);
    });

    // Call the function that iterates over values and configs.
    arrJSONConfigs.map((configuration) => (
        getProperties(configuration)
    ))

    return (
        <div className="flex justify-center">
            <div className="grid grid-cols-2 gap-4 content-center justify-evenly w-auto">
                <div className='p-5'>
                    {arrTitles.map((title) =>
                        <h3>{title}</h3>
                    )}
                </div>
                <div className='w-full p-5'>
                    {body}
                </div> 
            </div>
        </div>
    );

};
