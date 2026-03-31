# Configuration Specification

This specification defines a schema contract and a hierarchical value
resolution model.

The most important concept is the split between:

- **Predefined hierarchy**: the ordered list of scopes used for
  merge precedence (example: `system -> global -> application ->
  user`).
- **Schema-defined behavior**: each `Property` declares `scope` and
  `overridable`.

Read this as:

- Scope order that is predefined.
- Property behavior comes from the schema.
- Final preferences come from merging values by scope order, while
  respecting each property's `overridable` rule.

Schema construction and values:

- A `Schema` is the composition of multiple `Fragments`.
- `Values` are per-scope assignments to `Property` keys.
- A scope can be schema-defining, value-only, or both (for example,
  `user` is commonly value-only).
- Authorization maps to scopes and controls who can write values at
  each layer. The higher the scope, the more permissions are needed to
  write values.

This document is schema-focused and does not define transport,
storage, mutation protocols, or authorization policy.

Reference model:
https://code.visualstudio.com/api/references/contribution-points#Configuration-schema

## Core Terminology

- **Property**: one schema entry for a single preference key.
- **Fragment**: one partial schema contribution. A collection of
  `Properties`.
- **Schema**: the full property contract produced by composing all
  `Fragments`.
- **Scope**: one layer in the host-defined merge hierarchy.
- **Values**: per-scope assignments to `Property` keys.
- **Preferences**: final effective values after hierarchical merge.

In short: properties are combined into fragments; fragments compose
the schema; values are authored per scope; preferences are the merged
result.

### Resolution Inputs and Output

To compute `Preferences`, the resolver needs:

- An ordered list of `scopes` (merge precedence).
- The full `schema` (including each `Property`, which must defined 
  `scope`, and `overridable`).
- A `values` object keyed by `scope`, where each value is a key-value
  map of property assignments for that layer.

From these inputs, the resolver merges by `scope` order, applies
`overridable`, falls back to defaults, validates against the `Schema`,
and produces final `Preferences`.

Example:

```ts
type Property = {
  scope: string;
  overridable: boolean;
  default: unknown;
};

type Schema = {
  properties: Record<string, Property>;
};

type Values = Record<string, Record<string, unknown>>;

function resolvePreferences(scopes: string[], schema: Schema, values: Values) {

  const keys = new Set(Object.keys(schema.properties));

  const unknownKeyWarnings = scopes.flatMap((scope) =>
    Object.keys(values[scope] ?? {})
      .filter((key) => !keys.has(key))
      .map((key) => `Unknown property key "${key}" in scope "${scope}".`)
  );

  const entries = Object.entries(schema.properties).map(
    ([key, property]) => {
      
      const propertyScopeIndex = scopes.indexOf(property.scope);
      if (propertyScopeIndex === -1) {
        return {
          key,
          value: undefined,
          warning: `Property "${key}" declares unknown scope "${property.scope}".`
        };
      }

      const startValue =
        values[property.scope]?.[key] ?? property.default;

      const resolvedValue = property.overridable
        ? scopes.slice(propertyScopeIndex + 1).reduce((current, scope) => {
            const scopedValue = values[scope]?.[key];
            return scopedValue ?? current;
          }, startValue)
        : startValue;

      return { key, value: resolvedValue, warning: undefined };

    }
  );

  const preferences = Object.fromEntries(
    entries
      .filter((entry) => entry.value !== undefined)
      .map(({ key, value }) => [key, value]),
  );

  const schemaWarnings = entries
    .map((entry) => entry.warning)
    .filter((warning): warning is string => Boolean(warning));

  return { preferences, warnings: [...unknownKeyWarnings, ...schemaWarnings] };

}
```

## Platform Model

The runtime model separates schema contribution from value resolution:

- **Contributors publish `Fragments`**: each fragment contributes
  `Properties` and may contribute localization keys.
- **The host composes a `Schema`**: all active fragments are merged
  deterministically.
- **`Values` are authored per host-defined `Scope`**: scope order
  controls merge precedence.
- **`Preferences` are resolved output**: effective values after
  applying override rules, defaults, and validation.

## Canonical Fragment Shape

Each contributor publishes one `Fragment` with this canonical
structure:

```json
{
  "contributes": {
    "configuration": {
      "title": "ar.title",
      "contributor": "ar-app",
      "properties": {
        "ar.alignment": {
          "type": "string",
          "scope": "system",
          "overridable": true,
          "enum": ["left", "center", "right"],
          "enumDescriptionKeys": [
            "ar.alignment.left",
            "ar.alignment.center",
            "ar.alignment.right"
          ],
          "default": "left",
          "description": "ar.alignment.description"
        }
      }
    },
    "localization": {
      "defaultLocale": "en",
      "supportedLocales": ["en", "es"],
      "messages": {
        "en": {
          "ar.title": "AR",
          "ar.alignment.description": "Text alignment",
          "ar.alignment.left": "Left",
          "ar.alignment.center": "Center",
          "ar.alignment.right": "Right"
        },
        "es": {
          "ar.title": "AR",
          "ar.alignment.description": "Alineacion del texto",
          "ar.alignment.left": "Izquierda",
          "ar.alignment.center": "Centro",
          "ar.alignment.right": "Derecha"
        }
      }
    }
  }
}
```

### Root Fields

- `contributes.configuration.title` (required): localization key for
  the fragment title.
- `contributes.configuration.properties` (required): dictionary of
  `Property` entries.
- `contributes.configuration.version` (optional): fragment schema
  version.
- `contributes.configuration.contributor` (optional): stable
  contributor identifier.
- `contributes.localization` (optional): localization catalog for
  resolving keys to Markdown text.
- `contributes.localization.defaultLocale` (required when
  `localization` exists): fallback locale.
- `contributes.localization.supportedLocales` (required when
  `localization` exists): non-empty array containing supported locale
  codes.
- `contributes.localization.messages` (required when `localization`
  exists): locale map of message-key to Markdown text.

## Property Contract

Each `Property` in `configuration.properties` must define:

- `type` (required): one of `boolean`, `number`, `string`, `array`, `unknown`
- `items` (required when `type: "array"`): object with `type` equal to
  `boolean`, `number`, `string`, or `unknown`
- `scope` (required)
- `overridable` (required boolean)
- `default` (required)
- `description` (required string; may be either a localization key or
  literal Markdown text)

Optional shared metadata:

- `deprecationMessage` (optional string; may be either a localization
  key or literal Markdown text)
- `order`
- `tags`
- `additionalProperties` (for object-like extensibility where
  supported)

Scope and override semantics:

- `scope` selects the baseline layer where resolution begins for that
  property.
- Scope order is host-defined (example profile: `system -> global ->
  application -> user`).
- `overridable: true` allows downstream layers to replace upstream
  values.
- `overridable: false` locks the value at its own scope (or `default`
  if missing there).

## Localization Contract (Optional)

Localization supports key lookup with literal-text fallback:

- Schema text fields may store either localization keys or final display text.
- Localization contribution is optional.
- When provided, display text is resolved from
  `contributes.localization.messages`.
- Resolved text is interpreted as Markdown.

If provided, localization shape:

```json
{
  "defaultLocale": "en",
  "supportedLocales": ["en", "es"],
  "messages": {
    "en": {
      "ar.alignment.description": "Text alignment",
      "ar.alignment.left": "Left",
      "ar.alignment.center": "Center",
      "ar.alignment.right": "Right"
    },
    "es": {
      "ar.alignment.description": "Alineacion del texto",
      "ar.alignment.left": "Izquierda",
      "ar.alignment.center": "Centro",
      "ar.alignment.right": "Derecha"
    }
  }
}
```

Fallback policy:

- If localization exists and a key is missing in the requested locale,
  resolution falls back to `defaultLocale`.
- For fields that may contain key-or-text values (for example,
  `description` and `deprecationMessage`), resolve as follows:
  1. If localization exists and the field value is found as a key in
     the requested locale, use that message.
  2. Else if localization exists and the field value is found as a key
     in `defaultLocale`, use that message.
  3. Else use the field value as literal Markdown text.
- Missing localization keys may emit warnings but do not invalidate a
  fragment.

## Supported Types

### Scalar Types

- `boolean`
- `number`
- `string`

### Array Types

- `type: "array"` with `items.type: "boolean"`
- `type: "array"` with `items.type: "number"`
- `type: "array"` with `items.type: "string"`

### Enum-Compatible Properties

Enum behavior is represented with:

- `enum`: list of allowed values
- `enumLabels`: optional UI labels aligned by index with `enum`
- `enumDescriptionKeys`: optional localization keys for each enum
  option

Typical enum form: `type: "string"` with `enum`.

## Type-Specific Constraints

### Number Properties

- `minimum`
- `maximum`

### String Properties

- `minLength`
- `maxLength`
- `pattern`
- `patternErrorMessage`
- `format` (for known formats like `date`, `time`, `email`, `uri`,
  `ipv4`)

### Array Properties

- `minItems`
- `maxItems`

## Schema Composition Rules

The host composes all active `Fragments` into one `Schema` using
deterministic rules:

1. Normalize every fragment to the canonical shape.
2. Merge `configuration.properties` in deterministic contributor
   order.
3. Merge `localization.messages` (by locale and key) in the same order
   when localization is present.
4. Reject key conflicts unless an explicit override policy is
   configured.
5. Publish composed output only when all active fragments pass
   validation.

### Property Key Ownership

- Property keys are globally unique in the composed schema.
- Contributors should namespace keys (example: `ar.*`, `billing.*`,
  `editor.*`).
- A contributor cannot redefine another contributor key unless
  override policy allows it.

### Deterministic Merge Order

Recommended stable strategies:

- Static registry order, or
- Explicit numeric priority, then contributor id lexicographical
  order.

The strategy must produce identical output for identical inputs.

## Validation Contract

A `Fragment` is valid only when all checks pass.

### Structural Checks

- `contributes.configuration` exists.
- `title` is a non-empty string.
- `properties` is a non-null dictionary.
- If `contributes.localization` exists:
  - `defaultLocale` is a non-empty string.
  - `supportedLocales` is a non-empty array containing
    `defaultLocale`.
  - `messages` is an object keyed by locale code.
  - `messages[defaultLocale]` exists.

### Property Checks

For every property:

- `type` is supported.
- If `type` is `array`, `items.type` is one of `boolean`, `number`, or
  `string`.
- `scope` exists and is a non-empty string.
- `overridable` exists and is a boolean.
- `default` exists and matches `type`.
- `description` exists and is a non-empty string.
- If `deprecationMessage` exists, it is a non-empty string.
- If `enum` exists, `default` must be a member of `enum`.
- If `enumLabels` exists, its length equals `enum.length`.
- If `enumDescriptionKeys` exists, its length equals `enum.length`.

### Constraint Consistency

- `minimum <= maximum` when both exist.
- `minLength <= maxLength` when both exist.
- `minItems <= maxItems` when both exist.
- `pattern` must be a valid regular expression when present.

### Localization Coverage

- If localization exists, `title` should exist in the `defaultLocale`
  catalog.
- If localization exists and `description` is intended as a key, it
  should exist in `defaultLocale`.
- If localization exists and `deprecationMessage` is intended as a key
  (when present), it should exist in `defaultLocale`.
- If localization exists, every key in `enumDescriptionKeys` (when
  present) should exist in `defaultLocale`.
- If localization exists, every locale in `supportedLocales` should
  exist in `messages`.
- Missing keys do not invalidate a fragment; unresolved values for
  key-or-text fields render as their original field text.

### Composed Schema Checks

- Property keys are globally unique after merge.
- Conflicts are either rejected or resolved by explicit policy.
- Composition remains deterministic for the same fragment set.

## Values and Preferences

`Values` are instance assignments authored per scope. `Preferences`
are the effective merged result.

Example values:

```json
{
  "system": {
    "ar.alignment": "left"
  },
  "application": {
    "ar.alignment": "center"
  },
  "user": {
    "editor.fontSize": 16
  }
}
```

Example effective preferences:

```json
{
  "ar.alignment": "center",
  "ar.enableHints": false,
  "editor.fontSize": 16
}
```

Rules:

- Unknown keys may be rejected or ignored by host policy.
- Known keys must satisfy the composed schema type and constraints.
- Omitted keys fall back to each property `default`.

## Worked Examples

### Example Fragments

Fragment `ar-app`:

```json
{
  "contributes": {
    "configuration": {
      "title": "ar.title",
      "contributor": "ar-app",
      "properties": {
        "ar.alignment": {
          "type": "string",
          "scope": "system",
          "overridable": true,
          "enum": ["left", "center", "right"],
          "enumDescriptionKeys": [
            "ar.alignment.left",
            "ar.alignment.center",
            "ar.alignment.right"
          ],
          "default": "left",
          "description": "ar.alignment.description"
        },
        "ar.enableHints": {
          "type": "boolean",
          "scope": "user",
          "overridable": false,
          "default": false,
          "description": "ar.enableHints.description"
        }
      }
    },
    "localization": {
      "defaultLocale": "en",
      "supportedLocales": ["en", "es"],
      "messages": {
        "en": {
          "ar.title": "AR",
          "ar.alignment.description": "Alignment mode",
          "ar.alignment.left": "Left",
          "ar.alignment.center": "Center",
          "ar.alignment.right": "Right",
          "ar.enableHints.description": "Enable helper hints"
        },
        "es": {
          "ar.title": "AR",
          "ar.alignment.description": "Modo de alineacion",
          "ar.alignment.left": "Izquierda",
          "ar.alignment.center": "Centro",
          "ar.alignment.right": "Derecha",
          "ar.enableHints.description": "Habilitar ayudas"
        }
      }
    }
  }
}
```

Fragment `editor-app`:

```json
{
  "contributes": {
    "configuration": {
      "title": "editor.title",
      "contributor": "editor-app",
      "properties": {
        "editor.fontSize": {
          "type": "number",
          "scope": "user",
          "overridable": false,
          "minimum": 10,
          "maximum": 32,
          "default": 14,
          "description": "editor.fontSize.description"
        }
      }
    },
    "localization": {
      "defaultLocale": "en",
      "supportedLocales": ["en"],
      "messages": {
        "en": {
          "editor.title": "Editor",
          "editor.fontSize.description": "Editor font size in pixels"
        }
      }
    }
  }
}
```

### Example Composed Schema (properties excerpt)

```json
{
  "properties": {
    "ar.alignment": { "type": "string", "scope": "system", "overridable": true, "enum": ["left", "center", "right"], "enumDescriptionKeys": ["ar.alignment.left", "ar.alignment.center", "ar.alignment.right"], "default": "left", "description": "ar.alignment.description" },
    "ar.enableHints": { "type": "boolean", "scope": "user", "overridable": false, "default": false, "description": "ar.enableHints.description" },
    "editor.fontSize": { "type": "number", "scope": "user", "overridable": false, "minimum": 10, "maximum": 32, "default": 14, "description": "editor.fontSize.description" }
  }
}
```

### Example Validation Errors

- `INVALID_DEFAULT_TYPE`: `editor.fontSize` default `"14"` is not a
  number.
- `ENUM_DEFAULT_MISMATCH`: `ar.alignment` default `"justify"` is not
  in enum.
- `PROPERTY_KEY_CONFLICT`: `ar.enableHints` is declared by multiple
  contributors.
- `INVALID_LOCALIZATION_SHAPE`: `localization` exists but
  `defaultLocale` is missing or empty.

## Extensibility Rules

- Consumers ignore unknown non-critical metadata fields.
- Extension metadata should use a stable, documented naming convention.
- Producers do not change meaning of existing fields without a version
  bump.
- New optional fields can be added without breaking older consumers.
- New property types require explicit platform support and validator
  updates.
  
## Hierarchical display expectations

The GUI groups and orders properties by their period-delimited key
segments.

Key shape and node semantics:

- Property keys must contain at least two segments. Example: `editor.color`.
- Single-segment keys like `color` are invalid.
- Any prefix that appears before another segment is a **group node**.
- Group nodes are derived from property keys and are not properties.
- A node cannot be both a group and a property. Example:
  `editor.font.size` and `editor.font.color` are valid, but
  `editor.font` cannot also be a property.

Tree construction example:

Input properties:

- `editor.color`
- `editor.backgroundColor`
- `editor.font.size`
- `editor.font.color`

Rendered hierarchy:

- `[+] editor`
  - `color`
  - `backgroundColor`
  - `[+] font`
    - `size`
    - `color`

Localization requirements:

- Every group node must have a localization message.
- Every property key must have a localization message.
- Display labels are resolved from the localization map using the full node
  key (`editor.font`, `editor.font.size`, etc.).
- If a localization message exists for that key, use it as the label.
- If no localization message exists, build a fallback label from the relevant
  segment:
  - take the last key segment,
  - capitalize the first letter,
  - split camelCase boundaries into spaces.
  Example: `backgroundColor` becomes `Background color`.
- Sorting by label uses the resolved localized name for the active locale.
- Label comparisons are case-insensitive.

Ordering rules:

1. Every property may declare an `order` number.
2. Group node order is the minimum `order` among descendant properties
   that define `order`.
3. If a node has no order (property without `order`, or group with no
   descendant order), treat its order as a very large value so it is
   sorted after all explicitly ordered nodes.
4. Sort by effective order ascending.
5. When effective order is the same, sort lexicographically by localized
   label (case-insensitive).


## Non-Goals

This specification does not define:

- transport protocol (REST/GraphQL/etc.),
- persistence/storage strategy,
- runtime dirty-tracking or patch semantics,
- authorization policy for preference mutations.

