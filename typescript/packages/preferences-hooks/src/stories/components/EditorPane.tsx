import type { PropertyNode } from '@nimbox/preferences';
import { Fragment } from 'react';
import type { UseEditorResult } from '../../hooks/useEditor';
import { EditorItem } from './EditorItem';


export interface EditorPaneProps {
    scope: string;
    nodes: PropertyNode[];
    depth: number;
    register: UseEditorResult['register'];
    preferences: UseEditorResult['preferences'];
    drafts: UseEditorResult['drafts'];
}

function Heading(props: {
    level: number;
    children: React.ReactNode
}) {

    const n = Math.min(Math.max(props.level, 0) + 1, 6);
    const Tag = `h${n}` as 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';

    return <Tag>{props.children}</Tag>;

}

function EditorTree(props: {
    nodes: PropertyNode[];
    level: number;
    scope: string;
    depth: number;
    breadcrumbs: string[];
    register: UseEditorResult['register'];
    preferences: UseEditorResult['preferences'];
    drafts: UseEditorResult['drafts'];
}) {

    const { nodes, level, scope, depth, breadcrumbs, register, preferences, drafts } = props;

    return (
        <>
            {nodes.map((node) => {

                if (node.kind === 'group') {
                    if (level <= depth) {
                        return (
                            <Fragment key={node.key}>
                                <Heading level={level}>{node.title}</Heading>
                                <EditorTree
                                    nodes={node.children}
                                    level={level + 1}
                                    scope={scope}
                                    depth={depth}
                                    breadcrumbs={breadcrumbs}
                                    register={register}
                                    preferences={preferences}
                                    drafts={drafts}
                                />
                            </Fragment>
                        );
                    }
                    return (
                        <EditorTree
                            key={node.key}
                            nodes={node.children}
                            level={level + 1}
                            scope={scope}
                            depth={depth}
                            breadcrumbs={[...breadcrumbs, node.title]}
                            register={register}
                            preferences={preferences}
                            drafts={drafts}
                        />
                    );
                }

                return (
                    <EditorItem
                        key={node.key}
                        item={node}
                        breadcrumbs={breadcrumbs}
                        register={register}
                        preference={preferences[node.key]}
                        draft={drafts[scope]?.[node.key]}
                    />
                );

            })}
        </>
    );
}

export function EditorPane(props: EditorPaneProps) {

    const { nodes, scope, depth, register, preferences, drafts } = props;

    return (
        <div>
            <EditorTree
                nodes={nodes}
                level={0}
                scope={scope}
                depth={depth}
                breadcrumbs={[]}
                register={register}
                preferences={preferences}
                drafts={drafts}
            />
        </div>
    );

}
