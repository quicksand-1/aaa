import { Line } from '@ant-design/plots';

// 定义 Props 类型
interface LineProProps {
  height?: number;
  fields: string[];
  style?: React.CSSProperties;
  smooth?: boolean;
  point?: boolean | Record<string, any>;
  xAxisFormatter?: (value: unknown) => string;
  yAxisFormatter?: (value: unknown) => string;
  axis?: Record<string, any>;
  tooltipTitle?: (record: unknown) => string;
  tooltipItems?: Array<Record<string, any>>;
  label?: Record<string, any> | boolean;
  [key: string]: any; // 允许扩展其他属性
}

/**
 * 默认配置项行为
 * */
const defaultConfig = {
  // 平滑曲线
  smooth: (smooth: boolean) => ({
    shapeField: smooth ? 'smooth' : undefined,
  }),

  // 圆点配置函数
  point: (point: boolean | Record<string, any>) => {
    const defaultConfig = {
      shapeField: 'circle',
      sizeField: 2,
    };
    if (typeof point === 'boolean' && point) {
      return defaultConfig;
    }

    if (typeof point === 'object') {
      return { ...defaultConfig, ...point };
    }

    return undefined;
  },

  // label，每个圆点上方展示的值
  label: (label: boolean | Record<string, any>) => {
    const defaultConfig = {
      textBaseline: 'bottom',
      transform: [{ padding: 20, type: 'overlapHide' }],
    };
    if (typeof label === 'boolean' && label) {
      return defaultConfig;
    }

    if (typeof label === 'object') {
      return { ...defaultConfig, ...label };
    }

    return undefined;
  },
};

const LinePro: React.FC<LineProProps> = ({
  height = 500,
  fields = [],
  style = {},
  smooth = true,
  point = true,
  xAxisFormatter = (v: unknown) => `${v}`,
  yAxisFormatter = (v: unknown) => `${v}`,
  axis = {},
  tooltipTitle = (r: unknown) => r[fields[0]],
  tooltipItems = [],
  label = false,
  ...rest
}) => {
  const config: Record<string, any> = {
    height,
    xField: fields[0],
    yField: fields[1],
    colorField: fields[2],
    style: { lineWidth: 1.6, ...style },
    label: defaultConfig.label(label),
    point: defaultConfig.point(point),
    axis: {
      x: { labelFormatter: xAxisFormatter },
      y: { labelFormatter: yAxisFormatter },
      ...axis,
    },
    tooltip: { title: tooltipTitle, items: tooltipItems },
    ...defaultConfig.smooth(smooth),
    ...rest,
  };

  return <Line {...config} />;
};

export default LinePro;
