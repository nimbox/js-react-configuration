
export const validateMultiple = (validates: any[], property: any, value: string): string | null => {
    for (const validate of validates) {
        // const error = validate(property, value);
        const messageError = validate(property, value);
        if (messageError !== null) {
            return messageError;
        }
    }
    return null;
    // return {};
};