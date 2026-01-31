import { useState, useEffect } from 'react';

export type KeyBindings = Record<string, () => void>;

export const useKeyBindings = (bindings: KeyBindings) => {
  const [shortcutKeys, setShortcutKeys] = useState(false);
  let showShortcutKeysTimeout: number;

  const showShortcutKeysHint = () => {
    clearTimeout(showShortcutKeysTimeout);
    showShortcutKeysTimeout = window.setTimeout(setShortcutKeys, 600, true);
  };

  const hideShortcutKeysHint = () => {
    clearTimeout(showShortcutKeysTimeout);
    setShortcutKeys(false);
    showShortcutKeysTimeout = window.setTimeout(setShortcutKeys, 600, false);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey) {
        showShortcutKeysHint();
        if (e.key.toLowerCase() in bindings) {
          e.preventDefault();
          bindings[e.key.toLowerCase()]();
        }
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      // If none of the modifier keys are pressed anymore, hide hints
      if (!e.metaKey && !e.ctrlKey) {
        hideShortcutKeysHint();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      clearTimeout(showShortcutKeysTimeout);
    };
  }, [bindings]);

  return { shortcutKeys };
};
