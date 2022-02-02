
/**
 * 
 * string
 * string|null
 * string[]
 * string[]|null
 * 
 * 
 * for type 
 * /(string|number|boolean)(\[\])?(\|null)?/
 * capture groups 1->type, 2->array, 3->nullable
 */


// { type: 'number[]|null', min: 0, max: 120, minArrayLength: 3, maxArrayLength: 3, defaultValue: [0, 30, 90] }
// value: null | [20,20,20] | NO[20] | NO[20,20,20,20,20,20] 

export type PropertyType = "string" | "number" | "boolean" | "enum" | "string[]" | "number[]" | "string|null" | "number|null" | "string[]|null" | "number[]|null";


export interface BaseProperty<T> {
    type: PropertyType;
    title: string;
    description: string;
    defaultValue: T;
}

export interface StringPropertyOne extends BaseProperty<string> {
    nullable:boolean;
    minLength?: number;
    maxLength?: number;
    pattern?: string;
    patternErrorMessage?: string;
    format?: string;
}

export interface StringPropertyArray extends BaseProperty<string[]>{
    nullable: boolean;
    minLength?: number;
    maxLength?: number;
    minArrayLength?: number;
    maxArrayLength?: number;
    pattern?: string;
    patternErrorMessage?: string;
    format?: string;
}


export interface NumberPropertyOne extends BaseProperty<number> {
    nullable: boolean;
    min?: number;
    max?: number;
}

export interface NumberPropertyArray extends BaseProperty<number[]>{
    nullable:boolean;
    min?: number;
    max?: number;
    minArrayLength?: number;
    maxArrayLength?: number;
}

export interface BooleanProperty extends BaseProperty<boolean> {

}

export interface EnumProperty extends BaseProperty<string> {
    options: Array<string>;
    optionsDescriptions: Array<string>;
}

export interface ValidationError {
    message: string,
    values: object
}
