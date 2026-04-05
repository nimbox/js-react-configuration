import type { PropertyGroup } from '@nimbox/preferences';
import type { CSSProperties } from 'react';

export function GroupNav(props: {
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
