/**
 * JSON 表单
 * @params
 *   gutter：会用 Row 包裹 items 元素
 *   colSpan：统一分配 FormItem 的 colSpan，省略每个元素的属性拼写，权重 FormItem > Schema
 *   items: 表单数据
 *   unique: 唯一编号，一般是自增的 id，会自动生成隐藏的 id 字段
 * */

import { Divider, Row, Space } from 'antd';
import _isReactNode from '../utils/_isReactNode';
import _typeOf from '../utils/_typeOf';
import FormItem from './index';
import FormUpdate from './update';

export default (props: any) => {
  const { colSpan, gutter, unique, items = [], disabled = false } = props;

  const renderFormItem = (list = []) => {
    return list.map((item: any, index: number) => {
      const key = item.key || item.name || item.label || index;

      if (_typeOf(item.compact, 'Array')) {
        return (
          <FormItem colSpan={colSpan} key={key} {...item}>
            <Space.Compact style={{ width: '100%' }}>
              {renderFormItem(item.compact || [])}
            </Space.Compact>
          </FormItem>
        );
      }

      if (_typeOf(item, 'Function')) {
        return (
          <FormUpdate key={key}>
            {(obj) => {
              const subFormItems = item(obj);
              if (_typeOf(subFormItems, 'Object')) {
                return renderFormItem([subFormItems]);
              }

              return renderFormItem(subFormItems || []);
            }}
          </FormUpdate>
        );
      }

      if (_typeOf(item, 'String')) {
        return (
          <Divider key={item} titlePlacement="start">
            {item}
          </Divider>
        );
      }

      // 如果是 ReactNode
      if (_isReactNode.all(item)) {
        return item;
      }

      return (
        <FormItem colSpan={colSpan} key={key} disabled={disabled} {...item} />
      );
    });
  };

  const formitems = renderFormItem(
    items.concat(
      unique
        ? _typeOf(unique, 'Array')
          ? unique.map((i) => ({ name: i, hidden: true, required: false }))
          : { name: unique, hidden: true, required: false }
        : [],
    ),
  );

  if (gutter) {
    return <Row gutter={gutter}>{formitems}</Row>;
  }

  return <>{formitems}</>;
};
