
export interface ValidationError {
    message: string,
    values: object
}

export const validateMultiple = (validates: any[], property: any, value: string): ValidationError | null => {
    
    for (const validate of validates) {
        // const error = validate(property, value);
        const messageError = validate(property, value);
        if (messageError !== null) {
            return messageError;
        }
    }

    return null;

};