import { useState, useEffect, useRef } from "react";
import { onOpenUrl } from "@tauri-apps/plugin-deep-link";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { invoke } from "@tauri-apps/api/core";
import { listen } from "@tauri-apps/api/event";
import { readTextFile } from "@tauri-apps/plugin-fs";
import {
  BarChart,
} from "lucide-react";
import Editor from "./components/Editor";
import Toolbar from "./components/Toolbar";
import Preview from "./components/Preview";
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
  const [shortcutKeys, setShortcutKeys] = useState(false)
    

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
      console.log("setupDeepLink");
      return await onOpenUrl((urls) => {
        console.log(urls);
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

  useEffect(() => {
    console.dir(getCurrentWindow());
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey) {
        showShortcutKeys();
        switch (e.key) {
          case 's':
            e.preventDefault();
            saveFile();
            break;
          case 'f':
            e.preventDefault();
            invoke("toggle_fullscreen");
            break;
          case 'o':
            e.preventDefault();
            openFileDialog();
            break;
          case 'b':
            e.preventDefault();
            handleFormat('bold');
            break;
          case 'i':
            e.preventDefault();
            handleFormat('italic');
            break;
          case 'u':
            e.preventDefault();
            handleFormat('underline');
            break;
          case 'x':
            e.preventDefault();
            handleFormat('strikethrough');
            break;
          case 'e':
            e.preventDefault();
            toggleEmojiPicker();
            break;
        }  
      }
    };
    const handleKeyUp = () => {
      hideShortcutKeys(); 
    }
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
    };
  }, [content, filePath]);

  let showShortcutKeysTimeout: number;

  const showShortcutKeys = () => {
    console.log("showShortcutKeys");
    clearTimeout(showShortcutKeysTimeout);
    showShortcutKeysTimeout = setTimeout(() => {
      console.log("showShortcutKeys true");
      setShortcutKeys(true);
    }, 600);
  }

  const hideShortcutKeys = () => {
    clearTimeout(showShortcutKeysTimeout);
    setShortcutKeys(false);
  }

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

  const editorRef = useRef<React.ComponentRef<typeof Editor>>(null);

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
      setLeftWidth(newWidth-2);
    }
  };

  const toggleEmojiPicker = () => {
    setShowEmojiPicker(!showEmojiPicker);
  };

  const handleEmojiSelect = (emoji: Emoji) => {    
    if (editorRef.current) {
      // @ts-ignore - custom method added in Editor.tsx
      if (typeof editorRef.current.insertText === 'function') {
         // @ts-ignore
        editorRef.current.insertText(emoji.emoji);        
      }
    }
    setShowEmojiPicker(false);
  };

  const handleFormat = (type: 'bold' | 'italic' | 'strikethrough' | 'codeMulti' | 'codeSingle' | 'subscript' | 'superscript' | 'underline') => {
    if (editorRef.current) {
      if (typeof (editorRef.current as any).insertFormat === 'function') {
        let start = '';
        let end = '';
        switch(type) {
          case 'bold': start = '**'; end = '**'; break;
          case 'italic': start = '*'; end = '*'; break;
          case 'strikethrough': start = '~~'; end = '~~'; break;
          case 'codeMulti': start = '\n```\n'; end = '\n```\n'; break;
          case 'codeSingle': start = '`'; end = '`'; break;
          case 'subscript': start = '<sub>'; end = '</sub>'; break;
          case 'superscript': start = '<sup>'; end = '</sup>'; break;
          case 'underline': start = '<u>'; end = '</u>'; break;
        }
        (editorRef.current as any).insertFormat(start, end);
      }
    }
  };

  return (
    <>

      <div className={`app-container${fullscreen ? " fullscreen" : ""}`}>

        <div className="split-pane">
          <div className="pane editor-pane" style={{ width: `calc(${leftWidth}% - 2px)`, flex: 'none' }}>
            <Toolbar 
              shortcutKeys={shortcutKeys}
              onFormat={handleFormat}
              onToggleEmoji={toggleEmojiPicker}
              showEmojiPicker={showEmojiPicker}
              onEmojiSelect={handleEmojiSelect}
              onCloseEmoji={() => setShowEmojiPicker(false)}
              {...({ "data-tauri-drag-region": "true" } as any)}
            />
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
