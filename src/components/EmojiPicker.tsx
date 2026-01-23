import React, { useState, useMemo } from 'react';
import { EMOJI_MAP } from '../common/emojiMap';
import type { Emoji } from '../common/emojiMap';
import { Search } from 'lucide-react';

interface EmojiPickerProps {
  onSelect: (emoji: Emoji) => void;
  onClose: () => void;
  style?: React.CSSProperties;
}

const favoriteEmojis = [
  "😀", "😂", "🥰", "😎", "🤔",
  "👍", "👎", "👋", "🙌", "🔥",
  "🎉", "✨", "🚀", "💡", "📝",
  "✅", "❌", "❓", "⚠️", "🛑",
  "💻", "📱", "📷", "🎥", "🎵",
  "🍔", "🍕", "☕", "🍺", "🍷",
  "⚽", "🏀", "🚗", "✈️", "🏠",
  "🐶", "🐱", "🐭", "🐹", "🐰",
  "❤️", "💔", "💯", "💢", "💤"
].map((emoji) => EMOJI_MAP.find((e) => e.emoji.includes(emoji))) as Emoji[];

const EmojiPicker: React.FC<EmojiPickerProps> = ({ onSelect, onClose, style }) => {
  const [search, setSearch] = useState("");
  const dialogRef = React.useRef<HTMLDialogElement>(null);

  React.useEffect(() => {
    if (dialogRef.current) {
      dialogRef.current.showModal();
    }
  }, []);

  const handleClose = () => {
    if (dialogRef.current) {
      dialogRef.current.close();
    }
    onClose();
  };

  const handleBackdropClick = (e: React.MouseEvent<HTMLDialogElement>) => {
    if (e.target === dialogRef.current) {
      handleClose();
    }
  };

  const filteredEmojis = useMemo((): Emoji[] =>  {
    if(search===""){
      return favoriteEmojis;
    }
    const foundNames = EMOJI_MAP.filter((emoji) => emoji.keywords.some((keyword) => keyword.toLowerCase().includes(search.toLowerCase())));
    return foundNames as Emoji[];
  }, [search]);

  return (
    <dialog
      ref={dialogRef}
      className="emoji-picker-dialog"
      closedby="any"
      onClick={handleBackdropClick}
      onClose={onClose}
      style={{ 
        padding: '0', 
        border: 'none', 
        background: 'transparent', 
        margin: 'auto',
        ...style 
      }}
    >
      <div 
        className="emoji-picker" 
        style={{ 
          position: 'relative', 
          zIndex: 1000, 
          background: '#1e1e1e', 
          border: '1px solid #333', 
          borderRadius: '8px', 
          boxShadow: '0 4px 6px rgba(0,0,0,0.3)',
          padding: '8px',
          width: '200px', // Approx for 5 cols
        }}
      >
        <div style={{ position: 'relative', marginBottom: '8px' }}>
          <input
            type="text"
            placeholder="Search..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            autoFocus
            style={{
              width: '100%',
              padding: '4px 8px 4px 24px',
              borderRadius: '4px',
              border: '1px solid #444',
              background: '#2d2d2d',
              color: '#fff',
              fontSize: '12px',
              outline: 'none'
            }}
          />
          <Search size={12} style={{ position: 'absolute', left: '6px', top: '7px', color: '#888' }} />
        </div>
        <div 
          style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(5, 1fr)', 
            gap: '4px',
            height: '160px',
            overflowY: 'auto'
          }}
        >
          {filteredEmojis.map((emoji, idx) => {
            if(!emoji) return null;
            return (
            <button
              key={idx}
              title={emoji.keywords.join(', ')}
              onClick={() => onSelect(emoji)}
              style={{
                background: 'transparent',
                border: 'none',
                fontSize: '20px',
                cursor: 'pointer',
                padding: '2px',
                borderRadius: '4px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                height: 'fit-content',
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = '#333'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
            >
              {emoji.emoji}
            </button>
          )})}
        </div>
      </div>
    </dialog>
  );
};

export default EmojiPicker;
