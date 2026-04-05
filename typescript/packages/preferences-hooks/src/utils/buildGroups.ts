import type { PreferenceProperty, PropertyGroup } from '@nimbox/preferences';
import type { PropertyGroupTree, PropertyGroupTreeNode } from './buildPropertyTree';
import { buildPropertyTree } from './buildPropertyTree';

function sortPropertyEntries(properties: Map<string, PreferenceProperty>): Array<[string, PreferenceProperty]> {
  return Array.from(properties.entries())
    .sort(([leftKey, leftValue], [rightKey, rightValue]) => {
      const leftOrder = typeof leftValue.order === 'number' ? leftValue.order : Number.POSITIVE_INFINITY;
      const rightOrder = typeof rightValue.order === 'number' ? rightValue.order : Number.POSITIVE_INFINITY;
      if (leftOrder !== rightOrder) {
        return leftOrder - rightOrder;
      }
      return leftKey.localeCompare(rightKey);
    });
}

function mapProperties(properties: Map<string, PreferenceProperty>): PreferenceProperty[] {
  return sortPropertyEntries(properties).map(([, property]) => property);
}

function mapGroups(groups: Map<string, PropertyGroupTreeNode>): PropertyGroup[] {
  return Array.from(groups.values())
    .sort((left, right) => left.title.localeCompare(right.title))
    .map((group) => ({
      key: group.key,
      title: group.title,
      groups: mapGroups(group.groups),
      properties: mapProperties(group.properties)
    }));
}

export function toPropertyGroups(tree: PropertyGroupTree): PropertyGroup[] {
  return [
    ...mapGroups(tree.groups),
    ...sortPropertyEntries(tree.properties).map(([key, property]) => ({
      key,
      title: key,
      groups: [],
      properties: [property]
    }))
  ];
}

export function buildGroups(properties: Record<string, PreferenceProperty>): PropertyGroup[] {
  return toPropertyGroups(buildPropertyTree(properties));
}
