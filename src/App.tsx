import { useState, useEffect, useRef } from "react";
import { onOpenUrl } from "@tauri-apps/plugin-deep-link";
import { invoke } from "@tauri-apps/api/core";
import { listen } from "@tauri-apps/api/event";
import { readTextFile } from "@tauri-apps/plugin-fs";

import {
  BarChart, Code, Code2, Bold, Italic, Underline,
  Strikethrough, Subscript, Superscript, Smile,
} from "lucide-react";

import Editor, { EditorHandle } from "./components/Editor";
import Toolbar from "./components/Toolbar";
import ToolbarButton from "./components/ToolbarButton";
import EmojiPicker from "./components/EmojiPicker";
import Preview from "./components/Preview";

import { useKeyBindings } from "./common/useKeyBindings";

import "./index.css";

import { useDebounce } from "./common/customHooks";

import type { Emoji } from "./common/emojiMap";

function App() {
  const [content, setContent] = useState("# Welcome to Markdown Editor\n\nStart typing to see the preview on the right.");
  const [filePath, setFilePath] = useState<string | null>(null);
  const [leftWidth, setLeftWidth] = useState(48); // percentage
  const [isResizing, setIsResizing] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);


  const handleFullscreenChange = useDebounce(async () => {
    const isFullscreen = await invoke<boolean>("is_fullscreen");
    setFullscreen(isFullscreen);
  }, 100);

  useEffect(() => {
    handleFullscreenChange();
    const unlisten = listen<boolean>("tauri://resize", () => {
      handleFullscreenChange();
    });
    return () => {
      unlisten.then(f => f());
    };
  }, []);

  const openFile = async (path: string) => {
    try {
      const data = await readTextFile(path);
      setContent(data);
      setFilePath(path);
    } catch (err) {
      console.error("Failed to open file:", err);
    }
  };

  useEffect(() => {
    const handleArgs = async () => {
      try {
        const argv = await invoke<string[]>("get_args");
        if (argv.length >= 1) {
          const path = argv.find(arg => arg.endsWith('.md'));
          if (path) {
            openFile(path);
          }
        }
      } catch (err) {
        console.error("Failed to read args:", err);
      }
    };
    handleArgs();
  }, []);

  useEffect(() => {
    const setupDeepLink = async () => {
      return await onOpenUrl((urls) => {
        const path = urls[0];
        if (path) {
          let cleanPath = path;
          if (cleanPath.startsWith('file://')) {
            cleanPath = decodeURIComponent(cleanPath.replace('file://', ''));
          }
          openFile(cleanPath);
        }
      });
    };

    let unlisten: any;
    setupDeepLink().then(u => unlisten = u);
    return () => {
      if (unlisten) unlisten();
    };
  }, []);

  const saveFile = async () => {
    if (!filePath) return;
    try {
      const { writeTextFile } = await import("@tauri-apps/plugin-fs");
      await writeTextFile(filePath, content);
      console.log("File saved!");
    } catch (err) {
      console.error("Failed to save file:", err);
    }
  };

  const editorRef = useRef<EditorHandle>(null);

  useEffect(() => {
    if (isResizing) {
      document.body.style.userSelect = "none";
      // @ts-ignore
      document.body.style["-webkit-user-select"] = "none";
      window.addEventListener('mousemove', onResize);
      window.addEventListener('mouseup', stopResizing);
    } else {
      document.body.style.userSelect = "auto";
      // @ts-ignore
      document.body.style["-webkit-user-select"] = "auto";
      window.removeEventListener('mousemove', onResize);
      window.removeEventListener('mouseup', stopResizing);
    }
    return () => {
      window.removeEventListener('mousemove', onResize);
      window.removeEventListener('mouseup', stopResizing);
    };
  }, [isResizing]);

  const openFileDialog = async () => {
    const { open } = await import("@tauri-apps/plugin-dialog");
    const selected = await open({
      multiple: false,
      filters: [
        {
          name: "Markdown",
          extensions: ["md"],
        },
      ],
    });
    if (selected) {
      openFile(selected);
    }
  };

  const startResizing = () => {
    setIsResizing(true);
  };

  const stopResizing = () => {
    setIsResizing(false);
  };

  const onResize = (e: any) => {
    if (!isResizing) return;
    const newWidth = (e.clientX / window.innerWidth) * 100;
    if (newWidth > 10 && newWidth < 90) {
      setLeftWidth(newWidth - 2);
    }
  };

  const toggleEmojiPicker = () => {
    setShowEmojiPicker(!showEmojiPicker);
  };

  const handleEmojiSelect = (emoji: Emoji) => {
    if (editorRef.current) {
      editorRef.current.insertText(emoji.emoji);
    }
    setShowEmojiPicker(false);
  };

  const formattingHandlers: { [key: string]: string[] } = {
    'bold': ['**', '**'],
    'italic': ['*', '*'],
    'strikethrough': ['~~', '~~'],
    'codeMulti': ['\n```\n', '\n```\n'],
    'codeSingle': ['`', '`'],
    'subscript': ['<sub>', '</sub>'],
    'superscript': ['<sup>', '</sup>'],
    'underline': ['<u>', '</u>'],
  }

  const handleFormat = (type: keyof typeof formattingHandlers) => {
    if (editorRef.current) {
      let [start, end] = formattingHandlers[type];
      editorRef.current.insertFormat(start, end);
    }
  };

  const toggleFullscreen = () => {
    invoke("toggle_fullscreen");
  };

  const { shortcutKeys } = useKeyBindings({
    's': saveFile,
    'f': toggleFullscreen,
    'o': openFileDialog,
    'b': () => handleFormat('bold'),
    'i': () => handleFormat('italic'),
    'u': () => handleFormat('underline'),
    't': () => handleFormat('strikethrough'),
    'e': toggleEmojiPicker,
  });

  return (
    <>

      <div className={`app-container${fullscreen ? " fullscreen" : ""}`}>

        <div className="split-pane">
          <div className="pane editor-pane" style={{ width: `calc(${leftWidth}% - 2px)`, flex: 'none' }}>
            <Toolbar showShortcutKeys={shortcutKeys} {...({ "data-tauri-drag-region": "true" } as any)}>
              <ToolbarButton onClick={() => handleFormat('codeMulti')} title="Multi Line Code" icon={Code} />
              <ToolbarButton onClick={() => handleFormat('codeSingle')} title="Single Line Code" icon={Code2} />
              <div className="toolbar-separator" />
              <ToolbarButton onClick={() => handleFormat('bold')} title="Bold" shortcut="B" icon={Bold} />
              <ToolbarButton onClick={() => handleFormat('italic')} title="Italic" shortcut="I" icon={Italic} />
              <ToolbarButton onClick={() => handleFormat('underline')} title="Underline" shortcut="U" icon={Underline} />
              <ToolbarButton onClick={() => handleFormat('strikethrough')} title="Strikethrough" shortcut="T" icon={Strikethrough} />
              <ToolbarButton onClick={() => handleFormat('subscript')} title="Subscript" icon={Subscript} />
              <ToolbarButton onClick={() => handleFormat('superscript')} title="Superscript" icon={Superscript} />
              <div className="toolbar-separator" />
              <ToolbarButton onClick={toggleEmojiPicker} title="Emoji" shortcut="E" icon={Smile} />
              {showEmojiPicker && (
                <EmojiPicker
                  onSelect={handleEmojiSelect}
                  onClose={() => setShowEmojiPicker(false)}
                />
              )}
            </Toolbar>
            <div className="pane-content" style={{ flex: 1, overflow: 'hidden' }}>
              <Editor ref={editorRef} value={content} onChange={setContent} />
            </div>
          </div>

          <div className="resizer" onMouseDown={startResizing} />

          <div className="pane preview-pane" style={{ width: `calc(${100 - leftWidth}% - 2px)`, flex: 'none' }}>
            <div className="pane-content" style={{ flex: 1, overflow: 'auto' }}>
              <Preview content={content} />
            </div>
          </div>
        </div>

      </div>

      <div className="status-bar">
        <div className={`status-item file-info ${!filePath ? "no-file" : ""}`} onClick={openFileDialog}>
          {filePath ? filePath : "No file open"}
        </div>
        <div className="spacer" />
        <div className="status-item">
          <BarChart size={12} style={{ marginRight: 4 }} />
          {content.split(/\s+/).filter(Boolean).length} words
        </div>
        <div className="status-item">
          {content.length} characters
        </div>
      </div>

    </>
  );
}

export default App;
