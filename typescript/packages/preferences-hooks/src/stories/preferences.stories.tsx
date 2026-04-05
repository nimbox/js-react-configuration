import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import propertiesFixture from '../../../../../fixtures/properties.json';
import scopesFixture from '../../../../../fixtures/scopes.json';
import valuesFixture from '../../../../../fixtures/values.json';
import type { PreferenceProperty } from '../../../preferences/dist/generated/types';
import { useEditor } from '../hooks/useEditor';
import { usePreferences } from '../hooks/usePreferences';
import { EditorPane } from './components/EditorPane';
import { GroupPane } from './components/GroupPane';
import { SelectScope } from './components/SelectScope';


type StoryArgs = {
    depth: number;
    onChange: (scope: string, key: string, value: unknown) => void;
};

const meta = {
    title: 'Preferences/Preferences1',
    parameters: {
        layout: 'fullscreen'
    },
    argTypes: {
        onChange: {
            action: 'onChange'
        }
    },
    args: {
        depth: 1
    },
    render: (args) => {

        const [query, setQuery] = useState('');
        const [scope, setScope] = useState('user');
        const [resolvedValues, setResolvedValues] = useState(
            valuesFixture as unknown as Record<string, Record<string, unknown>>
        );

        const { nodes } = usePreferences({
            scope,
            scopes: scopesFixture,
            properties: propertiesFixture as unknown as Record<string, PreferenceProperty>,
        });

        const editor = useEditor({
            scope,
            scopes: scopesFixture,
            properties: propertiesFixture as unknown as Record<string, PreferenceProperty>,
            values: resolvedValues,
            onChange: async (nextScope, key, value) => {
                setResolvedValues((current) => {
                    return {
                        ...current,
                        [nextScope]: {
                            ...(current[nextScope] ?? {}),
                            [key]: value
                        }
                    };
                });
                args.onChange(nextScope, key, value);
            }
        });

        return (
            <div>

                <div style={{ padding: '1rem' }}>
                    <input type="search" value={query} onChange={(e) => setQuery(e.target.value)} style={{ width: '100%' }} />
                </div>
                <div style={{ padding: '1rem' }}>
                    <SelectScope value={scope} onChange={setScope} scopes={scopesFixture} />
                </div>

                <div style={{ display: 'flex', gap: '1rem' }}>
                    <div style={{ flex: '0 0 240px' }}>
                        <GroupPane nodes={nodes} depth={args.depth} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                        <EditorPane
                            nodes={nodes}
                            scope={scope}
                            depth={args.depth}
                            register={editor.register}
                            preferences={editor.preferences}
                            drafts={editor.drafts}
                        />
                    </div>
                </div>

            </div>
        );

    }
} satisfies Meta<StoryArgs>;
export default meta;

type Story = StoryObj<StoryArgs>;

export const Default: Story = {};
