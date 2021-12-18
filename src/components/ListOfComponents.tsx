import { FC, useState } from 'react';
import { ConfigurationBooleanProperty } from './ConfigurationBooleanProperty';
import { ConfigurationNumberProperty } from './ConfigurationNumberProperty';
import { ConfigurationStringProperty } from './ConfigurationStringProperty';



export interface ConfigurationListOfComponents {
    configurations: any;
    values: any;
    onChange: (key: string, value: any) => void
}

export const ConfigurationListOfComponents: FC<ConfigurationListOfComponents> = ({ configurations, values, onChange }) => {
    
    var body: Array<JSX.Element> = []

    // for (var i = 0; i < property.property.length; i++) {
    //     if (property.property[i].type === 'string') {
    //         console.log('Encontre String')
    //         body.push(
    //             <ConfigurationStringProperty property={property.property[i]} onChange={(property.property[i])} />
    //         )
    //     }
    //     else if (property.property[i].type === 'number') {
    //         body.push(
    //             <ConfigurationNumberProperty property={property.property[i]} onChange={(property.property[i])} />
    //         )
    //     }
    //     else if (property.property[i].type === 'boolean') {
    //         body.push(
    //             <ConfigurationBooleanProperty property={property.property[i]} onChange={(property.property[i])} />
    //         )
    //     }
    // }


    const getPropertyEditor = (property: any, value: any, key: string, onChange: (key: string, value: any) => void) => {
        // switch (property.type) {
        //     case 'string':
        //         return (<ConfigurationStringProperty key={key} value={value} property={property} onChange={onChange} />);

        //     case 'number':
        //         return (<ConfigurationNumberProperty key={key} value={value} property={property} onChange={onChange} />);

        //     case 'boolean':
        //         return (<ConfigurationBooleanProperty key={key} value={value} property={property} onChange={(property)} />);

        // }
        if (property.type === 'string') {
            body.push(
                <ConfigurationStringProperty property={property} key={key} value={value} onChange={onChange} />
            )
        }
        else if (property.type === 'number') {
            body.push(
                <ConfigurationNumberProperty property={property} key={key} value={value} onChange={onChange} />
            )
        }
        else if (property.type === 'boolean') {
            body.push(
                <ConfigurationBooleanProperty property={property} key={key} value={value} onChange={onChange} />
            )
        }
    };

    var arrTitles: Array<any> = [];
    var arrJSONConfigs: Array<any> = [];
    var arrKeys: Array<any> = [];
    Object.keys(configurations).forEach(function(key) {
        // console.log(key, configurations[key]);
        arrJSONConfigs.push(configurations[key].properties)
        Object.keys(configurations[key].properties).forEach(function(key2){
            // arrJSONConfigs.push(configurations[key].properties[key2])
            // console.log(configurations[key].properties[key2])
            // console.log(configurations[key].properties)
        })
      arrTitles.push(configurations[key]);
    });
    
    const getProperties = (configs: JSON)=>{
        console.log(Object.keys(configs))
        for(var i=0; i<Object.keys(configs).length; i++){
            for(var j=0; j<Object.keys(values).length;j++){
                if(Object.keys(configs)[i] === Object.keys(values)[j]){
                    // console.log(Object.keys(configs)[i]);
                    // console.log(Object.keys(values)[j])
                    console.log(Object.keys(configs)[i], Object.values(values)[j], Object.values(configs)[i]); //Print: key-value-properties in order.
                    console.log(i,j)
                    getPropertyEditor(Object.values(configs)[i], Object.values(values)[j], Object.keys(configs)[i], onChange)
                }
            }
        }
        return body;
    }
    console.log(arrJSONConfigs)

    for(var i=0;i<arrJSONConfigs.length;i++){
        for(var j=0;j<Object.keys(arrJSONConfigs[i]).length;j++){
            arrKeys.push(Object.keys(arrJSONConfigs[i])[j])
        }
    }
    console.log(arrKeys)

    arrJSONConfigs.map((configuration) => (
        getProperties(configuration)
    ))

    return (
        <div className="flex flex-row">
             <div>
                {arrTitles.map((configuration) =>
                    <h3>{configuration.title}</h3>
                )}
            </div>
            <div className='ml-5'>
                {body}
            </div> 
        </div>
    );

};
