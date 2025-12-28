export interface ColumnVisibilityControlsProps {
  columns: any[];
  onColumnToggle: (columnId: string, visible: boolean) => void;
}
