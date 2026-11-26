import { Column } from '@ant-design/plots';

// 定义 Props 类型
interface ColumnProProps {
  height?: number;
  fields: string[];
  xAxisFormatter?: (value: unknown) => string;
  yAxisFormatter?: (value: unknown) => string;
  axis?: Record<string, any>;
  tooltipTitle?: (record: unknown) => string;
  tooltipItems?: Array<Record<string, any>>;
  [key: string]: any; // 允许扩展其他属性
}

/**
 * 默认配置项行为
 * */
const defaultConfig = {
  // 堆叠+分组
  series: (seriesField: string) => {
    if (seriesField) {
      return {
        seriesField,
        stack: {
          groupBy: ['x', 'series'],
          series: false,
        },
      };
    }
  },
};

const ColumnPro: React.FC<ColumnProProps> = ({
  height = 500,
  fields = [],
  xAxisFormatter = (v: unknown) => v,
  yAxisFormatter = (v: unknown) => v,
  axis,
  tooltipTitle = (r: unknown) => r[fields[0]],
  tooltipItems = [],
  ...rest
}) => {
  const config = {
    height,
    xField: fields[0],
    yField: fields[1],
    colorField: fields[2],
    ...defaultConfig.series(fields[3]),
    axis: {
      x: { labelFormatter: xAxisFormatter },
      y: { labelFormatter: yAxisFormatter },
      ...axis,
    },
    tooltip: {
      title: tooltipTitle,
      items: tooltipItems,
    },
    ...rest,
    style: {
      maxWidth: 50,
      ...rest.style,
    },
  };

  return <Column {...config} />;
};

export default ColumnPro;
