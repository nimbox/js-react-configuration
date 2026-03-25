import type { Meta, StoryObj } from '@storybook/react-vite';
import type { ConfigurationSchema } from '../../core/preferences/types';
import { HeadlessLuxConfigurationEditor } from './story/HeadlessLuxPreferenceEditor';
import schemaRaw from '../../../.storybook/fixtures/preference-schema.json?raw';

const schema = JSON.parse(schemaRaw) as ConfigurationSchema;

const meta = {
  title: 'Configuration/HeadlessLuxConfigurationEditor',
  component: HeadlessLuxConfigurationEditor,
  args: {
    schema,
  },
  parameters: {
    layout: 'padded',
  },
} satisfies Meta<typeof HeadlessLuxConfigurationEditor>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
