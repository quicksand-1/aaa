/**
 * 表格编辑
 * 官方：https://pro-components.antdigital.dev/components/editable-table
 * @PS
 *   1、每条数据中必须有唯一值 subID
 *   2、不要最下面的新增行 recordCreatorProps = false
 *   3、不要操作列 action = false
 * @用例
 *   columns
 *     fieldProps: (form, config) => {
 *       // 设置同一行其他字段的值
 *       form.setFieldValue([外层的name, config.rowIndex, 字段名], null);
 *       return {
 *         suffix: '元',
 *       }
 *     }
 * */

import { EditableProTable } from '@ant-design/pro-components';
import { FormContext } from 'antd/es/form/context';
import {
  useContext,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';
import LinkBtn from '../LinkBtn';
import SelectList from '../SelectList';
import genNewID from '../utils/genNewID';

const EditTable = (props) => {
  const {
    actionRef,
    columns = [],
    hidden = false,
    action = true,
    rowKey = 'subID',
    disabled = false,
    createDefaultValue = {},
    ...rest
  } = props;

  const ref = useRef();
  const { form } = useContext(FormContext);

  const initId = (list = []) => {
    return list.map((i) => {
      return i[rowKey] ? i : { ...i, [rowKey]: genNewID() };
    });
  };

  /**
   * 针对延迟渲染时无法进行编辑的问题
   * */
  useEffect(() => {
    if (rest.name && form) {
      const list = form.getFieldValue(rest.name);
      form.setFieldValue(rest.name, initId(list));
    }
  }, []);

  const [dataSource, setDataSource] = useState([]);

  // 动态处理 fieldProps
  const enhanceFieldProps = (originalProps, config = {}) => {
    if (typeof originalProps === 'function') {
      return (form, cfg) => ({
        disabled,
        ...config,
        ...originalProps(form, cfg),
      });
    }

    return {
      disabled,
      ...config,
      ...originalProps,
    };
  };

  const newColumns = columns
    .map(({ required = true, fieldProps, formItemProps, ...i }: any) => {
      const obj = {
        ...i,
        fieldProps: enhanceFieldProps(fieldProps),
        formItemProps: enhanceFieldProps(formItemProps, {
          rules: required ? [{ required: true, message: '必填项' }] : [],
        }),
      };

      // 支持异步枚举
      if (i.valueType === 'dict') {
        obj.formItemRender = () => (
          <SelectList cache dictKey={i.valueEnum} disabled={disabled} />
        );
      }

      // 支持异步选择
      if (i.valueType === 'select' && obj.fieldProps?.url) {
        obj.formItemRender = () => <SelectList {...obj.fieldProps} />;
      }

      return obj;
    })
    .concat(
      action
        ? {
            width: 90,
            title: '操作',
            valueType: 'option',
            render: () => null,
          }
        : [],
    );

  // 提供给外部的接口
  useImperativeHandle(actionRef, () => ({
    ...(ref.current || {}),
    initId,
  }));

  return (
    <div hidden={hidden}>
      <EditableProTable
        ghost
        bordered
        actionRef={ref}
        rowKey={rowKey}
        columns={newColumns}
        recordCreatorProps={{
          record: () => ({ [rowKey]: genNewID(), ...createDefaultValue }),
        }}
        locale={{
          emptyText: '空数据',
        }}
        editable={{
          type: 'multiple',
          editableKeys: dataSource.map((i) => i[rowKey]),
          actionRender: (row, config, defaultDoms) => {
            return [
              <EditableProTable.RecordCreator
                key="copy"
                record={{ ...row, [rowKey]: genNewID() }}
              >
                <LinkBtn>复制</LinkBtn>
              </EditableProTable.RecordCreator>,
              defaultDoms.delete,
            ];
          },
          onValuesChange: (record, recordList) => {
            setDataSource(recordList);
          },
        }}
        {...rest}
      />
    </div>
  );
};

export default EditTable;
