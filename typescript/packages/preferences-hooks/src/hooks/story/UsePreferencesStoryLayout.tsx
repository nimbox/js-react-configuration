import type { PropertyGroup } from '@nimbox/preferences';
import { useCallback, useMemo, useRef, type CSSProperties } from 'react';
import { usePreferences } from '../usePreferences';
import { useSectionNavigationSync } from '../useSectionNavigationSync';
import './usePreferencesStory.css';
import { buildRenderedSections } from './usePreferencesStorySections';
import type { PropertyDisplayItem, RenderedSection, UsePreferencesStoryProps } from './usePreferencesStoryTypes';


function GroupNav(props: {
  groups: PropertyGroup[];
  level?: number;
  maxDepth: number;
  activeNavKey: string | null;
  onSelect: (groupKey: string) => void;
}) {
  const {
    groups,
    level = 0,
    maxDepth,
    activeNavKey,
    onSelect
  } = props;

  return (
    <ul className="usePreferencesStoryNavList">
      {groups.map((group) => (
        <li
          key={group.key}
          className="usePreferencesStoryNavItem"
          style={{ '--indent': `${level * 12}px` } as CSSProperties}
        >
          <button
            type="button"
            className={`usePreferencesStoryNavButton${activeNavKey === group.key ? ' isActive' : ''}`}
            onClick={() => {
              onSelect(group.key);
            }}
          >
            {group.title}
          </button>
          {(group.groups.length > 0 && level < maxDepth)
            ? (
              <GroupNav
                groups={group.groups}
                level={level + 1}
                maxDepth={maxDepth}
                activeNavKey={activeNavKey}
                onSelect={onSelect}
              />
            )
            : null}
        </li>
      ))}
    </ul>
  );
}

function PropertyCard(props: { propertyItem: PropertyDisplayItem; level: number }) {

  const { propertyItem, level } = props;
  const { property, propertyTitle } = propertyItem;

  return (
    <div
      className="usePreferencesStoryPropertyCard"
      style={{ '--indent': `${level * 12}px` } as CSSProperties}
    >
      <div className="usePreferencesStoryPropertyMeta">
        {property.type} - {property.scope}
      </div>
      <div className="usePreferencesStoryPropertyTitle">
        {propertyTitle}
      </div>
    </div>
  );
}

function PropertiesSections(props: {
  sections: RenderedSection[];
  registerSection: (sectionId: string, element: HTMLElement | null) => void;
}) {
  const { sections, registerSection } = props;

  return (
    <>
      {sections.map((section) => (
        <article
          key={section.sectionId}
          data-section-id={section.sectionId}
          ref={(element) => {
            registerSection(section.sectionId, element);
          }}
          className="usePreferencesStorySection"
        >
          <div
            className="usePreferencesStorySectionTitle"
            style={{ '--indent': `${section.level * 12}px` } as CSSProperties}
          >
            {section.headingTitle}
          </div>

          {section.propertyItems.map((propertyItem) => (
            <PropertyCard key={propertyItem.propertyKey} propertyItem={propertyItem} level={section.level} />
          ))}
        </article>
      ))}
    </>
  );
}

export function UsePreferencesStoryLayout(props: UsePreferencesStoryProps) {

  const { maxDepth, ...preferencesProps } = props;
  const { groups } = usePreferences(preferencesProps);
  const propertiesScrollRef = useRef<HTMLElement | null>(null);

  const sections = useMemo(() => buildRenderedSections(groups, maxDepth), [groups, maxDepth]);
  const sectionIds = useMemo(() => sections.map((section) => section.sectionId), [sections]);
  const sectionById = useMemo(() => {
    return new Map(sections.map((section) => [section.sectionId, section]));
  }, [sections]);

  const {
    activeSectionId,
    registerSection,
    scrollToSection,
    releaseForcedActiveSection
  } = useSectionNavigationSync({
    containerRef: propertiesScrollRef,
    sectionIds
  });

  const activeNavKey = activeSectionId ? sectionById.get(activeSectionId)?.navKey ?? null : null;
  const handleNavSelect = useCallback((groupKey: string) => {
    void scrollToSection(groupKey, { behavior: 'auto' });
  }, [scrollToSection]);

  return (
    <div className="usePreferencesStoryRoot">
      <div className="usePreferencesStoryLayout">
        <div className="usePreferencesStoryRow">
          Max depth: {maxDepth}
        </div>
        <div className="usePreferencesStoryRow">Scopes row</div>
        <div className="usePreferencesStoryContent">

          <aside className="usePreferencesStoryNav">
            <GroupNav
              groups={groups}
              maxDepth={maxDepth}
              activeNavKey={activeNavKey}
              onSelect={handleNavSelect}
            />
          </aside>

          <section
            ref={propertiesScrollRef}
            className="usePreferencesStoryProperties"
            onScroll={releaseForcedActiveSection}
          >
            <PropertiesSections sections={sections} registerSection={registerSection} />
          </section>

        </div>
      </div>
    </div>
  );

}
