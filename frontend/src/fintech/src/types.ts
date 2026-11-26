import dayjs from 'dayjs';
import React from 'react';

export type DataIndexPath = string | string[];

import type {
  ButtonProps,
  DatePickerProps,
  DescriptionsProps,
  DrawerProps,
  FormInstance,
  FormProps,
  ModalProps,
  SelectProps,
} from 'antd';

type DataSource = Record<string, any> | Record<string, any>[];
type RequestProps = {
  url?: string;
  dataPath?: string;
  params?: object;
};

// DescList 组件相关
export interface DescListProps extends DescriptionsProps, RequestProps {
  dataSource?: DataSource;
  defaultValue?: string;
  actionRef?: React.Ref<ActionRef>;
  formatData?: (v: any) => unknown;
  manualRequest?: boolean;
  columns?: {
    title?: React.ReactNode;
    tooltip?: React.ReactNode | (() => React.ReactNode);
    open?: boolean | ((res: DataSource) => void);
    span?: number;
    dataIndex?: DataIndexPath;
    sourceIndex?: number;
    unit?: string;
    render?: (text: any, record: Record<string, any>) => React.ReactNode;
    valueType?: 'text' | 'money' | 'jsonCode' | 'percent' | 'percent*100';
  }[];
}

// DatePicker 组件相关
export interface DateQuickProps
  extends Omit<DatePickerProps, 'value' | 'format' | 'disabledDate'> {
  value?:
    | undefined
    | string
    | dayjs.Dayjs
    | [string, string]
    | [dayjs.Dayjs, dayjs.Dayjs];
  format?: string;
  type?: 'RangePicker' | '';
  disabledDate?:
    | string
    | ((
        currentDate: dayjs.Dayjs,
        info: { from?: dayjs.Dayjs; type: any; dayjs: typeof dayjs },
      ) => boolean);
}

// Modal 组件相关
export interface ModalBoxProps extends DrawerProps {
  actionRef?: React.Ref<ActionRef>;
  okText?: string;
  cancelText?: string;
  onOk?: (res?: any) => void;
  content?: React.ReactNode;
  onCancel?: (res?: any) => void;
  afterOpen?: (eventProps?: object) => void;
  afterClose?: (eventProps?: object) => void;
  confirmLoading?: boolean;
  okButtonProps?: ButtonProps;
  cancelButtonProps?: ButtonProps;
  modalProps?: ModalProps;
  footer?: ('ok' | 'cancel' | React.ReactNode)[] | null;
  form?: boolean | FormProps;
  formReset?: boolean;
  confirm?: React.ReactNode;
  children?: any;
}

export interface LinkBtnProps extends Omit<ButtonProps, 'color' | 'loading'> {
  variant?: 'solid' | 'outlined' | 'dashed' | 'filled' | 'text' | 'link';
  method?: boolean;
  disabled?: boolean;
  loading?: boolean;
  to?: string;
  remark?: boolean;
  placeholder?: string;
  color?: string;
  open?: boolean;
  onOk?: (res?: any) => void;
  tooltip?: React.ReactNode;
  tooltipProps?: any;
}

// forwardRef 组件相关
export interface ActionRef {
  open?: (v: boolean) => void;
  reload?: () => void;
  getData?: () => void;
  form?: FormInstance;
  isComposing?: boolean;
}

// Select、CheckBox 组件等使用 options 相关的
type SimpleOption = string | number;

type LabelValueOption = {
  value: string;
  label: React.ReactNode;
};

type KeyNameOption = {
  [key in string]: any;
};

export type Options =
  | SimpleOption[]
  | Record<string, string>
  | LabelValueOption[]
  | KeyNameOption[];

export interface OptionTypes {
  fields?: string[];
  options?: Options;
  valueType?: string;
}

// SelectList 组件相关
export interface SelectListProps
  extends Omit<SelectProps<any>, 'options'>,
    OptionTypes {
  width?: string | number;
  filterOptions?: (item: any) => boolean;
  optionRender?: (item: any) => React.ReactNode;
  alert?: React.ReactNode;
  extraOptions?: any;
  localSearch?: boolean;
  linkProps?: object;
  filterSymbol?: string[];
  trigger?: 'load' | 'focus' | 'search';
  formatData?: (data: []) => unknown;
  searchFormat?: (t: string) => unknown;
  firstRequest?: boolean;
  cache?: boolean;
  onCompositionStart?: (e: any) => void;
  onCompositionEnd?: (e: any) => void;
  actionRef?: React.Ref<ActionRef>;
}

export interface SelectListAsyncProps extends SelectListProps, RequestProps {
  trigger?: 'load' | 'focus' | 'search';
  formatData?: (data: []) => unknown;
  searchFormat?: (t: string) => unknown;
  firstRequest?: boolean;
  cache?: boolean;
  dictKey?: string;
}

export type { SplitterBoxItem, SplitterBoxProps } from './SplitterBox';
