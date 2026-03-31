import type { Meta, StoryObj } from '@storybook/react-vite';
import propertiesFixture from '../../../../../fixtures/properties.json';
import scopesFixture from '../../../../../fixtures/scopes.json';
import { UsePreferencesStoryLayout } from './story/UsePreferencesStoryLayout';
import type { UsePreferencesStoryProps } from './story/usePreferencesStoryTypes';
import { type UsePreferencesProps } from './usePreferences';


const messagesFixture: NonNullable<UsePreferencesProps['messages']> = {
  es: {
    'assistant': 'Asistente',
    'editor': 'Editor',
    'editor.font': 'Fuente',
    'notifications': 'Notificaciones',
    'workspace': 'Espacio de trabajo',
    'Visual theme mode for the editor.': 'Modo de tema visual para el editor.',
    'Editor font size in pixels.': 'Tamano de fuente del editor en pixeles.'
  }
};

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
    scope: 'user',
    properties: propertiesFixture as unknown as UsePreferencesProps['properties'],
    maxDepth: 1,
    locale: 'es',
    messages: messagesFixture,
    debug: false
  }
};

export const Depth1: Story = {
  args: {
    scopes: scopesFixture,
    scope: 'application',
    properties: propertiesFixture as unknown as UsePreferencesProps['properties'],
    maxDepth: 0,
    locale: 'es',
    messages: messagesFixture,
    debug: false
  }
};

export const Depth3: Story = {
  args: {
    scopes: scopesFixture,
    scope: 'global',
    properties: propertiesFixture as unknown as UsePreferencesProps['properties'],
    maxDepth: 2,
    locale: 'es',
    messages: messagesFixture,
    debug: false
  }
};
