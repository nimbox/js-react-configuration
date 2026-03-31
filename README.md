# js-react-configuration

This library provides the foundation for schema-driven configuration and preference editing.

The core model is:

- **Configuration**: a set of property definitions (no runtime values)
- **Property**: one definition with type, constraints, localization, and merge metadata
- **Preferences**: runtime values for those properties

## Merge-order model

A common profile is an ordered set of scopes:

1. `system`
2. `global`
3. `application`
4. `user`

Values are resolved by merge order (downstream overrides upstream when allowed by property rules like `overridable`).

Important: these scope names are an example profile, not a hard requirement of the library.  
The library is designed so host applications can define their own ordered scope list and authorization logic.

## More details

- Main specification: `docs/configuration-spec.md`
- Legacy notes: `docs/configuration.md`

## TypeScript workspace

The TypeScript packages live in `typescript/`.

First-time setup:

```bash
cd typescript
npm install
```

Generate types for `@nimbox/preferences` from `spec/property.schema.json`:

```bash
cd typescript
npm run generate
```

Generated files are written to:

- `typescript/packages/preferences/src/generated/*.ts`
- `typescript/packages/preferences/src/generated/index.ts`

Other useful commands:

```bash
cd typescript
npm run typecheck
npm run build
```

