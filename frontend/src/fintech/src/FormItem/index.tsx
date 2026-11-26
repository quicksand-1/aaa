import { Col, Form, Input, InputNumber, Switch } from 'antd';
import AsyncTree from '../AsyncTree';
import CheckList from '../CheckList';
import DateQuick from '../DateQuick';
import RadioList from '../RadioList';
import SelectList from '../SelectList';
import _format from '../utils/_format';

const FormItem = (props: any) => {
  const {
    disabled = false,
    required = true,
    valueType = 'input',
    message = '必填项',
    open = true,
    rules = [],
    inputProps = {},
    format,
    placeholder,
    valueEnum,
    colSpan = 0,
    dataIndex,
    title,
    ...rest
  } = props;

  if (!open) return null;

  /**
   * 也可以像 table 的 column 一样书写
   * { dataIndex: 'eventCode', title: '事件编码' }
   * */
  const name = rest.name || dataIndex;
  const label = rest.label || title;

  /**
   * Form.Item 的默认属性，比如自动校验、值的自动转化等行为
   * */
  const formItemDefaultProps = {
    required,
    ...({
      input: {
        getValueFromEvent: (e) => (e?.target ? e.target.value.trim() : e),
      },
      switch: {
        valuePropName: 'checked',
        initialValue: false,
      },
      datePicker: {
        normalize: (date) => date && _format.moment(date, format),
      },
      rangePicker: {
        normalize: (date) =>
          date && [
            _format.moment(date[0], format),
            _format.moment(date[1], format),
          ],
      },
    }[valueType] || {}),
    rules: [{ required, message }].concat(rules),
    ...rest,
  };

  /**
   * 子组件的默认行为
   * 比如展位符提示、默认样式等
   * */
  const PLACEHOLDER = placeholder ?? `请输入${label || ''}`;
  const INPUT_DEFAULT_PROPS =
    {
      input: {
        placeholder: PLACEHOLDER,
      },
      password: {
        placeholder: PLACEHOLDER,
      },
      money: {
        style: { width: '100%' },
        placeholder: PLACEHOLDER,
        controls: false,
        changeOnWheel: false,
        suffix: '元',
        parser: (v) => v?.replace(/\$\s?|(,*)/g, ''),
        formatter: (v) => {
          if (v) {
            if (v.slice(-1) === '.') return v;
            if (typeof v === 'number' || !isNaN(Number(v))) {
              return Number(v).toLocaleString('en', {
                minimumFractionDigits: 0,
                maximumFractionDigits: 20,
              });
            }
          }
          return v;
        },
      },
      number: {
        style: { width: '100%' },
        placeholder: PLACEHOLDER,
        controls: false,
        changeOnWheel: false,
      },
      textarea: {
        rows: 1,
        placeholder: PLACEHOLDER,
      },
      checkbox: {
        delimiter: ',',
        options: valueEnum,
      },
      radio: {
        options: valueEnum,
      },
      select: {
        options: valueEnum,
        placeholder: PLACEHOLDER.replace('输入', '选择'),
      },
      dict: {
        cache: true,
        dictKey: valueEnum,
        placeholder: PLACEHOLDER.replace('输入', '选择'),
      },
      rangePicker: {
        format,
        style: { width: '100%' },
        type: 'RangePicker',
      },
      datePicker: {
        format,
        style: { width: '100%' },
        placeholder: PLACEHOLDER.replace('输入', '选择'),
      },
      tree: {
        treeData: valueEnum,
      },
    }[valueType] || {};
  const extraInputProps = {
    disabled,
    ...INPUT_DEFAULT_PROPS,
    ...inputProps,
    // 禁用情况下，不展示占位符信息
    placeholder: disabled
      ? ''
      : inputProps.placeholder || INPUT_DEFAULT_PROPS.placeholder,
  };

  const crumbs = () => {
    if (!name) return rest.children;

    const Comp = {
      input: Input,
      money: InputNumber,
      number: InputNumber,
      textarea: Input.TextArea,
      password: Input.Password,
      switch: Switch,
      datePicker: DateQuick,
      rangePicker: DateQuick,
      select: SelectList,
      dict: SelectList,
      checkbox: CheckList,
      radio: RadioList,
      tree: AsyncTree,
    }[valueType];

    return rest.children || <Comp {...extraInputProps} />;
  };

  const Item = (
    <Form.Item {...formItemDefaultProps} name={name} label={label}>
      {crumbs()}
    </Form.Item>
  );

  if (colSpan > 0) {
    return (
      <Col span={colSpan} hidden={rest.hidden}>
        {Item}
      </Col>
    );
  }

  return Item;
};

export default FormItem;
