import React from 'react';
import {
  Code,
  Code2,
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Subscript,
  Superscript,
  Smile,
} from "lucide-react";
import ToolbarButton from "./ToolbarButton";
import EmojiPicker from "./EmojiPicker";
import type { Emoji } from "../common/emojiMap";

interface ToolbarProps {
  shortcutKeys: boolean;
  onFormat: (type: 'bold' | 'italic' | 'strikethrough' | 'codeMulti' | 'codeSingle' | 'subscript' | 'superscript' | 'underline') => void;
  onToggleEmoji: () => void;
  showEmojiPicker: boolean;
  onEmojiSelect: (emoji: Emoji) => void;
  onCloseEmoji: () => void;
}

const Toolbar: React.FC<ToolbarProps> = ({
  shortcutKeys,
  onFormat,
  onToggleEmoji,
  showEmojiPicker,
  onEmojiSelect,
  onCloseEmoji,
}) => {
  return (
    <div className={`toolbar${shortcutKeys ? " show-shortcut-keys" : ""}`} {...({ "data-tauri-drag-region": "true" } as any)}>
      <ToolbarButton onClick={() => onFormat('codeMulti')} title="Multi Line Code" icon={Code} />
      <ToolbarButton onClick={() => onFormat('codeSingle')} title="Single Line Code" icon={Code2} />
      <div className="toolbar-separator" />
      <ToolbarButton onClick={() => onFormat('bold')} title="Bold" shortcut="B" icon={Bold} />
      <ToolbarButton onClick={() => onFormat('italic')} title="Italic" shortcut="I" icon={Italic} />
      <ToolbarButton onClick={() => onFormat('underline')} title="Underline" shortcut="U" icon={Underline} />
      <ToolbarButton onClick={() => onFormat('strikethrough')} title="Strikethrough" shortcut="T" icon={Strikethrough} />
      <ToolbarButton onClick={() => onFormat('subscript')} title="Subscript" icon={Subscript} />
      <ToolbarButton onClick={() => onFormat('superscript')} title="Superscript" icon={Superscript} />
      <div className="toolbar-separator" />
      <ToolbarButton onClick={onToggleEmoji} title="Emoji" shortcut="E" icon={Smile} />
      {showEmojiPicker && (
        <EmojiPicker 
          onSelect={onEmojiSelect} 
          onClose={onCloseEmoji}
        />
      )}
    </div>
  );
};

export default Toolbar;
