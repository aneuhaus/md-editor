import { useEffect, useRef, useImperativeHandle, forwardRef } from 'react';
import { EditorState } from '@codemirror/state';
import { EditorView, keymap, lineNumbers, highlightActiveLine, highlightActiveLineGutter } from '@codemirror/view';
import { defaultKeymap, history, historyKeymap, indentWithTab } from '@codemirror/commands';
import { markdown } from '@codemirror/lang-markdown';
import { oneDark } from '@codemirror/theme-one-dark';
import { syntaxHighlighting, defaultHighlightStyle, indentUnit } from '@codemirror/language';

export interface EditorHandle {
  insertText: (text: string) => void;
  insertFormat: (startTag: string, endTag: string) => void;
}

interface EditorProps {
  value: string;
  onChange: (value: string) => void;
}

const Editor = forwardRef<EditorHandle, EditorProps>(({ value, onChange }, ref) => {
  const elementRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<EditorView | null>(null);

  useImperativeHandle(ref, () => ({
    insertText,
    insertFormat
  }));

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
          ".cm-scroller": { overflow: "auto", padding: "1rem" },
          ".cm-gutters": { 
            display: "none",
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
    const before = view.state.sliceDoc(selection.from - startTag.length, selection.from);
    const after = view.state.sliceDoc(selection.to, selection.to + endTag.length);

    if (before === startTag && after === endTag) {
      // Toggle off: remove surrounding tags
      view.dispatch({
        changes: [
          { from: selection.from - startTag.length, to: selection.from, insert: "" },
          { from: selection.to, to: selection.to + endTag.length, insert: "" }
        ],
        selection: { 
          anchor: selection.from - startTag.length, 
          head: selection.to - startTag.length 
        },
        scrollIntoView: true,
      });
    } else {
      // Toggle on: add surrounding tags
      const selectedText = view.state.sliceDoc(selection.from, selection.to);
      view.dispatch({
        changes: {
          from: selection.from,
          to: selection.to,
          insert: startTag + selectedText + endTag,
        },
        selection: {
          anchor: selection.from + startTag.length,
          head: selection.from + startTag.length + selectedText.length,
        },
        scrollIntoView: true,
      });
    }
    view.focus();
  };

  return (
    <div 
      ref={elementRef} 
      style={{ height: '100%', width: '100%' }} 
    />
  );
});

Editor.displayName = 'Editor';

export default Editor;
