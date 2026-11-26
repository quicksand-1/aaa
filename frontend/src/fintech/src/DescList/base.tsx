/**
 * 减少 Descriptions 的样板代码
 * @params
 *   dataSource：数据源，可以支持多数据源展示，如：{}、[{}, {},...]
 *   defaultValue：当值不存在时，默认展示的文本，如 --
 *   columns：类似 table 的 columns
 *     title：标题
 *     open：是否渲染该字段，支持 boolean 和 () => {}，如果是函数，必须返回布尔值
 *     span：一行中所占格数
 *     dataIndex：字段名，支持嵌套的方式
 *     sourceIndex：依赖的数据源下标，当 dataSource 是 Array 时才生效
 *     render(text, record)：自定义渲染函数
 *     copyable: 复制功能，值必须是字符串
 *     valueType: 值类型
 *     valueEnum: 值枚举
 * */

import { ExclamationCircleOutlined } from '@ant-design/icons';
import { Descriptions, Space, Tooltip, Typography } from 'antd';
import JsonCode from '../JsonCode';
import localConfig from '../localConfig';
import StatusBadge from '../StatusBadge';
import StatusTag from '../StatusTag';
import type { DescListProps } from '../types';
import _deepGet from '../utils/_deepGet';
import _isReactNode from '../utils/_isReactNode';
import toThousands from '../utils/toThousands';

// 初始渲染值，从 dataSource 中获取
const renderValue = ({
  dataIndex = '',
  dataSource,
  render,
  defaultValue,
}: any) => {
  // 当 column 中有 dataIndex 时，就可以获取到数据
  const text = _deepGet(dataSource, dataIndex);

  // 当有 render 函数，且有下标字段时，可查询出值是否存在
  if (render && dataIndex) {
    return render(text, dataSource) ?? defaultValue;
  }

  // 当只有 render 函数时，直接渲染
  if (render) {
    return render(dataSource) ?? defaultValue;
  }

  return text ?? defaultValue;
};

// 渲染值的单位符号
const render = ({ valueType, value, defaultValue, valueEnum }: any) => {
  if (value === defaultValue) return value;

  // react.element 类型
  if (_isReactNode.node(value)) {
    return value;
  }

  // 文本域
  if (valueType === 'textarea') {
    return <pre style={{ margin: 0 }}>{value}</pre>;
  }

  // 如果是状态点
  if (valueType === 'badge') {
    return <StatusBadge value={value} valueEnum={valueEnum} />;
  }

  // 如果是状态标签
  if (valueType === 'tag') {
    return <StatusTag value={value} valueEnum={valueEnum} />;
  }

  // 金额类型，这里的 valueEnum 是单位
  if (valueType === 'money') {
    return toThousands.money(value, valueEnum);
  }

  // json 类型
  if (valueType === 'jsonCode') {
    return (
      <JsonCode
        data={value}
        style={{
          margin: 0,
          padding: 16,
          backgroundColor: 'rgba(150, 150, 150, 0.1)',
        }}
      />
    );
  }

  // 如果是百分比展示
  if (valueType?.includes('percent')) {
    // 如果是乘以某个数才能展示的话，则 * 符号后面就是基数
    if (valueType.includes('*')) {
      const base = +valueType.split('*')[1];
      return `${+value * base}%`;
    }

    // 如果是除以某个数才能展示的话，则 / 符号后面就是基数
    if (valueType.includes('/')) {
      const base = +valueType.split('/')[1];
      return `${+value / base}%`;
    }

    return `${value}%`;
  }

  return valueEnum?.[value] || value;
};

// tooltip 渲染
const renderTooltip = (tooltip: any, record: any): React.ReactNode => {
  // 统一处理所有情况下的 tooltip 内容
  let tooltipProps: any = {};

  if (_isReactNode.node(tooltip)) {
    tooltipProps = { title: tooltip };
  } else if (typeof tooltip === 'object' && tooltip !== null) {
    tooltipProps = tooltip;
  } else if (typeof tooltip === 'function') {
    const result = tooltip(record);
    if (typeof result === 'object' && result !== null) {
      tooltipProps = result;
    } else {
      tooltipProps = { title: result };
    }
  } else if (tooltip) {
    tooltipProps = { title: tooltip };
  } else {
    // 当 tooltip 为空或 falsy 时，直接返回 null 而不是 undefined
    return null;
  }

  return (
    <Tooltip {...tooltipProps}>
      <ExclamationCircleOutlined />
    </Tooltip>
  );
};

const DescList = (props: DescListProps) => {
  const { dataSource = {}, columns = [], defaultValue = '-', ...rest } = props;

  const renderItem = () => {
    const config = localConfig.newInstance()?.descList || {};

    return columns.reduce((p, column: any) => {
      const {
        title,
        tooltip,
        span = 1,
        open = true,
        sourceIndex = 0,
        copyable = false,
        ...columnsRest
      } = column;

      const isOpen =
        typeof open === 'function' ? open({ column, dataSource }) : open;

      if (!isOpen) {
        return p;
      }

      config.column?.(column);

      const currentDataSource = Array.isArray(dataSource)
        ? dataSource[sourceIndex]
        : dataSource;

      const renderLabel = () => {
        const tooltipDom = renderTooltip(tooltip, currentDataSource);

        return tooltipDom ? (
          <Space>
            {title}
            {tooltipDom}
          </Space>
        ) : (
          title
        );
      };

      const dom = render({
        valueType: column.valueType,
        valueEnum: column.valueEnum,
        defaultValue,
        value: renderValue({
          defaultValue,
          ...column,
          dataSource: currentDataSource,
        }),
      });

      const isCopyable = !!(copyable && typeof dom === 'string'); // 只有字符串类型的值才能被复制

      return [
        ...p,
        <Descriptions.Item
          key={title}
          label={renderLabel()}
          span={span}
          {...columnsRest}
        >
          {isCopyable ? (
            <Typography.Paragraph copyable>{dom}</Typography.Paragraph>
          ) : (
            dom
          )}
        </Descriptions.Item>,
      ];
    }, []);
  };

  return <Descriptions {...rest}>{renderItem()}</Descriptions>;
};

export default DescList;
