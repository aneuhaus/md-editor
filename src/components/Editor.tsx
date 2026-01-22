import React, { useEffect, useRef, forwardRef } from 'react';
import { EditorState } from '@codemirror/state';
import { EditorView, keymap, lineNumbers, highlightActiveLine, highlightActiveLineGutter } from '@codemirror/view';
import { defaultKeymap, history, historyKeymap, indentWithTab } from '@codemirror/commands';
import { markdown } from '@codemirror/lang-markdown';
import { oneDark } from '@codemirror/theme-one-dark';
import { syntaxHighlighting, defaultHighlightStyle, indentUnit } from '@codemirror/language';

interface EditorProps {
  value: string;
  onChange: (value: string) => void;
}

const Editor = forwardRef<HTMLDivElement, EditorProps>(({ value, onChange }, ref) => {
  const elementRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<EditorView | null>(null);

  // Sync internal ref with forwarded ref
  useEffect(() => {
    if (!ref) return;
    if (typeof ref === 'function') {
      ref(elementRef.current);
    } else {
      (ref as React.MutableRefObject<HTMLDivElement | null>).current = elementRef.current;
    }
  }, [ref]);

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

  return <div ref={elementRef} style={{ height: '100%', width: '100%' }} />;
});

export default Editor;
