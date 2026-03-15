import { Button, Input } from '@nimbox/js-react-lux';
import { type ChangeEvent, useEffect, useMemo, useState } from 'react';
import { createPreferenceEngine } from '../../../core/preferences/engine';
import type {
  PreferenceCollectionItem,
  PreferenceDescriptor,
  PreferenceEngine,
  PreferenceScope,
  PreferenceSchema,
  PreferenceValues,
} from '../../../core/preferences/types';

type HeadlessLuxPreferenceEditorProps = {
  schema: PreferenceSchema;
  initialValueByScope?: Record<string, PreferenceValues>;
};

const DEFAULT_SCOPE_ORDER: PreferenceScope[] = ['system', 'global', 'application', 'user'];

type PreferenceNavLeaf = {
  kind: 'leaf';
  id: string;
  label: string;
  key: string;
};

type PreferenceNavGroup = {
  kind: 'group';
  id: string;
  label: string;
  children: PreferenceNavNode[];
  leafCount: number;
};

type PreferenceNavNode = PreferenceNavLeaf | PreferenceNavGroup;

function textToObject(text: string): Record<string, unknown> {
  try {
    const parsed = JSON.parse(text) as unknown;
    if (typeof parsed === 'object' && parsed !== null && !Array.isArray(parsed)) {
      return parsed as Record<string, unknown>;
    }
  } catch {
    // Fall through and wrap raw text.
  }
  return { value: text };
}

function getPropertyScope(scope: PreferenceScope | undefined): PreferenceScope {
  return scope ?? 'user';
}

function resolveScopes(schema: PreferenceSchema): PreferenceScope[] {
  const discovered = new Set<PreferenceScope>();
  for (const property of Object.values(schema)) {
    discovered.add(getPropertyScope(property.scope));
  }

  const ordered = DEFAULT_SCOPE_ORDER.filter((scope) => discovered.has(scope));
  const extras = Array.from(discovered).filter((scope) => !DEFAULT_SCOPE_ORDER.includes(scope));
  return [...ordered, ...extras];
}

function buildSchemaByScope(
  schema: PreferenceSchema,
  scopes: PreferenceScope[],
): Record<PreferenceScope, PreferenceSchema> {
  const entries = Object.entries(schema);
  const byScope: Record<PreferenceScope, PreferenceSchema> = {};

  for (const scope of scopes) {
    byScope[scope] = Object.fromEntries(
      entries.filter(([, property]) => getPropertyScope(property.scope) === scope),
    );
  }

  return byScope;
}

function sortNavNodes(nodes: PreferenceNavNode[]): PreferenceNavNode[] {
  const sorted = [...nodes];
  sorted.sort((a, b) => {
    if (a.kind === b.kind) {
      return a.label.localeCompare(b.label);
    }
    return a.kind === 'group' ? -1 : 1;
  });
  return sorted;
}

function buildPreferenceHierarchy(keys: string[]): PreferenceNavGroup {
  const root: PreferenceNavGroup = {
    kind: 'group',
    id: 'root',
    label: 'All preferences',
    children: [],
    leafCount: 0,
  };

  for (const key of keys) {
    const parts = key.split('.');
    let current = root;

    for (let index = 0; index < parts.length; index += 1) {
      const part = parts[index];
      const id = parts.slice(0, index + 1).join('.');
      const isLeaf = index === parts.length - 1;

      if (isLeaf) {
        current.children.push({
          kind: 'leaf',
          id: `leaf:${key}`,
          label: part,
          key,
        });
        continue;
      }

      let child = current.children.find(
        (candidate): candidate is PreferenceNavGroup =>
          candidate.kind === 'group' && candidate.id === id,
      );

      if (!child) {
        child = {
          kind: 'group',
          id,
          label: part,
          children: [],
          leafCount: 0,
        };
        current.children.push(child);
      }

      current = child;
    }
  }

  const applyMeta = (node: PreferenceNavGroup): number => {
    let count = 0;
    for (const child of node.children) {
      if (child.kind === 'leaf') {
        count += 1;
      } else {
        count += applyMeta(child);
      }
    }
    node.children = sortNavNodes(node.children);
    node.leafCount = count;
    return count;
  };

  applyMeta(root);
  return root;
}

function renderCollectionItemInput(
  descriptor: PreferenceDescriptor,
  item: PreferenceCollectionItem,
  onChange: (next: PreferenceCollectionItem) => void,
) {
  if (descriptor.valueKind === 'string') {
    return (
      <Input
        value={String(item)}
        onChange={(e: ChangeEvent<HTMLInputElement>) => onChange(e.target.value)}
      />
    );
  }

  if (descriptor.valueKind === 'number') {
    return (
      <Input
        type="number"
        value={String(item)}
        onChange={(e: ChangeEvent<HTMLInputElement>) => {
          const next = Number(e.target.value);
          onChange(Number.isNaN(next) ? 0 : next);
        }}
      />
    );
  }

  if (descriptor.valueKind === 'boolean') {
    return (
      <label className="inline-flex items-center gap-2">
        <input
          type="checkbox"
          checked={Boolean(item)}
          onChange={(e) => onChange(e.target.checked)}
        />
        <span>{Boolean(item) ? 'true' : 'false'}</span>
      </label>
    );
  }

  if (descriptor.valueKind === 'enum') {
    return (
      <select
        className="w-full rounded border border-gray-300 p-2"
        value={String(item)}
        onChange={(e) => onChange(e.target.value)}
      >
        {(descriptor.enumItems ?? []).map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    );
  }

  return (
    <Input
      value={JSON.stringify(item)}
      onChange={(e: ChangeEvent<HTMLInputElement>) => onChange(textToObject(e.target.value))}
    />
  );
}

function getDefaultCollectionItem(descriptor: PreferenceDescriptor): PreferenceCollectionItem {
  if (descriptor.valueKind === 'string') return '';
  if (descriptor.valueKind === 'number') return 0;
  if (descriptor.valueKind === 'boolean') return false;
  if (descriptor.valueKind === 'enum') return descriptor.enumItems?.[0] ?? '';
  return {};
}

function renderDescriptorEditor(
  descriptor: PreferenceDescriptor,
  engine: PreferenceEngine,
  rerender: () => void,
) {
  if (descriptor.fieldKind === 'scalar') {
    if (descriptor.valueKind === 'string') {
      return (
        <Input
          value={String(descriptor.value ?? '')}
          onChange={(e: ChangeEvent<HTMLInputElement>) => {
            engine.setValue(descriptor.key, e.target.value);
            rerender();
          }}
        />
      );
    }

    if (descriptor.valueKind === 'number') {
      return (
        <Input
          type="number"
          value={String(descriptor.value ?? '')}
          onChange={(e: ChangeEvent<HTMLInputElement>) => {
            const next = Number(e.target.value);
            engine.setValue(descriptor.key, Number.isNaN(next) ? 0 : next);
            rerender();
          }}
        />
      );
    }

    if (descriptor.valueKind === 'boolean') {
      return (
        <label className="inline-flex items-center gap-2">
          <input
            type="checkbox"
            checked={Boolean(descriptor.value)}
            onChange={(e) => {
              engine.setValue(descriptor.key, e.target.checked);
              rerender();
            }}
          />
          <span>Enabled</span>
        </label>
      );
    }

    if (descriptor.valueKind === 'enum') {
      return (
        <select
          className="w-full rounded border border-gray-300 p-2"
          value={String(descriptor.value ?? '')}
          onChange={(e) => {
            engine.setValue(descriptor.key, e.target.value);
            rerender();
          }}
        >
          {(descriptor.enumItems ?? []).map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
      );
    }

    return (
      <div className="rounded border border-dashed border-gray-300 p-3 text-sm text-gray-500">
        No scalar renderer for value kind <span className="font-medium">{descriptor.valueKind}</span>.
      </div>
    );
  }

  const items = Array.isArray(descriptor.value) ? (descriptor.value as PreferenceCollectionItem[]) : [];
  return (
    <div className="space-y-2">
      {items.map((item, index) => (
        <div key={`${descriptor.key}-${index}`} className="flex items-center gap-2">
          {renderCollectionItemInput(descriptor, item, (next) => {
            engine.updateItemAt(descriptor.key, index, next);
            rerender();
          })}
          <Button
            variant="text"
            semantic="danger"
            onClick={() => {
              engine.removeItemAt(descriptor.key, index);
              rerender();
            }}
          >
            Remove
          </Button>
        </div>
      ))}
      <Button
        onClick={() => {
          engine.insertItem(descriptor.key, getDefaultCollectionItem(descriptor));
          rerender();
        }}
      >
        Add item
      </Button>
    </div>
  );
}

function renderDescriptorCard(
  descriptor: PreferenceDescriptor,
  engine: PreferenceEngine,
  rerender: () => void,
) {
  return (
    <div key={descriptor.key} className="rounded border border-gray-200 p-3">
      <div className="mb-2 flex items-center justify-between">
        <div className="font-medium">{descriptor.key}</div>
        <div className="text-xs text-gray-500">
          {descriptor.fieldKind} / {descriptor.valueKind}
        </div>
      </div>
      <div className="mb-2 text-sm text-gray-600">{descriptor.description}</div>
      <div className="mb-3 flex gap-3 text-xs text-gray-500">
        <span>Scope: {descriptor.scope}</span>
        <span>Overridable: {descriptor.overridable ? 'yes' : 'no'}</span>
        <span>Cardinality: {descriptor.cardinality}</span>
      </div>

      {renderDescriptorEditor(descriptor, engine, rerender)}

      {descriptor.issues.length > 0 && (
        <ul className="mt-2 list-disc pl-5 text-sm text-red-600">
          {descriptor.issues.map((issue) => (
            <li key={issue}>{issue}</li>
          ))}
        </ul>
      )}
    </div>
  );
}

export function HeadlessLuxPreferenceEditor({
  schema,
  initialValueByScope = {},
}: HeadlessLuxPreferenceEditorProps) {
  const scopes = useMemo(() => resolveScopes(schema), [schema]);
  const schemaByScope = useMemo(() => buildSchemaByScope(schema, scopes), [schema, scopes]);
  const [selectedScope, setSelectedScope] = useState<PreferenceScope>(scopes[0] ?? 'user');
  const [selectedKey, setSelectedKey] = useState<string | undefined>(undefined);
  const [, setVersion] = useState(0);
  const rerender = () => setVersion((v) => v + 1);

  useEffect(() => {
    if (!scopes.includes(selectedScope)) {
      setSelectedScope(scopes[0] ?? 'user');
    }
  }, [scopes, selectedScope]);

  const enginesByScope = useMemo(() => {
    const byScope: Record<PreferenceScope, PreferenceEngine> = {};
    for (const scope of scopes) {
      byScope[scope] = createPreferenceEngine({
        schema: schemaByScope[scope] ?? {},
        initialValue: initialValueByScope[scope] ?? {},
      });
    }
    return byScope;
  }, [scopes, schemaByScope, initialValueByScope]);

  const activeEngine = enginesByScope[selectedScope];
  const activeDescriptors = activeEngine?.listDescriptors() ?? [];
  const activeKeys = activeDescriptors.map((descriptor) => descriptor.key);
  const descriptorByKey = new Map(activeDescriptors.map((descriptor) => [descriptor.key, descriptor]));
  const hierarchy = useMemo(() => buildPreferenceHierarchy(activeKeys), [activeKeys]);

  useEffect(() => {
    if (!selectedKey) return;
    if (!activeKeys.includes(selectedKey)) {
      setSelectedKey(undefined);
    }
  }, [selectedKey, activeKeys]);

  const descriptorsToRender = selectedKey
    ? activeDescriptors.filter((descriptor) => descriptor.key === selectedKey)
    : activeDescriptors;

  const renderNavNode = (node: PreferenceNavNode, depth: number) => {
    const indentStyle = { marginLeft: `${Math.max(depth, 0) * 10}px` };

    if (node.kind === 'leaf') {
      const isSelected = selectedKey === node.key;
      const descriptor = descriptorByKey.get(node.key);
      return (
        <button
          key={node.id}
          type="button"
          className={[
            'w-full rounded px-2 py-1 text-left text-sm',
            isSelected ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-100',
          ].join(' ')}
          style={indentStyle}
          onClick={() => setSelectedKey(node.key)}
          title={descriptor?.description}
        >
          {node.label}
        </button>
      );
    }

    return (
      <div key={node.id} className="space-y-1">
        <div
          className="rounded px-2 py-1 text-xs font-semibold uppercase tracking-wide text-gray-500"
          style={indentStyle}
        >
          {node.label} ({node.leafCount})
        </div>
        <div className="space-y-1">{node.children.map((child) => renderNavNode(child, depth + 1))}</div>
      </div>
    );
  };

  return (
    <div className="space-y-4 rounded border border-gray-200 bg-white p-4">
      <div className="flex items-center justify-between border-b border-gray-200 pb-3">
        <div>
          <h2 className="text-lg font-semibold">Preferences</h2>
          <p className="text-sm text-gray-600">Descriptor-driven editor by scope</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 border-b border-gray-100 pb-3">
        {scopes.map((scope) => (
          <Button
            key={scope}
            variant="text"
            className={
              selectedScope === scope
                ? 'rounded-md border border-blue-300 bg-blue-50 text-blue-700'
                : 'rounded-md border border-gray-200 text-gray-700'
            }
            onClick={() => setSelectedScope(scope)}
          >
            {scope}
          </Button>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[280px_minmax(0,1fr)]">
        <aside className="space-y-3 rounded border border-gray-200 bg-gray-50 p-3">
          <div className="border-b border-gray-200 pb-2">
            <div className="text-sm font-semibold text-gray-900">Hierarchy</div>
            <div className="text-xs text-gray-500">
              {activeDescriptors.length} preference{activeDescriptors.length === 1 ? '' : 's'}
            </div>
          </div>
          <Button
            variant="text"
            className={
              selectedKey
                ? 'w-full justify-start rounded border border-gray-200 text-gray-700'
                : 'w-full justify-start rounded border border-blue-300 bg-blue-50 text-blue-700'
            }
            onClick={() => setSelectedKey(undefined)}
          >
            All preferences
          </Button>
          <div className="space-y-2">{hierarchy.children.map((node) => renderNavNode(node, 0))}</div>
        </aside>

        <section className="space-y-3">
          {selectedKey && (
            <div className="flex items-center justify-between rounded border border-gray-200 bg-gray-50 px-3 py-2 text-sm">
              <span>
                Selected: <span className="font-medium">{selectedKey}</span>
              </span>
              <Button
                variant="text"
                className="rounded border border-gray-200 text-gray-700"
                onClick={() => setSelectedKey(undefined)}
              >
                Show all
              </Button>
            </div>
          )}

          {activeDescriptors.length === 0 && (
            <div className="rounded border border-dashed border-gray-300 p-4 text-sm text-gray-500">
              No properties in <span className="font-medium">{selectedScope}</span> scope.
            </div>
          )}

          {descriptorsToRender.map((descriptor) => renderDescriptorCard(descriptor, activeEngine, rerender))}

          {activeEngine && (
            <pre className="rounded bg-gray-900 p-3 text-xs text-gray-100">
              {JSON.stringify(activeEngine.getValues(), null, 2)}
            </pre>
          )}
        </section>
      </div>
    </div>
  );
}
