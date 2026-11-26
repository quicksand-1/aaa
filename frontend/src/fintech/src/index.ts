import { Form } from 'antd';

// 表单
export { default as FormItem } from './FormItem';
export { default as FormSchema } from './FormItem/schema';
export { default as FormUpdate } from './FormItem/update';
export { Form };

// 基础组件
export { default as AsyncSwitch } from './AsyncSwitch';
export { default as AsyncTree } from './AsyncTree';
export { default as AutoRefresh } from './AutoRefresh';
export { default as CheckList } from './CheckList';
export { default as Chronobreak } from './Chronobreak';
export { default as CollapseList } from './CollapseList';
export { default as DateQuick } from './DateQuick';
export { default as DescList } from './DescList';
export { default as Download } from './Download';
export { default as DrawerBox } from './DrawerBox';
export { default as EditTable } from './EditTable';
export { default as Iframe } from './Iframe';
export { default as JsonCode } from './JsonCode';
export { default as Keyboard } from './Keyboard';
export { default as LinkBtn } from './LinkBtn';
export { default as localConfig } from './localConfig';
export { default as MagicTabs } from './MagicTabs';
export { default as More } from './More';
export { default as Observer } from './Observer';
export { default as ProTableAsync } from './ProTableAsync';
export { default as RadioList } from './RadioList';
export { default as SelectList } from './SelectList';
export { default as SplitterBox } from './SplitterBox';
export { default as StatusBadge } from './StatusBadge';
export { default as StatusTag } from './StatusTag';

export { default as ActionsContainer } from './ActionsContainer';

// 权限组件
export { default as Permission } from './Permission';

// 特殊组件，会异步加载 public/assets 下的资源
export { default as CodeMirror } from './CodeMirror';
export { default as Excel2Json } from './Excel2Json';
export { default as Highlight } from './Highlight';
export { default as Html2Image } from './Html2Image';

// 图表组件
export { default as BarPro } from './Charts/Bar';
export { default as BasePro } from './Charts/Base';
export { default as ChartFilterDrawer } from './Charts/ChartFilterDrawer';
export { default as ColumnPro } from './Charts/Column';
export { default as LinePro } from './Charts/Line';

// 工单
export { default as TicketBell } from './Ticket/Bell';
export { default as TicketContainer } from './Ticket/Container';
export { default as TicketDrawer } from './Ticket/Drawer';
export { default as TicketStatusEnum } from './Ticket/statusEnum';
export { default as TicketStorage } from './Ticket/storage';

// 工具
export { default as autoUpdate } from './utils/autoUpdate';
export { default as calculateCharacterLength } from './utils/calculateCharacterLength';
export { default as clipboard } from './utils/clipboard';
export { default as desensitize } from './utils/desensitize';
export { default as fileController } from './utils/fileController';
export { default as fullScreen } from './utils/fullScreen';
export { default as genNewID } from './utils/genNewID';
export { default as getUrlParams } from './utils/getUrlParams';
export { default as idCardInfo } from './utils/idCardInfo';
export { default as intlDate } from './utils/intlDate';
export { default as online } from './utils/online';
export { default as parseNestedJSON } from './utils/parseNestedJSON';
export { default as regexp } from './utils/regexp';
export { default as storageSQL } from './utils/storageSQL';
export { default as toThousands } from './utils/toThousands';
export { default as toTools } from './utils/toTools';

// 请求相关
export { default as cacheRequest } from './fetch/cacheRequest';
export { default as fetchSSE } from './fetch/fetchSSE';
export { default as request } from './fetch/request';

// 内部使用方法
export { default as _copy } from './utils/_copy';
export { default as _filter } from './utils/_filter';
export { default as _format } from './utils/_format';
export { default as _isReactNode } from './utils/_isReactNode';

// hooks
export { default as useAsyncScripts } from './hooks/useAsyncScripts';
export { default as useComposing } from './hooks/useComposing';
export { default as useCrypto } from './hooks/useCrypto';
export { default as useDate } from './hooks/useDate';
export { default as useDebounce } from './hooks/useDebounce';
export { default as useHtml2Image } from './hooks/useHtml2Image';
export { default as useKeyboard } from './hooks/useKeyboard';
export { default as useScrollAnchor } from './hooks/useScrollAnchor';

// Class
export { default as GlobalScheduler } from './class/GlobalScheduler';
export { default as Resizable } from './class/Resizable';

// type
export type { SplitterBoxItem, SplitterBoxProps } from './SplitterBox';
export type {
  ActionRef,
  DateQuickProps,
  DescListProps,
  ModalBoxProps,
} from './types';
