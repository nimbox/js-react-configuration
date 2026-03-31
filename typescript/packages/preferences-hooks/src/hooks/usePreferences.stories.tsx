import type { PreferenceProperty, PropertyGroup } from '@nimbox/preferences';
import type { Meta, StoryObj } from '@storybook/react-vite';
import propertiesFixture from '../../../../../fixtures/properties.json';
import scopesFixture from '../../../../../fixtures/scopes.json';
import { usePreferences, type UsePreferencesProps } from './usePreferences';


type UsePreferencesStoryProps = UsePreferencesProps & {
  maxDepth: number;
};

const meta = {
  title: 'Hooks/usePreferences',
  parameters: {
    layout: 'fullscreen'
  },
  render: (args) => {
    return <StoryBody {...args} />;
  }
} satisfies Meta<UsePreferencesStoryProps>;
export default meta;

type Story = StoryObj<UsePreferencesStoryProps>;

function GroupNav(props: { groups: PropertyGroup[]; level?: number; maxDepth: number }) {

  const { groups, level = 0, maxDepth } = props;

  return (
    <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
      {groups.map((group) => (
        <li key={group.key} style={{ paddingLeft: level * 12 }}>
          <button
            type="button"
            style={{
              border: 0,
              background: 'transparent',
              padding: '6px 8px',
              width: '100%',
              textAlign: 'left',
              cursor: 'default'
            }}
          >
            {group.title}
          </button>
          {(group.groups.length > 0 && level < maxDepth)
            ? <GroupNav groups={group.groups} level={level + 1} maxDepth={maxDepth} />
            : null}
        </li>
      ))}
    </ul>
  );

}

function PropertyCard(props: { groupKey: string; property: PreferenceProperty; index: number; level: number }) {
  const { groupKey, property, index, level } = props;

  return (
    <div
      key={`${groupKey}-property-${index}`}
      style={{
        marginLeft: level * 12,
        marginBottom: 8,
        padding: '8px 10px',
        border: '1px solid #e4e4e7',
        borderRadius: 6,
        background: '#fafafa'
      }}
    >
      <div style={{ fontSize: 12, color: '#52525b' }}>
        {property.type} - {property.scope}
      </div>
      <div style={{ fontSize: 13, color: '#18181b' }}>
        {property.description || `Property ${index + 1}`}
      </div>
    </div>
  );
}

function CollapsedGroupProperties(props: { groups: PropertyGroup[]; path?: string[]; level: number }) {
  const { groups, path = [], level } = props;

  return (
    <>
      {groups.map((group) => {
        const breadcrumb = [...path, group.title];
        const hasOwnProperties = group.properties.length > 0;
        return (
          <div key={group.key} style={{ marginBottom: 12 }}>
            {hasOwnProperties ? (
              <>
                <div
                  style={{
                    margin: '0 0 8px',
                    paddingLeft: level * 12,
                    fontWeight: 600,
                    color: '#27272a'
                  }}
                >
                  {breadcrumb.join(' > ')}
                </div>

                {group.properties.map((property, index) => (
                  <PropertyCard key={`${group.key}-collapsed-${index}`} groupKey={group.key} property={property} index={index} level={level} />
                ))}
              </>
            ) : null}

            {group.groups.length > 0 ? (
              <CollapsedGroupProperties groups={group.groups} path={breadcrumb} level={level} />
            ) : null}
          </div>
        );
      })}
    </>
  );
}

function GroupProperties(props: { groups: PropertyGroup[]; level?: number; maxDepth: number }) {

  const { groups, level = 0, maxDepth } = props;

  if (level > maxDepth) {
    return <CollapsedGroupProperties groups={groups} level={level} />;
  }

  return (
    <>
      {groups.map((group) => (
        <div key={group.key} style={{ marginBottom: 12 }}>
          <div
            style={{
              margin: '0 0 8px',
              paddingLeft: level * 12,
              fontWeight: 600,
              color: '#27272a'
            }}
          >
            {group.title}
          </div>

          {group.properties.map((property, index) => (
            <PropertyCard key={`${group.key}-regular-${index}`} groupKey={group.key} property={property} index={index} level={level} />
          ))}

          {group.groups.length > 0 ? (
            level + 1 > maxDepth
              ? <CollapsedGroupProperties groups={group.groups} path={[]} level={level + 1} />
              : <GroupProperties groups={group.groups} level={level + 1} maxDepth={maxDepth} />
          ) : null}
        </div>
      ))}
    </>
  );
}

function StoryBody(props: UsePreferencesStoryProps) {

  const { maxDepth, ...preferencesProps } = props;
  const { groups } = usePreferences(preferencesProps);

  return (
    <div style={{ height: '100%', padding: 12, boxSizing: 'border-box' }}>
      <div
        style={{
          display: 'grid',
          gridTemplateRows: '40px 40px 1fr',
          border: '1px solid #d4d4d8',
          borderRadius: 6,
          overflow: 'hidden',
          fontFamily: 'sans-serif',
          height: '100%',
          minHeight: 0
        }}
      >
        <div style={{ borderBottom: '1px solid #e4e4e7', padding: '10px 12px', overflow: 'auto' }}>
          Max depth: {maxDepth}
        </div>
        <div style={{ borderBottom: '1px solid #e4e4e7', padding: '10px 12px', overflow: 'auto' }}>Scopes row</div>
        <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', minHeight: 0, overflow: 'hidden' }}>
          <aside style={{ borderRight: '1px solid #e4e4e7', padding: 8, overflow: 'auto', minHeight: 0 }}>
            <GroupNav groups={groups} maxDepth={maxDepth} />
          </aside>
          <section style={{ padding: 12, color: '#71717a', overflow: 'auto', minHeight: 0 }}>
            <GroupProperties groups={groups} maxDepth={maxDepth} />
          </section>
        </div>
      </div>
    </div>
  );

}

export const Default: Story = {
  args: {
    scopes: scopesFixture,
    properties: propertiesFixture as unknown as UsePreferencesProps['properties'],
    maxDepth: 2
  }
};

export const Depth1: Story = {
  args: {
    scopes: scopesFixture,
    properties: propertiesFixture as unknown as UsePreferencesProps['properties'],
    maxDepth: 1
  }
};

export const Depth3: Story = {
  args: {
    scopes: scopesFixture,
    properties: propertiesFixture as unknown as UsePreferencesProps['properties'],
    maxDepth: 3
  }
};
