export interface TranslateOptions {
    fallback?: TranslationFallback;
    debug?: boolean;
}
export type TranslationFallback = 'key' | 'tail';
export type TranslateResult = (key: string) => string;

export function translate(
    messages: Record<string, string>,
    options: TranslateOptions = {}
): TranslateResult {

    const { fallback = 'key', debug = false } = options;

    return (key: string) => {

        const translated = messages[key];
        if (translated) {
            return translated;
        }

        if (debug) {
            console.warn(`[localize] Missing message key="${key}"`);
        }

        if (fallback === 'tail') {
            const segments = key.split('.').filter(Boolean);
            return segments[segments.length - 1] ?? key;
        }

        return key;

    };

}
