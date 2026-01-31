import React from 'react';

interface ToolbarProps {
  showShortcutKeys: boolean;
  children: React.ReactNode;
}

const Toolbar: React.FC<ToolbarProps> = ({
  showShortcutKeys,
  children,
}) => {

  return (
    <div className={`toolbar${showShortcutKeys ? " show-shortcut-keys" : ""}`} {...({ "data-tauri-drag-region": "true" } as any)}>
      {children}
    </div>
  );
};

export default Toolbar;
