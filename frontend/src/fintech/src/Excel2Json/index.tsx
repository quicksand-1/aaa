/**
 * Excel 解析
 * @案例：http://components.abssqr.cn/docs/components/excel2-json
 * @API
 *   children: 包裹的按钮组件，一般是 Button 或 LinkBtn
 *   templateUrl: 模版文件，一般是 public 目录下的文件，也可以是 cdn 地址
 *   onFinish: 解析结束后返回的数据
 *   rules: 数据解析规则
 *     sheetName: 需要解析的 sheet 页
 *     map: excel中页头的中文和英文的对照表，支持嵌套路径
 *     enums: 枚举值，比如有些数据是需要转成枚举内容的
 *     defaultData: 默认添加的数据
 * */

import { Flex } from 'antd';
import { cloneElement, useRef, useState } from 'react';
import useAsyncScripts from '../hooks/useAsyncScripts';
import localConfig from '../localConfig';

type RuleItem = {
  sheetName: string;
  map: object;
  enums?: object;
  defaultData?: object;
  format?: (v: any) => void;
};

type Excel2JsonProps = {
  children: React.ReactNode;
  onFinish?: (res: any) => void;
  templateUrl?: string;
  rules: RuleItem[];
};

const toReplace = (string = '') => {
  const newString = string.trim().replace(/\t/g, '');

  if (newString === '是') {
    return 'true';
  }

  if (newString === '否') {
    return 'false';
  }

  return newString;
};

// 辅助函数：将嵌套路径字符串转换为对象
const setNestedValue = (obj, path, value) => {
  const keys =
    typeof path === 'string'
      ? path.split('.')
      : JSON.parse(JSON.stringify(path));
  let current = obj;
  while (keys.length > 1) {
    const key = keys.shift();
    if (!current[key]) current[key] = {}; // 如果路径中不存在则创建对象
    current = current[key];
  }
  current[keys[0]] = value;
};

/**
 * 对数据进行转化，并返回新的数据
 * 1、将 excel 的中文表头转成后端需要的英文表头
 * 2、对枚举类型的数据进行枚举转化
 * 3、替换掉值中的前后空格和不可识别字符，如：\t
 * @案例：http://localhost:8075/docs/components/excel2-json
 * @params
 *   data: 数据项
 *   map: 中英文对照，中文是 key，英文是 value，支持嵌套路径
 *   enums: 枚举值转化
 *   defaultData: 默认数据项
 * */
const transformKeys = (params: any = {}) => {
  const { data = {}, map, enums, defaultData = {} } = params;

  const transformedData = {};
  for (const key in data) {
    if (map.hasOwnProperty(key)) {
      const newKey = map[key];
      const value = data[key];
      if (enums?.hasOwnProperty(newKey)) {
        // If the new key is in the enum map, find the corresponding enum value
        const enumValues = enums[newKey];
        const enumKey = Object.keys(enumValues).find(
          (enumKey) => enumValues[enumKey] === value,
        );
        transformedData[newKey] =
          enumKey !== undefined ? enumKey : toReplace(value);
      } else {
        setNestedValue(transformedData, newKey, toReplace(value));
      }
    }
  }

  return { ...defaultData, ...transformedData };
};

const Excel2Json = (props: Excel2JsonProps) => {
  const {
    children,
    templateUrl,
    onFinish = () => {},
    rules = [],
    ...rest
  } = props;

  const inputRef = useRef(null);
  const [loading] = useAsyncScripts(['assets/xlsx.js']);
  const [reading, setReading] = useState(false);
  const { publicPath = '/' } = localConfig.newInstance();

  const onChange = (e: any) => {
    const file = e.target.files[0];

    if (!file) return;

    let wb = ''; // 读取完成的数据
    const reader = new FileReader();

    setReading(true);
    try {
      reader.onload = function (e2) {
        const data = e2.target?.result;
        wb = window['XLSX'].read(data, {
          type: 'binary',
        });

        // 遍历 sheets
        const result = wb.SheetNames.reduce((p, sheetName) => {
          const rule = rules.find((i) => i.sheetName === sheetName);
          const excelJson =
            window['XLSX'].utils.sheet_to_json(wb.Sheets[sheetName]) || [];

          if (rule) {
            // 对原始 excel 数据进行转化
            const detailList = excelJson.map((i: any) => {
              const v = transformKeys({ data: i, ...rule });

              return rule.format?.(v) || v;
            });

            return { ...p, [sheetName]: detailList };
          }

          return { ...p, [sheetName]: excelJson };
        }, {});

        setReading(false);
        onFinish(result);
      };
      reader.readAsBinaryString(file);
    } catch (e) {
      setReading(false);
    }

    // 防止二次上传失败的问题
    e.target.value = '';
  };

  let wrappedChild;

  const wrappedCommonProps = {
    ...rest,
    loading,
    onClick: () => {
      inputRef.current?.click();
    },
  };

  if (reading) {
    wrappedChild = cloneElement(children, {
      ...wrappedCommonProps,
      loading: reading,
      children: '文件读取中...',
    });
  } else {
    wrappedChild = cloneElement(children, wrappedCommonProps);
  }

  return (
    <Flex align="center" gap={8}>
      {wrappedChild}
      {templateUrl && (
        <a href={`${publicPath}${templateUrl}`} style={{ fontSize: 14 }}>
          下载模版
        </a>
      )}
      <input
        type="file"
        ref={inputRef}
        onChange={onChange}
        style={{ display: 'none' }}
        accept="text/csv,.xls,.xlsx,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      />
    </Flex>
  );
};

export default Excel2Json;
