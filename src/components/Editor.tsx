import React, { useEffect, useRef } from 'react';
import { EditorState } from '@codemirror/state';
import { EditorView, keymap, lineNumbers, highlightActiveLine, highlightActiveLineGutter } from '@codemirror/view';
import { defaultKeymap, history, historyKeymap, indentWithTab } from '@codemirror/commands';
import { markdown } from '@codemirror/lang-markdown';
import { oneDark } from '@codemirror/theme-one-dark';
import { syntaxHighlighting, defaultHighlightStyle, indentUnit } from '@codemirror/language';

interface EditorProps {
  value: string;
  onChange: (value: string) => void;
  ref?: React.Ref<HTMLDivElement>;
}

const Editor = ({ value, onChange, ref }: EditorProps) => {
  const elementRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<EditorView | null>(null);

  useEffect(() => {
    if (!elementRef.current) return;

    const startState = EditorState.create({
      doc: value,
      extensions: [
        lineNumbers(),
        highlightActiveLineGutter(),
        history(),
        highlightActiveLine(),
        syntaxHighlighting(defaultHighlightStyle, { fallback: true }),
        markdown(),
        oneDark,
        EditorView.lineWrapping,
        indentUnit.of("  "),
        keymap.of([indentWithTab, ...defaultKeymap, ...historyKeymap]),
        EditorView.updateListener.of((update) => {
          if (update.docChanged) {
            onChange(update.state.doc.toString());
          }
        }),
        EditorView.theme({
          "&": { height: "100%" },
          ".cm-scroller": { overflow: "auto" },
          ".cm-content": { lineHeight: "2rem" },
          ".cm-gutter": { 
            width: "2rem",
            padding: "0 0.25rem",
            borderRight: "1px solid #333",
          },
          ".cm-gutterElement": { 
            display: "flex",
            justifyContent: "center",
            flexDirection: "column",
          },
        })
      ],
    });

    const view = new EditorView({
      state: startState,
      parent: elementRef.current,
    });

    viewRef.current = view;

    return () => {
      view.destroy();
    };
  }, []); // Only run on mount

  // Sync value from outside if it changes (e.g. from file load)
  useEffect(() => {
    if (viewRef.current && value !== viewRef.current.state.doc.toString()) {
      viewRef.current.dispatch({
        changes: { from: 0, to: viewRef.current.state.doc.length, insert: value }
      });
    }
  }, [value]);

  const insertText = (text: string) => {
    if (!viewRef.current) return;
    const view = viewRef.current;
    const selection = view.state.selection.main;
    view.dispatch({
      changes: { from: selection.from, to: selection.to, insert: text },
      selection: { anchor: selection.from + text.length },
      scrollIntoView: true,
    });
    view.focus();
  };

  const insertFormat = (startTag: string, endTag: string) => {
    if (!viewRef.current) return;
    const view = viewRef.current;
    
    const selection = view.state.selection.main;
    const selectedText = view.state.sliceDoc(selection.from, selection.to);
    const textToInsert = startTag + selectedText + endTag;

    view.dispatch({
      changes: {
        from: selection.from,
        to: selection.to,
        insert: textToInsert,
      },
      selection: {
        anchor: selection.from + startTag.length,
        head: selection.from + startTag.length + selectedText.length,
      },
      scrollIntoView: true,
    });
    view.focus();
  };

  return (
    <div 
      ref={(node) => {
        // Internal ref
        elementRef.current = node;
        // External ref
        if (typeof ref === 'function') {
          ref(node);
        } else if (ref) {
          if(node){
            // @ts-ignore
            node.insertText = insertText;
            // @ts-ignore
            node.insertFormat = insertFormat;
          }
          ref.current = node;
        }
      }} 
      style={{ height: '100%', width: '100%' }} 
    />
  );
};

export default Editor;
