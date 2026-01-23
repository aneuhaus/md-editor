import type { LucideIcon } from "lucide-react";

interface ToolbarButtonProps {
  onClick: () => void;
  title: string;
  dataKey?: string;
  icon?: LucideIcon;
}

export default function ToolbarButton({ onClick, title, dataKey, icon }: ToolbarButtonProps) {
  const IconComponent = icon as LucideIcon;
  return (
    <div onClick={onClick} className="toolbar-button" title={title} data-key={dataKey}>
      <IconComponent size={16} style={{ opacity: 0.7 }} />
    </div>
  );
}
