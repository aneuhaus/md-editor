import { useState, useEffect, useRef } from "react";
import { onOpenUrl } from "@tauri-apps/plugin-deep-link";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { invoke } from "@tauri-apps/api/core";
import { listen } from "@tauri-apps/api/event";
import { readTextFile } from "@tauri-apps/plugin-fs";
import { 
  // Edit3,
  // Eye,
  FileText,
  BarChart
} from "lucide-react";
import Editor from "./components/Editor";
import Preview from "./components/Preview";
import "./index.css";

import { useDebounce } from "./customHooks";

function App() {
  const [content, setContent] = useState("# Welcome to Markdown Editor\n\nStart typing to see the preview on the right.");
  const [filePath, setFilePath] = useState<string | null>(null);
  const [leftWidth, setLeftWidth] = useState(48); // percentage
  const [isResizing, setIsResizing] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);

  const handleFullscreenChange = useDebounce(async () => {
    const isFullscreen = await invoke<boolean>("is_fullscreen");
    console.log("isFullscreen", isFullscreen);
    setFullscreen(isFullscreen);
  }, 100);

  useEffect(() => {
    console.log("handleFullscreenChange");
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
      if ((e.metaKey || e.ctrlKey) && e.key === 's') {
        e.preventDefault();
        saveFile();
      }
      if ((e.metaKey || e.ctrlKey) && e.key === 'f') {
        e.preventDefault();
        invoke("toggle_fullscreen");
      }
      if ((e.metaKey || e.ctrlKey) && e.key === 'o') {
        e.preventDefault();
        openFileDialog();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [content, filePath]);

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

  const editorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isResizing) {
      if(editorRef.current) {
        editorRef.current.style.userSelect = "none";
        // @ts-ignore
        editorRef.current.style["-webkit-user-select"] = "none";
      }
      window.addEventListener('mousemove', onResize);
      window.addEventListener('mouseup', stopResizing);
    } else {
      if(editorRef.current) {
        editorRef.current.style.userSelect = "auto";
        // @ts-ignore
        editorRef.current.style["-webkit-user-select"] = "auto";
      }
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

  return (
    <>
      <div className={`app-container${fullscreen ? " fullscreen" : ""}`}>
        <div className="title-bar" {...({ "data-tauri-drag-region": "true" } as any)}>
          <FileText size={16} style={{ marginRight: 8, opacity: 0.7 }} />
          {filePath ? `${filePath.split('/').pop()}` : "Untitled.md"}
        </div>
        <div className="split-pane">
          <div className="pane editor-pane" style={{ width: `calc(${leftWidth}% - 2px)`, flex: 'none' }}>
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
          <FileText size={12} style={{ marginRight: 8 }} />
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
