import { useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";
import { readTextFile } from "@tauri-apps/plugin-fs";
import { Edit3, Eye, FileText, BarChart } from "lucide-react";
import Editor from "./components/Editor";
import Preview from "./components/Preview";
import "./index.css";

function App() {
  const [content, setContent] = useState("# Welcome to Markdown Editor\n\nStart typing to see the preview on the right.");
  const [filePath, setFilePath] = useState<string | null>(null);
  const [leftWidth, setLeftWidth] = useState(50); // percentage
  const [isResizing, setIsResizing] = useState(false);

  useEffect(() => {
    const handleArgs = async () => {
      try {
        const argv = await invoke<string[]>("get_args");
        console.log(argv);
        if (argv.length >= 1) {
          // Find the first argument that ends with .md
          const path = argv.find(arg => arg.endsWith('.md'));
          if (path) {
            const data = await readTextFile(path);
            setContent(data);
            setFilePath(path);
          }
        }
      } catch (err) {
        console.error("Failed to read args or file:", err);
      }
    };
    handleArgs();
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
      const data = await readTextFile(selected);
      setContent(data);
      setFilePath(selected);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 's') {
        e.preventDefault();
        saveFile();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [content, filePath]);

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
      setLeftWidth(newWidth);
    }
  };

  useEffect(() => {
    if (isResizing) {
      window.addEventListener('mousemove', onResize);
      window.addEventListener('mouseup', stopResizing);
    } else {
      window.removeEventListener('mousemove', onResize);
      window.removeEventListener('mouseup', stopResizing);
    }
    return () => {
      window.removeEventListener('mousemove', onResize);
      window.removeEventListener('mouseup', stopResizing);
    };
  }, [isResizing]);

  return (
    <div className="app-container">
      <div className="title-bar" {...({ "data-tauri-drag-region": "true" } as any)}>
        <FileText size={16} style={{ marginRight: 8, opacity: 0.7 }} />
        {filePath ? `${filePath.split('/').pop()}` : "Untitled.md"}
      </div>
      <div className="split-pane">
        <div className="pane editor-pane" style={{ width: `${leftWidth}%`, flex: 'none' }}>
          <div className="pane-header">
            <Edit3 size={14} style={{ marginRight: 8 }} />
            Editor
          </div>
          <div className="pane-content" style={{ flex: 1, overflow: 'hidden' }}>
            <Editor value={content} onChange={setContent} />
          </div>
        </div>
        
        <div className="resizer" onMouseDown={startResizing} />

        <div className="pane preview-pane" style={{ width: `${100 - leftWidth}%`, flex: 'none' }}>
          <div className="pane-header">
            <Eye size={14} style={{ marginRight: 8 }} />
            Preview
          </div>
          <div className="pane-content" style={{ flex: 1, overflow: 'auto' }}>
            <Preview content={content} />
          </div>
        </div>
      </div>
      <div className="status-bar">
        <div className={`status-item file-info ${!filePath ? "no-file" : ""}`} onClick={openFileDialog}>
          <FileText size={12} style={{ marginRight: 4, verticalAlign: 'middle' }} />
          {filePath ? filePath : "No file open"}
        </div>
        <div className="spacer" />
        <div className="status-item">
          <BarChart size={12} style={{ marginRight: 4, verticalAlign: 'middle' }} />
          {content.split(/\s+/).filter(Boolean).length} words
        </div>
        <div className="status-item">
          {content.length} characters
        </div>
      </div>
    </div>
  );
}

export default App;
