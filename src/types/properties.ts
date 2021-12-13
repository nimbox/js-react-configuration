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