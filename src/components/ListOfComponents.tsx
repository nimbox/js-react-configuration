import { FC, useState } from 'react';
import { ConfigurationBooleanProperty } from './ConfigurationBooleanProperty';
import { ConfigurationNumberProperty } from './ConfigurationNumberProperty';
import { ConfigurationStringProperty } from './ConfigurationStringProperty';


const body: Array<JSX.Element> = []

export interface ConfigurationListOfComponents {
    configurations: any;
    values: any;
    onChange: (key: string, value: any) => void
}

export const ConfigurationListOfComponents: FC<ConfigurationListOfComponents> = ({ configurations, values, onChange }) => {

    //    for (var i=0;i<property.property.length;i++){
    //        console.log(property.property[i].type)
    //        switch (property.property[i].type) {
    //            case 'string':
    //                 return(<ConfigurationStringProperty property={property.property[i]} onChange={(property.property[i])}/>);

    //            case 'number':
    //                return(<ConfigurationNumberProperty property={property.property[i]} onChange={(property.property[i])}/>);

    //            case 'boolean':
    //                return(<ConfigurationBooleanProperty property={property.property[i]} onChange={(property.property[i])}/>);

    //        }
    //    }

    for (var i = 0; i < property.property.length; i++) {
        if (property.property[i].type === 'string') {
            console.log('Encontre String')
            body.push(
                <ConfigurationStringProperty property={property.property[i]} onChange={(property.property[i])} />
            )
        }
        else if (property.property[i].type === 'number') {
            body.push(
                <ConfigurationNumberProperty property={property.property[i]} onChange={(property.property[i])} />
            )
        }
        else if (property.property[i].type === 'boolean') {
            body.push(
                <ConfigurationBooleanProperty property={property.property[i]} onChange={(property.property[i])} />
            )
        }
    }

    const getPropertyEditor = (property: any, value, onChange) => {
        switch (property.type) {
            case 'string':
                return (<ConfigurationStringProperty property={property} onChange={onChange} />);

            case 'number':
                return (<ConfigurationNumberProperty property={property} value={value} onChange={onChange} />);

            case 'boolean':
                return (<ConfigurationBooleanProperty property={property} onChange={(property)} />);

        }
    };

    return (
        <div className="flex flex-row">
            <div>
                {configurations.map((configuration) =>
                    <h3>{configuration.title}</h3>
                )}
            </div>
            <div>
                {configurations.map((configuration) => (
                    <div>
                        <h3>{configuration.title}</h3>
                        {configuration.properties.map((key, property) =>
                            <div>
                                {getPropertyEditor(key, values[key], property, onChange)}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );

};
