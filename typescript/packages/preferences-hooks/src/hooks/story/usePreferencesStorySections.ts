import type { PropertyGroup } from '@nimbox/preferences';
import type { PropertyDisplayItem, RenderedSection } from './usePreferencesStoryTypes';


function mapPropertyItems(group: PropertyGroup): PropertyDisplayItem[] {
  return group.properties.map((property, index) => {
    const propertyKey = `${group.key}::${index}`;
    return {
      propertyKey,
      propertyTitle: property.description || propertyKey,
      property
    };
  });
}

export function buildRenderedSections(groups: PropertyGroup[], maxDepth: number): RenderedSection[] {

  const sections: RenderedSection[] = [];

  const visitGroup = (
    group: PropertyGroup,
    level: number,
    collapsedTitlePath: string[],
    navAnchorKey: string
  ) => {

    const isCollapsed = level > maxDepth;
    const nextNavAnchorKey = level <= maxDepth ? group.key : navAnchorKey;
    const headingTitle = isCollapsed ? [...collapsedTitlePath, group.title].join(' > ') : group.title;
    const shouldRenderHeading = !isCollapsed || group.properties.length > 0;

    if (shouldRenderHeading) {
      sections.push({
        sectionId: group.key,
        navKey: nextNavAnchorKey,
        groupKey: group.key,
        groupTitle: group.title,
        headingTitle,
        level,
        propertyItems: mapPropertyItems(group)
      });
    }

    const childCollapsedTitlePath = level + 1 > maxDepth
      ? (level > maxDepth ? [...collapsedTitlePath, group.title] : [])
      : [];

    for (const childGroup of group.groups) {
      visitGroup(childGroup, level + 1, childCollapsedTitlePath, nextNavAnchorKey);
    }

  };

  for (const group of groups) {
    visitGroup(group, 0, [], group.key);
  }

  return sections;

}
