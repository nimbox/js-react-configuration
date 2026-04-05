export type RegisterElement = HTMLInputElement | HTMLSelectElement;

export type RefCallback = (instance: RegisterElement | null) => void;
export type ChangeHandler = (event: { target: RegisterElement; }) => void;
