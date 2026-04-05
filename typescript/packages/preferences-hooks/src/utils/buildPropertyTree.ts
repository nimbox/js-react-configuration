import type { PreferenceProperty } from '@nimbox/preferences';

export interface PropertyGroupTreeNode {
  key: string;
  title: string;
  groups: Map<string, PropertyGroupTreeNode>;
  properties: Map<string, PreferenceProperty>;
}

export interface PropertyGroupTree {
  groups: Map<string, PropertyGroupTreeNode>;
  properties: Map<string, PreferenceProperty>;
}

function createNode(key: string, title: string): PropertyGroupTreeNode {
  return {
    key,
    title,
    groups: new Map<string, PropertyGroupTreeNode>(),
    properties: new Map<string, PreferenceProperty>()
  };
}

export function buildPropertyTree(
  properties: Record<string, PreferenceProperty>
): PropertyGroupTree {

  const tree: PropertyGroupTree = {
    groups: new Map<string, PropertyGroupTreeNode>(),
    properties: new Map<string, PreferenceProperty>()
  };

  for (const [propertyKey, propertyDefinition] of Object.entries(properties)) {
    const segments = propertyKey.split('.').filter(Boolean);
    if (segments.length === 0) {
      continue;
    }

    const groupDepth = Math.max(segments.length - 1, 0);
    const groupSegments = segments.slice(0, groupDepth);
    const leafPropertyKey = segments.slice(groupDepth).join('.');

    let currentGroups = tree.groups;
    let currentNode: PropertyGroupTreeNode | undefined;
    let currentPath = '';

    for (const segment of groupSegments) {
      currentPath = currentPath ? `${currentPath}.${segment}` : segment;
      const existingGroup = currentGroups.get(segment);
      if (existingGroup) {
        currentNode = existingGroup;
      } else {
        const nextGroup = createNode(currentPath, segment);
        currentGroups.set(segment, nextGroup);
        currentNode = nextGroup;
      }
      currentGroups = currentNode.groups;
    }

    if (currentNode) {
      currentNode.properties.set(leafPropertyKey, propertyDefinition);
    } else {
      tree.properties.set(leafPropertyKey, propertyDefinition);
    }

  }

  return tree;
}
