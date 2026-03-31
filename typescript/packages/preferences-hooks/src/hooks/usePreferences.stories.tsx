import type { Meta, StoryObj } from '@storybook/react-vite';
import propertiesFixture from '../../../../../fixtures/properties.json';
import scopesFixture from '../../../../../fixtures/scopes.json';
import { UsePreferencesStoryLayout } from './story/UsePreferencesStoryLayout';
import type { UsePreferencesStoryProps } from './story/usePreferencesStoryTypes';
import { type UsePreferencesProps } from './usePreferences';


const meta = {
  title: 'Hooks/usePreferences',
  parameters: {
    layout: 'fullscreen'
  },
  render: (args) => {
    return <UsePreferencesStoryLayout {...args} />;
  }
} satisfies Meta<UsePreferencesStoryProps>;
export default meta;

type Story = StoryObj<UsePreferencesStoryProps>;


export const Default: Story = {
  args: {
    scopes: scopesFixture,
    properties: propertiesFixture as unknown as UsePreferencesProps['properties'],
    maxDepth: 1
  }
};

export const Depth1: Story = {
  args: {
    scopes: scopesFixture,
    properties: propertiesFixture as unknown as UsePreferencesProps['properties'],
    maxDepth: 0
  }
};

export const Depth3: Story = {
  args: {
    scopes: scopesFixture,
    properties: propertiesFixture as unknown as UsePreferencesProps['properties'],
    maxDepth: 2
  }
};
