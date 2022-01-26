import { ValidationError } from "../types/properties";


export const validateMultiple = (validates: any[], property: any, value: string): ValidationError | null => {
    
    for (const validate of validates) {
        const messageError = validate(property, value);
        if (messageError !== null) {
            return messageError;
        }
    }

    return null;

};