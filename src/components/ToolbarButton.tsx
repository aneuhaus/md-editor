import type { LucideIcon } from "lucide-react";

interface ToolbarButtonProps {
  onClick: () => void;
  title: string;
  shortcut?: string;
  icon?: LucideIcon;
}

export default function ToolbarButton({ onClick, title, shortcut, icon }: ToolbarButtonProps) {
  const IconComponent = icon as LucideIcon;
  return (
    <div onClick={onClick} className="toolbar-button" title={title} {...({ "data-key": shortcut } as any)}>
      <IconComponent size={16} style={{ opacity: 0.7 }} />
    </div>
  );
}
