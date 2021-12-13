import { FC } from 'react';
import { ConfigurationBooleanProperty } from './ConfigurationBooleanProperty';
import { ConfigurationNumberProperty } from './ConfigurationNumberProperty';
import { ConfigurationStringProperty } from './ConfigurationStringProperty';


const body: Array<JSX.Element> = []

export const ConfigurationListOfComponents: FC<any> = (property, onChange: (key: string, value: any) => void) => {

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

    return (
        <>
            {body}
        </>
    );

};
