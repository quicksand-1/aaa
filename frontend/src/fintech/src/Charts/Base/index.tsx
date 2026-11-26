import { Base } from '@ant-design/plots';

const BasePro = (props: any) => {
  const {
    height = 500,
    items = [],
    xAxisFormatter = (v: unknown) => v,
    yAxisFormatter = (v: unknown) => v,
    ...rest
  } = props;

  const config = {
    height,
    axis: {
      x: { title: false, labelFormatter: xAxisFormatter },
      y: { title: false, labelFormatter: yAxisFormatter },
    },
    children: items.map((child: any) => {
      const {
        fields = [],
        tooltipTitle = (r: unknown) => r[fields[0]],
        tooltipItems = [],
        ...c
      } = child;

      /**
       * 自动属性添加，根据指定条件触发默认属性增加
       * 1、当出现堆叠+分组时，自动添加 stack 默认属性
       * */
      let autoConfig: any = {
        encode: {
          x: fields[0],
          y: fields[1],
          color: fields[2],
          series: fields[3],
        },
      };
      // 如果是点图
      if (c.type === 'point') {
        autoConfig.encode = {
          ...autoConfig.encode,
          size: fields[2],
          shape: fields[2],
        };
        // 默认变成实心的圆点
        autoConfig.scale = {
          size: { range: [2, 2] },
          shape: { range: ['point', 'point'] },
        };
      }
      // 如果是折线
      if (c.type === 'line') {
        autoConfig.scale = {
          style: {
            lineWidth: 1.6, // 线的粗细
          },
        };
        autoConfig.shapeField = 'smooth';
      }

      return {
        tooltip: {
          title: tooltipTitle,
          items: tooltipItems,
        },
        ...autoConfig,
        ...c,
      };
    }),
    ...rest,
  };

  return <Base {...config} />;
};

export default BasePro;
