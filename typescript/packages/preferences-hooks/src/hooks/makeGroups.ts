import type { PreferenceProperty, PropertyGroup } from "@nimbox/preferences";

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

    const gr: PropertyGroupTree = {
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

        let currentGroups = gr.groups;
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
            gr.properties.set(leafPropertyKey, propertyDefinition);
        }

    }

    return gr;

}

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
    return sortPropertyEntries(properties)
        .map(([, property]) => property);
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

export function makeGroups(
    properties: Record<string, PreferenceProperty>
): PropertyGroup[] {
    return toPropertyGroups(buildPropertyTree(properties));
}