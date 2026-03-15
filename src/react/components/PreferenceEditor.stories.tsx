import type { Meta, StoryObj } from '@storybook/react-vite';
import type { PreferenceSchema } from '../../core/preferences/types';
import { HeadlessLuxPreferenceEditor } from './story/HeadlessLuxPreferenceEditor';
import schemaRaw from '../../../.storybook/fixtures/preference-schema.json?raw';

const schema = JSON.parse(schemaRaw) as PreferenceSchema;

const meta = {
  title: 'Preferences/HeadlessLuxPreferenceEditor',
  component: HeadlessLuxPreferenceEditor,
  args: {
    schema,
  },
  parameters: {
    layout: 'padded',
  },
} satisfies Meta<typeof HeadlessLuxPreferenceEditor>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
