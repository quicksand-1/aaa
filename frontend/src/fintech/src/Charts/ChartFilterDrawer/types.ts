export interface ChartFilterDrawerProps {
  data: any[];
  colorField: string;
  children: (filteredData: any[], categories: string[]) => React.ReactNode;
  trigger?: React.ReactNode;
  initialVisibleCount?: number;
  style?: React.CSSProperties;
  className?: string;
  drawerProps?: any;
}

export interface FilterPanelProps {
  categories: string[];
  visibleItems: Set<string>;
  onToggleItem: (category: string) => void;
  onToggleAll: (visible: boolean) => void;
  searchKeyword: string;
  onSearchChange: (keyword: string) => void;
}
