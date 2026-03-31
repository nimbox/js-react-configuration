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
    'Editor font size in pixels.': 'Tamano de fuente del editor en pixeles.',
    'validation.number.required': 'Se requiere un numero.',
    'validation.number.invalid': 'Debe ser un numero valido.',
    'validation.number.minimum': 'Debe ser mayor o igual a {minimum}.',
    'validation.number.maximum': 'Debe ser menor o igual a {maximum}.',
    'validation.string.minLength': 'Debe tener al menos {minLength} caracteres.',
    'validation.string.maxLength': 'Debe tener como maximo {maxLength} caracteres.',
    'validation.string.pattern': 'El valor no cumple el patron requerido.',
    'validation.object.requiredObject': 'Debe ser un objeto JSON.',
    'validation.object.invalidJson': 'JSON invalido para objeto.',
    'validation.array.requiredArray': 'Debe ser un arreglo JSON.',
    'validation.array.invalidJson': 'JSON invalido para arreglo.',
    'validation.array.minItems': 'Debe tener al menos {minItems} elementos.',
    'validation.array.maxItems': 'Debe tener como maximo {maxItems} elementos.',
    'validation.persistence.failed': 'No se pudo guardar el valor.',
    'validation.property.notFound': 'No se encontro la propiedad.',
    'validation.parse.unexpected': 'Error inesperado al validar.'
  }
};

const valuesFixture: NonNullable<UsePreferencesStoryProps['values']> = {
  system: {
    'editor.theme.mode': 'dark',
    'workspace.shortcuts': {
      save: 'CmdOrCtrl+S',
      open: 'CmdOrCtrl+P'
    }
  },
  global: {
    'editor.font.size': 16,
    'notifications.digest.hours': [8, 16],
    'notifications.digest.schedule.weekdays': ['monday', 'thursday']
  },
  application: {
    'editor.font.family': 'JetBrains Mono',
    'editor.extensions.enabled': ['spellcheck', 'formatter', 'gitLens'],
    'editor.font.advanced.ligatures.enabled': false
  },
  user: {
    'assistant.hints.enabled': true
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
    values: valuesFixture,
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
    values: valuesFixture,
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
    values: valuesFixture,
    debug: false
  }
};
