import { FC } from 'react';
import { BaseProperty } from '../types/properties';


export interface ConfigurationBasePropertyProps {

    property: BaseProperty<any>;

    onChange: (key: string, value: any) => void;

}

export const ConfigurationBaseProperty: FC<ConfigurationBasePropertyProps> = ({ property, children }) => {

    return (
        <div>
            <div className="font-bold">{property.title}</div>
            <div>{property.description}</div>
            <div>
                {children}
            </div>
        </div>
    );

};