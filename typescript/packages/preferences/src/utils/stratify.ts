import { type PreferenceProperty } from '../generated/types';
import { type PropertyGroup, type PropertyItem, type PropertyNode } from '../types';
import { translate } from './translate';

export type StratifyOptions = {
    debug?: boolean;
};

type MutableGroup = {
    key: string;
    title: string;
    order: number;
    groups: Map<string, MutableGroup>;
    items: PropertyItem[];
};

export function stratify(
    scopes: string[],
    scope: string,
    properties: Record<string, PreferenceProperty>,
    messages: Record<string, string>,
    options: StratifyOptions = {}
): PropertyNode[] {
    const { debug = false } = options;
    const t = translate(messages, { fallback: 'tail', debug });

    const selectedScope = scope && scopes.includes(scope) ? scope : (scopes[scopes.length - 1] ?? '');

    const scopeRankByName = new Map(scopes.map((name, index) => [name, index]));
    const selectedScopeRank = scopeRankByName.get(selectedScope);

    const groups = new Map<string, MutableGroup>();

    const ensureGroupPath = (segments: string[]): MutableGroup[] => {

        let segmentPath = '';
        const groupPath: MutableGroup[] = [];
        let siblings = groups;

        for (const segment of segments) {

            segmentPath = segmentPath ? `${segmentPath}.${segment}` : segment;
            const existing = siblings.get(segmentPath);
            if (existing) {
                groupPath.push(existing);
                siblings = existing.groups;
                continue;
            }

            const created: MutableGroup = {
                key: segmentPath,
                title: t(segmentPath),
                order: Number.POSITIVE_INFINITY,
                groups: new Map<string, MutableGroup>(),
                items: []
            };

            siblings.set(segmentPath, created);
            groupPath.push(created);
            siblings = created.groups;

        }

        return groupPath;

    };

    for (const [key, property] of Object.entries(properties)) {

        if (!shouldIncludeProperty(property, scopeRankByName, selectedScopeRank)) {
            continue;
        }

        const segments = key.split('.').filter(Boolean);
        if (segments.length < 2) {
            if (debug) {
                console.warn(`[stratify] Skipping key="${key}" because key must have at least two segments.`);
            }
            continue;
        }

        const item: PropertyItem = {
            kind: 'item',
            key: key,
            title: t(key),
            property
        };
        const order = getItemOrder(item);

        const groupPath = ensureGroupPath(segments.slice(0, -1));
        const parent = groupPath[groupPath.length - 1];
        if (!parent) {
            continue;
        }

        parent.items.push(item);
        for (const group of groupPath) {
            group.order = Math.min(group.order, order);
        }

    }

    return materialize(groups);

}

// Utilities

function shouldIncludeProperty(
    property: PreferenceProperty,
    scopeRankByName: ReadonlyMap<string, number>,
    selectedScopeRank: number | undefined
): boolean {

    if (selectedScopeRank === undefined) {
        return true;
    }

    const propertyScopeRank = scopeRankByName.get(property.scope);
    if (propertyScopeRank === undefined) {
        return false;
    }
    if (propertyScopeRank === selectedScopeRank) {
        return true;
    }

    return propertyScopeRank < selectedScopeRank && property.overridable;

}

function getItemOrder(item: PropertyItem): number {
    if (typeof item.property.order === 'number') {
        return item.property.order;
    }
    return Number.POSITIVE_INFINITY;
}

function materialize(groups: ReadonlyMap<string, MutableGroup>): PropertyNode[] {
    const roots = Array.from(groups.values()).sort(compareGroups);
    return roots.map((group) => materializeGroup(group));
}

function materializeGroup(group: MutableGroup): PropertyGroup {

    const children: PropertyNode[] = [
        ...Array.from(group.groups.values()).map((group) => ({
            node: materializeGroup(group) as PropertyNode,
            order: group.order
        })),
        ...group.items.map((item) => ({
            node: item as PropertyNode,
            order: getItemOrder(item)
        }))
    ]
        .sort((left, right) => {
            return compareOrderTitleKey(
                left.order, left.node.title, left.node.key,
                right.order, right.node.title, right.node.key
            );
        })
        .map((entry) => entry.node);

    return {
        kind: 'group',
        key: group.key,
        title: group.title,
        children
    };

}

function compareGroups(left: MutableGroup, right: MutableGroup): number {

    return compareOrderTitleKey(
        left.order, left.title, left.key,
        right.order, right.title, right.key
    );

}

function compareOrderTitleKey(
    leftOrder: number, leftTitle: string, leftKey: string,
    rightOrder: number, rightTitle: string, rightKey: string
): number {

    if (leftOrder !== rightOrder) {
        return leftOrder - rightOrder;
    }

    if (leftTitle !== rightTitle) {
        return leftTitle.localeCompare(rightTitle);
    }

    return leftKey.localeCompare(rightKey);

}
