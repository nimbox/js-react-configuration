import { ValidationError } from "../types/properties";


export const validateMultiple = (validates: any[], property: any, value: any): ValidationError | null => {
    
    for (const validate of validates) {
        const messageError = validate(property, value);
        if (messageError !== null) {
            return messageError;
        }
    }

    return null;

};