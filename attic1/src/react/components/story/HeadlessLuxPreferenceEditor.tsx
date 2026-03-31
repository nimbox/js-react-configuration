import { Button, Input } from '@nimbox/js-react-lux';
import { type ChangeEvent, useMemo, useState } from 'react';
import { createConfigurationEngine } from '../../../core/preferences/engine';
import type {
  ConfigurationCollectionItem,
  ConfigurationDescriptor,
  ConfigurationEngine,
  ConfigurationScope,
  ConfigurationSchema,
  ConfigurationScopeValues,
} from '../../../core/preferences/types';

type HeadlessLuxConfigurationEditorProps = {
  schema: ConfigurationSchema;
  initialValuesByScope?: Record<string, ConfigurationScopeValues>;
};

const DEFAULT_SCOPE_ORDER: ConfigurationScope[] = ['system', 'global', 'application', 'user'];

type ConfigurationNavLeaf = {
  kind: 'leaf';
  id: string;
  label: string;
  key: string;
};

type ConfigurationNavGroup = {
  kind: 'group';
  id: string;
  label: string;
  children: ConfigurationNavNode[];
  leafCount: number;
};

type ConfigurationNavNode = ConfigurationNavLeaf | ConfigurationNavGroup;

function resolveScopes(schema: ConfigurationSchema): ConfigurationScope[] {
  const discovered = new Set<ConfigurationScope>();
  for (const property of Object.values(schema)) {
    discovered.add(property.scope);
  }

  const ordered = DEFAULT_SCOPE_ORDER.filter((scope) => discovered.has(scope));
  const extras = Array.from(discovered).filter((scope) => !DEFAULT_SCOPE_ORDER.includes(scope));
  return [...ordered, ...extras];
}

function sortNavNodes(nodes: ConfigurationNavNode[]): ConfigurationNavNode[] {
  const sorted = [...nodes];
  sorted.sort((a, b) => {
    if (a.kind === b.kind) {
      return a.label.localeCompare(b.label);
    }
    return a.kind === 'group' ? -1 : 1;
  });
  return sorted;
}

function buildConfigurationHierarchy(keys: string[]): ConfigurationNavGroup {
  const root: ConfigurationNavGroup = {
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
        (candidate): candidate is ConfigurationNavGroup =>
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

  const applyMeta = (node: ConfigurationNavGroup): number => {
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
  descriptor: ConfigurationDescriptor,
  item: ConfigurationCollectionItem,
  onChange: (next: ConfigurationCollectionItem) => void,
) {
  if (descriptor.valueKind === 'string' && descriptor.enum) {
    return (
      <select
        className="w-full rounded border border-gray-300 p-2"
        value={String(item)}
        onChange={(e) => onChange(e.target.value)}
      >
        {descriptor.enum.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    );
  }

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
          checked={item === true}
          onChange={(e) => onChange(e.target.checked)}
        />
        <span>{item === true ? 'true' : 'false'}</span>
      </label>
    );
  }

  return (
    <Input
      value={JSON.stringify(item)}
      onChange={(e: ChangeEvent<HTMLInputElement>) => onChange(e.target.value)}
    />
  );
}

function getDefaultCollectionItem(descriptor: ConfigurationDescriptor): ConfigurationCollectionItem {
  if (descriptor.valueKind === 'string') return '';
  if (descriptor.valueKind === 'number') return 0;
  if (descriptor.valueKind === 'boolean') return false;
  return '';
}

function renderDescriptorEditor(
  descriptor: ConfigurationDescriptor,
  engine: ConfigurationEngine,
  selectedScope: ConfigurationScope,
  rerender: () => void,
) {
  const { capabilities } = descriptor;

  if (descriptor.fieldKind === 'scalar') {
    if (descriptor.valueKind === 'string') {
      if (descriptor.enum) {
        return (
          <select
            className="w-full rounded border border-gray-300 p-2 disabled:bg-gray-100"
            value={String(descriptor.value ?? '')}
            disabled={!capabilities.canSet}
            onChange={(e) => {
              engine.setScopedValue(selectedScope, descriptor.key, e.target.value);
              rerender();
            }}
          >
            {descriptor.enum.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        );
      }

      return (
        <Input
          value={String(descriptor.value ?? '')}
          disabled={!capabilities.canSet}
          onChange={(e: ChangeEvent<HTMLInputElement>) => {
            engine.setScopedValue(selectedScope, descriptor.key, e.target.value);
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
          disabled={!capabilities.canSet}
          onChange={(e: ChangeEvent<HTMLInputElement>) => {
            const next = Number(e.target.value);
            engine.setScopedValue(selectedScope, descriptor.key, Number.isNaN(next) ? 0 : next);
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
            checked={descriptor.value === true}
            disabled={!capabilities.canSet}
            onChange={(e) => {
              engine.setScopedValue(selectedScope, descriptor.key, e.target.checked);
              rerender();
            }}
          />
          <span>Enabled</span>
        </label>
      );
    }

    return (
      <div className="rounded border border-dashed border-gray-300 p-3 text-sm text-gray-500">
        No scalar renderer for value kind <span className="font-medium">{descriptor.valueKind}</span>.
      </div>
    );
  }

  const items = Array.isArray(descriptor.value) ? (descriptor.value as ConfigurationCollectionItem[]) : [];
  return (
    <div className="space-y-2">
      {items.map((item, index) => (
        <div key={`${descriptor.key}-${index}`} className="flex items-center gap-2">
          {renderCollectionItemInput(descriptor, item, (next) => {
            engine.updateScopedItemAt(selectedScope, descriptor.key, index, next);
            rerender();
          })}
          <Button
            variant="text"
            semantic="danger"
            disabled={!capabilities.canRemove}
            onClick={() => {
              engine.removeScopedItemAt(selectedScope, descriptor.key, index);
              rerender();
            }}
          >
            Remove
          </Button>
        </div>
      ))}
      <Button
        disabled={!capabilities.canAdd}
        onClick={() => {
          engine.insertScopedItem(selectedScope, descriptor.key, getDefaultCollectionItem(descriptor));
          rerender();
        }}
      >
        Add item
      </Button>
    </div>
  );
}

function renderDescriptorCard(
  descriptor: ConfigurationDescriptor,
  engine: ConfigurationEngine,
  selectedScope: ConfigurationScope,
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
      <div className="mb-2 text-sm text-gray-600">{descriptor.descriptionKey}</div>
      <div className="mb-3 flex gap-3 text-xs text-gray-500">
        <span>Scope: {descriptor.scope}</span>
        <span>Overridable: {descriptor.overridable ? 'yes' : 'no'}</span>
        <span>Cardinality: {descriptor.cardinality}</span>
      </div>

      {renderDescriptorEditor(descriptor, engine, selectedScope, rerender)}

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

export function HeadlessLuxConfigurationEditor({
  schema,
  initialValuesByScope = {},
}: HeadlessLuxConfigurationEditorProps) {
  const scopes = useMemo(() => resolveScopes(schema), [schema]);
  const [selectedScope, setSelectedScope] = useState<ConfigurationScope>(scopes[0] ?? 'user');
  const [selectedKey, setSelectedKey] = useState<string | undefined>(undefined);
  const [, setVersion] = useState(0);
  const rerender = () => setVersion((v) => v + 1);

  const engine = useMemo(
    () =>
      createConfigurationEngine({
        schema,
        scopeOrder: scopes,
        initialValuesByScope,
      }),
    [schema, scopes, initialValuesByScope],
  );
  const normalizedSelectedScope = scopes.includes(selectedScope) ? selectedScope : (scopes[0] ?? 'user');
  const activeDescriptors = engine.listDescriptors(normalizedSelectedScope);
  const activeKeys = activeDescriptors.map((descriptor) => descriptor.key);
  const descriptorByKey = new Map(activeDescriptors.map((descriptor) => [descriptor.key, descriptor]));
  const hierarchy = buildConfigurationHierarchy(activeKeys);
  const warnings = engine.getWarnings();
  const normalizedSelectedKey =
    selectedKey && activeKeys.includes(selectedKey) ? selectedKey : undefined;

  const descriptorsToRender = normalizedSelectedKey
    ? activeDescriptors.filter((descriptor) => descriptor.key === normalizedSelectedKey)
    : activeDescriptors;

  const renderNavNode = (node: ConfigurationNavNode, depth: number) => {
    const indentStyle = { marginLeft: `${Math.max(depth, 0) * 10}px` };

    if (node.kind === 'leaf') {
      const isSelected = normalizedSelectedKey === node.key;
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
          title={descriptor?.descriptionKey}
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
          <h2 className="text-lg font-semibold">Configuration</h2>
          <p className="text-sm text-gray-600">Spec-aligned descriptor editor by scope</p>
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
              {activeDescriptors.length} key{activeDescriptors.length === 1 ? '' : 's'}
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
            All keys
          </Button>
          <div className="space-y-2">{hierarchy.children.map((node) => renderNavNode(node, 0))}</div>
        </aside>

        <section className="space-y-3">
          {normalizedSelectedKey && (
            <div className="flex items-center justify-between rounded border border-gray-200 bg-gray-50 px-3 py-2 text-sm">
              <span>
                Selected: <span className="font-medium">{normalizedSelectedKey}</span>
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
              No visible keys in <span className="font-medium">{normalizedSelectedScope}</span> scope.
            </div>
          )}

          {descriptorsToRender.map((descriptor) =>
            renderDescriptorCard(descriptor, engine, normalizedSelectedScope, rerender),
          )}

          {warnings.length > 0 && (
            <ul className="rounded border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800">
              {warnings.map((warning) => (
                <li key={warning}>{warning}</li>
              ))}
            </ul>
          )}

          <pre className="rounded bg-gray-900 p-3 text-xs text-gray-100">
            {JSON.stringify(engine.getValuesByScope(), null, 2)}
          </pre>

          <pre className="rounded bg-gray-900 p-3 text-xs text-gray-100">
            {JSON.stringify(engine.getEffectivePreferences(), null, 2)}
          </pre>
        </section>
      </div>
    </div>
  );
}
