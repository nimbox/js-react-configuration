
export interface objectError{
    message: string,
    values: object
}

export const validateMultiple = (validates: any[], property: any, value: string): objectError | null => {
    for (const validate of validates) {
        // const error = validate(property, value);
        const messageError = validate(property, value);
        if (messageError !== null) {
            return messageError;
        }
    }
    return null;
};