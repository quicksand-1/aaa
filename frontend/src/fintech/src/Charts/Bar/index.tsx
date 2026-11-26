import { Bar } from '@ant-design/plots';

// 定义 Props 类型
interface BarProProps {
  height?: number;
  autoHeight?: boolean;
  fields: string[];
  xAxisFormatter?: (value: unknown) => string;
  yAxisFormatter?: (value: unknown) => string;
  axis?: Record<string, any>;
  tooltipTitle?: (record: unknown) => string;
  tooltipItems?: Array<Record<string, any>>;
  [key: string]: any; // 允许扩展其他属性
}

const BarPro: React.FC<BarProProps> = ({
  height = 500,
  autoHeight = true,
  fields = [],
  xAxisFormatter = (v: unknown) => `${v}`,
  yAxisFormatter = (v: unknown) => `${v}`,
  axis = {},
  tooltipTitle = (r: unknown) => r[fields[0]],
  tooltipItems = [],
  data = [],
  ...rest
}) => {
  const config: Record<string, any> = {
    height: autoHeight
      ? data.length > 20
        ? data.length * 25
        : height
      : height,
    xField: fields[0],
    yField: fields[1],
    colorField: fields[2],
    axis: {
      x: { labelFormatter: xAxisFormatter },
      y: { labelFormatter: yAxisFormatter },
      ...axis,
    },
    tooltip: { title: tooltipTitle, items: tooltipItems },
    data,
    ...rest,
    style: {
      maxWidth: 50,
      ...rest.style,
    },
  };

  return <Bar {...config} />;
};

export default BarPro;
