
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

export type PropertyType = "string" | "number" | "boolean";


export interface BaseProperty<T> {
    type: PropertyType;
    title: string;
    description: string;
    defaultValue: T;
}

export interface StringProperty extends BaseProperty<string> {
    minLength?: number;
    maxLength?: number;
    pattern?: string;
    patternErrorMessage?: string;
    format?: string;
}

export interface NumberProperty extends BaseProperty<number> {
    min?: number;
    max?: number;
}

export interface BooleanProperty extends BaseProperty<boolean> {

}

// export interface ListProperty {
//     StringProperty: StringProperty;
//     NumberProperty: NumberProperty;
//     BooleanProperty: BooleanProperty;
// }