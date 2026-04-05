import type { PreferenceProperty } from '../generated/types';
import type { PreferenceValue } from '../types';


export type ScopedValues = Record<string, Record<string, unknown>>;

export function resolve(
    scope: string,
    scopes: string[],
    properties: Record<string, PreferenceProperty>,
    values?: ScopedValues
): Record<string, PreferenceValue> {

    const selectedScope = resolveSelectedScope(scope, scopes);
    const selectedScopeIndex = scopes.indexOf(selectedScope);

    const entries = Object.entries(properties).map(([key, property]) => {

        const defaultValue = property.default;
        const defaultScope = property.scope;

        const selectedDefinition = selectedScopeIndex >= 0
            ? resolveClosestDefinedValue({
                scopes,
                selectedScopeIndex,
                key,
                values
            })
            : null;

        const inheritedDefinition = selectedScopeIndex >= 0
            ? resolveInheritedValue({
                scopes,
                selectedScopeIndex,
                key,
                values,
                defaultValue,
                defaultScope
            })
            : { value: defaultValue, scope: defaultScope };

        const isDefined = Boolean(selectedDefinition && selectedDefinition.scope === selectedScope);
        const effectiveValue = selectedDefinition ? selectedDefinition.value : defaultValue;
        const isOverriden = isDefined && !valuesAreEqual(effectiveValue, inheritedDefinition.value);

        const preference: PreferenceValue = {
            value: effectiveValue,
            isDefined,
            isOverriden,
            inheritedValue: inheritedDefinition.value,
            inheritedScope: inheritedDefinition.scope,
            defaultValue,
            defaultScope
        }
            ;
        return [key, preference] as const;

    });

    return Object.fromEntries(entries) as Record<string, PreferenceValue>;

}

// Utils

function hasScopedValue(values: ScopedValues | undefined, scope: string, key: string): boolean {
    return Boolean(values?.[scope] && key in values[scope]);
}

function valuesAreEqual(left: unknown, right: unknown): boolean {

    if (Object.is(left, right)) {
        return true;
    }

    try {
        return JSON.stringify(left) === JSON.stringify(right);
    } catch {
        return false;
    }

}


function resolveSelectedScope(scope: string, scopes: string[]): string {

    if (scope && scopes.includes(scope)) {
        return scope;
    }

    return scopes[scopes.length - 1] ?? '';

}

function resolveClosestDefinedValue(params: {
    scopes: string[];
    selectedScopeIndex: number;
    key: string;
    values: ScopedValues | undefined;
}): { value: unknown; scope: string } | null {

    const { scopes, selectedScopeIndex, key, values } = params;

    for (let index = selectedScopeIndex; index >= 0; index -= 1) {
        const scopeName = scopes[index];
        if (!scopeName) {
            continue;
        }
        if (hasScopedValue(values, scopeName, key)) {
            return { value: values?.[scopeName]?.[key], scope: scopeName };
        }
    }

    return null;

}

function resolveInheritedValue(params: {
    scopes: string[];
    selectedScopeIndex: number;
    key: string;
    values: ScopedValues | undefined;
    defaultValue: unknown;
    defaultScope: string;
}): { value: unknown; scope: string } {

    const { scopes, selectedScopeIndex, key, values, defaultValue, defaultScope } = params;

    for (let index = selectedScopeIndex - 1; index >= 0; index -= 1) {
        const scopeName = scopes[index];
        if (!scopeName) {
            continue;
        }
        if (hasScopedValue(values, scopeName, key)) {
            return { value: values?.[scopeName]?.[key], scope: scopeName };
        }
    }

    return { value: defaultValue, scope: defaultScope };

}
