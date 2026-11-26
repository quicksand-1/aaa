# FormSchema 组件使用示例

## 目录
1. [基础使用](#1-基础使用)
2. [布局配置](#2-布局配置)
3. [动态表单项](#3-动态表单项)
4. [条件渲染](#4-条件渲染)
5. [表单验证](#5-表单验证)
6. [自定义组件](#6-自定义组件)
7. [嵌套表单](#7-嵌套表单)
8. [表格编辑](#8-表格编辑)
9. [文件上传](#9-文件上传)
10. [复杂联动](#10-复杂联动)

---

## 1. 基础使用

### 示例 1: 简单的文本输入

```jsx
import { DrawerBox, FormSchema } from 'fintech';

const Example = () => {
  const drawerRef = useRef(null);

  const formItems = [
    { name: 'name', label: '名称' },
    { name: 'code', label: '编码' },
    { name: 'desc', label: '描述', required: false },
  ];

  return (
    <DrawerBox form actionRef={drawerRef} title="新增">
      <FormSchema items={formItems} />
    </DrawerBox>
  );
};
```

**来源**: [metricHub/src/pages/baseData/metricSet/_components/MetricSetAddDrawer.jsx](file:///Users/chenlong/Desktop/dev/opencode_副本/metricHub/src/pages/baseData/metricSet/_components/MetricSetAddDrawer.jsx)

### 示例 2: 带默认值的表单项

```jsx
const formItems = [
  { name: 'name', label: '名称' },
  { name: 'code', label: '编码' },
  { name: 'level', label: '层级', valueType: 'number', initialValue: 1 },
  { name: 'defaultValue', label: '缺省值', valueType: 'number', initialValue: 0 },
];
```

**来源**: [accounting/src/pages/statements/quota/EditDrawer.jsx](file:///Users/chenlong/Desktop/dev/opencode_副本/accounting/src/pages/statements/quota/EditDrawer.jsx)

### 示例 3: 隐藏字段

```jsx
const formItems = [
  { name: 'id', label: '规则ID', required: false, hidden: true },
  { name: 'name', label: '名称' },
  { name: 'code', label: '编码' },
];
```

**来源**: [metricHub/src/pages/baseData/derivedMetric/validateRule/_components/RuleAdd.jsx](file:///Users/chenlong/Desktop/dev/opencode_副本/metricHub/src/pages/baseData/derivedMetric/validateRule/_components/RuleAdd.jsx)

---

## 2. 布局配置

### 示例 1: 使用 gutter 和 colSpan

```jsx
<FormSchema
  gutter={12}
  colSpan={8}
  items={[
    { name: 'name', label: '名称' },
    { name: 'code', label: '编码' },
    { name: 'desc', label: '描述', required: false },
  ]}
/>
```

**来源**: [metricHub/src/pages/baseData/derivedMetric/metricList/_components/FormulaEditor/index.jsx](file:///Users/chenlong/Desktop/dev/opencode_副本/metricHub/src/pages/baseData/derivedMetric/metricList/_components/FormulaEditor/index.jsx)

### 示例 2: 使用 colSpan 控制列宽

```jsx
<FormSchema
  gutter={12}
  colSpan={12}
  items={[
    { name: 'name', label: '名称', colSpan: 24 },
    { name: 'code', label: '编码', colSpan: 12 },
    { name: 'desc', label: '描述', colSpan: 12, required: false },
  ]}
/>
```

**来源**: [accounting/src/pages/recordingRules/carryover/EditDrawer.jsx](file:///Users/chenlong/Desktop/dev/opencode_副本/accounting/src/pages/recordingRules/carryover/EditDrawer.jsx)

### 示例 3: 使用 compact 紧凑布局

```jsx
<FormSchema
  gutter={12}
  colSpan={8}
  items={[
    { name: 'name', label: '名称' },
    { name: 'code', label: '编码' },
    { name: 'desc', label: '描述', required: false },
  ]}
/>
```

**来源**: [metricHub/src/pages/baseData/derivedMetric/metricList/_components/FormulaEditor/index.jsx](file:///Users/chenlong/Desktop/dev/opencode_副本/metricHub/src/pages/baseData/derivedMetric/metricList/_components/FormulaEditor/index.jsx)

---

## 3. 动态表单项

### 示例 1: 使用函数返回表单项

```jsx
const formItems = [
  { name: 'name', label: '名称' },
  { name: 'code', label: '编码' },
  ({ type }) => type && [
    { name: 'subType', label: '账户子类型', valueType: 'select', valueEnum: ACCOUNT_ENUM.SUB[type] },
    { name: 'direction', label: '方向', inputProps: { disabled: ['POSITION', 'INNER'].includes(type) } },
  ],
];
```

**来源**: [accounting/src/pages/recordingRules/accountUnit/account/EditDrawer.jsx](file:///Users/chenlong/Desktop/dev/opencode_副本/accounting/src/pages/recordingRules/accountUnit/account/EditDrawer.jsx)

### 示例 2: 根据条件动态显示表单项

```jsx
const formItems = [
  { name: 'name', label: '名称' },
  { name: 'type', label: '类型', valueType: 'select', valueEnum: TYPE_ENUM },
  ({ type }) => type === 'MULTI_OPTIONS' ? [
    { name: 'items', label: '属性值枚举' },
  ] : null,
];
```

**来源**: [accounting/src/pages/recordingRules/attr/EditDrawer.jsx](file:///Users/chenlong/Desktop/dev/opencode_副本/accounting/src/pages/recordingRules/attr/EditDrawer.jsx)

### 示例 3: 使用 open 属性控制显示

```jsx
const formItems = [
  { name: 'name', label: '名称' },
  { name: 'code', label: '编码' },
  { open: !!parentData, name: 'parentSubjectCode', label: '父级编码', inputProps: { disabled: true } },
  { open: !!parentData, name: 'parentSubjectName', label: '父级名称', inputProps: { disabled: true } },
];
```

**来源**: [accounting/src/pages/basicSettings/subject/EditDrawer.jsx](file:///Users/chenlong/Desktop/dev/opencode_副本/accounting/src/pages/basicSettings/subject/EditDrawer.jsx)

---

## 4. 条件渲染

### 示例 1: 使用 open 属性

```jsx
const hasAidAgency = data?.hasAidAgency?.code === '1';

const formItems = [
  { name: 'providerId', label: '产品编号' },
  { name: 'providerName', label: '产品名称' },
  { open: hasAidAgency, name: 'aidAgencyName', label: '助贷机构名称' },
  { open: hasAidAgency, name: 'aidAgencyCode', label: '社会信用代码' },
  { open: hasAidAgency, name: 'aidAgencyCooperationType', label: '助贷合作方式' },
];
```

**来源**: [ifin/src/pages/project/prod/components/EditDrawer.jsx](file:///Users/chenlong/Desktop/dev/opencode_副本/ifin/src/pages/project/prod/components/EditDrawer.jsx)

### 示例 2: 使用 hidden 属性

```jsx
const formItems = [
  { name: 'id', hidden: true, required: false },
  { name: 'name', label: '名称' },
  { name: 'code', label: '编码' },
  { hidden: subjectType !== 'ASSET', name: 'isCashSubject', label: '是否现金科目', valueType: 'switch' },
];
```

**来源**: [accounting/src/pages/basicSettings/subject/EditDrawer.jsx](file:///Users/chenlong/Desktop/dev/opencode_副本/accounting/src/pages/basicSettings/subject/EditDrawer.jsx)

### 示例 3: 使用函数动态控制

```jsx
const formItems = [
  { name: 'name', label: '名称' },
  { name: 'type', label: '类型', valueType: 'select', valueEnum: TYPE_ENUM },
  ({ type }) => ['DEBIT_TRANS_AMT', 'CREDIT_TRANS_AMT'].includes(type) && [
    { required: false, name: 'eventCode', label: '核算事件', children: '<EventSelect />' },
  ],
];
```

**来源**: [accounting/src/components/FormulaEditor/ActionsBar/EventCode.jsx](file:///Users/chenlong/Desktop/dev/opencode_副本/accounting/src/components/FormulaEditor/ActionsBar/EventCode.jsx)

---

## 5. 表单验证

### 示例 1: 使用 rules 属性

```jsx
const formItems = [
  { name: 'name', label: '名称', rules: [{ required: true, message: '请输入名称' }] },
  { name: 'code', label: '编码', rules: [{ max: 64, message: '最多64个字符' }] },
  { name: 'email', label: '邮箱', required: false, rules: [{ type: 'email', message: '请输入正确格式的邮箱' }] },
];
```

**来源**: [ifin/src/pages/system/userManage/EditDrawer.jsx](file:///Users/chenlong/Desktop/dev/opencode_副本/ifin/src/pages/system/userManage/EditDrawer.jsx)

### 示例 2: 使用正则表达式验证

```jsx
const formItems = [
  { name: 'account', label: '账号' },
  { name: 'userName', label: '姓名' },
  { name: 'password', label: '密码', rules: { pattern: regexp.PASSWORD, message: '新密码必须包含大小写字母、数字、特殊字符(!@#$%^&*?)，长度12-18位' } },
  { name: 'confirmPassword', label: '确认密码', validateFirst: true, rules: { validator: (_, value) => {
    if (value && value !== form.getFieldValue('password')) {
      return Promise.reject('两次输入的密码不一致');
    }
    return Promise.resolve();
  }} },
];
```

**来源**: [ifin/src/pages/system/userManage/EditDrawer.jsx](file:///Users/chenlong/Desktop/dev/opencode_副本/ifin/src/pages/system/userManage/EditDrawer.jsx)

### 示例 3: 使用自定义验证器

```jsx
const formItems = [
  { name: 'managerOrgCode', label: '管理机构', valueType: 'select', inputProps: { cache: true, url: '/setting/fundParty/queryFundParties.json', fields: ['code', 'name'] }, rules: { validator: (_, value) => {
    if (!value) {
      return Promise.reject('请选择管理机构');
    }
    return Promise.resolve();
  }} },
];
```

**来源**: [ama/src/pages/basic/Datadistribute/EditDrawer.jsx](file:///Users/chenlong/Desktop/dev/opencode_副本/ama/src/pages/basic/Datadistribute/EditDrawer.jsx)

---

## 6. 自定义组件

### 示例 1: 使用 children 属性

```jsx
const formItems = [
  { name: 'entityNo', label: '子账', children: '<EntitySelect params={{ type: "SUB" }} />' },
  { name: 'setDate', label: '会计日', valueType: 'datePicker' },
  { name: 'digest', label: '摘要', valueType: 'textarea', placeholder: '差账的额外说明' },
];
```

**来源**: [accounting/src/pages/tools/manual/index.jsx](file:///Users/chenlong/Desktop/dev/opencode_副本/accounting/src/pages/tools/manual/index.jsx)

### 示例 2: 集成 SelectList 组件

```jsx
const formItems = [
  { name: 'name', label: '报表模版名称' },
  { name: 'reportList', label: '关联报表定义', children: '<SelectList mode="multiple" fields={["no", "name"]} url="/solution/report/define/list.json" linkProps={{ to: "/statements/formTemp" }} />' },
];
```

**来源**: [accounting/src/pages/statements/template/EditDrawer.jsx](file:///Users/chenlong/Desktop/dev/opencode_副本/accounting/src/pages/statements/template/EditDrawer.jsx)

### 示例 3: 集成 EditTable 组件

```jsx
const formItems = [
  { name: 'name', label: '报表名称' },
  { name: 'type', label: '报表类型', valueType: 'select', valueEnum: BOOK_ENUM.DATE },
  { name: 'frequency', label: '触发频率', valueType: 'select', valueEnum: REPORT_ENUM.FREQUENCY },
  { name: 'indexList', label: '指标列表', children: '<EditTable key="table" name="indexList" actionRef={editTableRef} columns={[...]} />' },
];
```

**来源**: [accounting/src/pages/statements/formTemp/EditDrawer.jsx](file:///Users/chenlong/Desktop/dev/opencode_副本/accounting/src/pages/statements/formTemp/EditDrawer.jsx)

---

## 7. 嵌套表单

### 示例 1: 使用分组标题

```jsx
const formItems = [
  "'基本信息'",
  { name: 'planNo', label: '项目编号', inputProps: { disabled: !!data } },
  { name: 'planName', label: '项目名称' },
  { name: 'totalAmt', label: '产品规模', valueType: 'money' },
  "'监管账户信息'",
  { name: 'actJGBank', label: '监管银行名称' },
  { name: 'actJGName', label: '监管账户名称' },
  { name: 'actJGNo', label: '监管账号' },
];
```

**来源**: [ifin/src/pages/project/plan/list/EditDrawer.jsx](file:///Users/chenlong/Desktop/dev/opencode_副本/ifin/src/pages/project/plan/list/EditDrawer.jsx)

### 示例 2: 使用 Divider 分隔

```jsx
const formItems = [
  { name: 'name', label: '名称' },
  { name: 'code', label: '编码' },
  '<Divider key="a" titlePlacement="start">明细</Divider>',
  { name: 'items', label: '明细列表', children: '<EditTable key="edit" action={false} rowKey="entityNo" name="subTaxFeeDetail" recordCreatorProps={false} columns={[...]} />' },
];
```

**来源**: [accounting/src/pages/operation/allot/tax/EditDrawer.jsx](file:///Users/chenlong/Desktop/dev/opencode_副本/accounting/src/pages/operation/allot/tax/EditDrawer.jsx)

### 示例 3: 使用 Alert 提示

```jsx
const formItems = [
  { name: 'name', label: '记账规则名称' },
  "'记账条件'",
  '<Alert key="alert" title="满足以下条件时，才会进行记账。" style={{ marginBottom: 12 }} />',
  { name: 'conditionList', label: '条件列表', children: '<EditTable key="attr" name="conditionList" actionRef={editTableRef} columns={[...]} />' },
];
```

**来源**: [accounting/src/pages/recordingRules/event/rules/EditDrawer.jsx](file:///Users/chenlong/Desktop/dev/opencode_副本/accounting/src/pages/recordingRules/event/rules/EditDrawer.jsx)

---

## 8. 表格编辑

### 示例 1: 集成 EditTable

```jsx
const formItems = [
  { name: 'name', label: '报表名称' },
  { name: 'type', label: '报表类型', valueType: 'select', valueEnum: BOOK_ENUM.DATE },
  { name: 'indexList', label: '指标列表', children: '<EditTable key="table" name="indexList" actionRef={editTableRef} columns={[...]} />' },
];
```

**来源**: [accounting/src/pages/statements/formTemp/EditDrawer.jsx](file:///Users/chenlong/Desktop/dev/opencode_副本/accounting/src/pages/statements/formTemp/EditDrawer.jsx)

### 示例 2: 集成 EditableProTable

```jsx
const formItems = [
  { name: 'name', label: '名称' },
  { name: 'items', label: '明细列表', children: '<EditTable key="edit" action={false} rowKey="entityNo" name="subTaxFeeDetail" recordCreatorProps={false} columns={[...]} />' },
];
```

**来源**: [accounting/src/pages/operation/allot/tax/EditDrawer.jsx](file:///Users/chenlong/Desktop/dev/opencode_副本/accounting/src/pages/operation/allot/tax/EditDrawer.jsx)

### 示例 3: 集成 ProTableAsync

```jsx
const formItems = [
  { name: 'parentEntityNo', label: '母账', children: '<EntitySelect params={{ type: "PARENT" }} />' },
  ({ parentEntityNo }) => parentEntityNo && [
    { hidden: true, name: 'investStructureTransListIds' },
    '明细',
    '<ProTableAsync ghost search={false} rowKey="entityNo" headerTitle={false} key={parentEntityNo} scroll={{ y: "28vh" }} style={{ width: "100%" }} extraParams={{ entityNo: parentEntityNo }} url="/credit/guarantee/fund/pay/show.json" columns={[...]} expandable={{ ... }} formatData={({ datas }) => { ... }} />',
  ],
];
```

**来源**: [accounting/src/pages/operation/allot/fundIR/EditDrawer.jsx](file:///Users/chenlong/Desktop/dev/opencode_副本/accounting/src/pages/operation/allot/fundIR/EditDrawer.jsx)

---

## 9. 文件上传

### 示例 1: 集成 Upload 组件

```jsx
const formItems = [
  { name: 'file', label: '上传文件', children: '<Upload maxCount={1} accept={ACCEPT.excel} beforeUpload={() => false}><Button>选择文件</Button></Upload>' },
];
```

**来源**: [ifin/src/components/UploadDrawer/index.jsx](file:///Users/chenlong/Desktop/dev/opencode_副本/ifin/src/components/UploadDrawer/index.jsx)

### 示例 2: 集成 Excel2Json 组件

```jsx
const formItems = [
  { name: 'entityNo', label: '子账/母账', children: '<EntitySelect optionRender={(o) => { ... }} />' },
  { name: 'setDate', label: '会计日', valueType: 'datePicker' },
  { label: 'Excel', children: '<Excel2Json templateUrl="/template/实体初始化.xlsx" rules={[...]} onFinish={({ 记账账户 = [], 原子科目 = [], 会计科目 = [] }) => { ... }}><Button>上传文件</Button></Excel2Json>' },
];
```

**来源**: [accounting/src/pages/tools/entityInit/index.jsx](file:///Users/chenlong/Desktop/dev/opencode_副本/accounting/src/pages/tools/entityInit/index.jsx)

---

## 10. 复杂联动

### 示例 1: 表单项之间的联动

```jsx
const formItems = [
  { name: 'parentEntityNo', label: '母账', children: '<EntitySelect params={{ type: "PARENT" }} onChange={() => { ... }} />' },
  ({ parentEntityNo }) => parentEntityNo && [
    { name: 'entityNos', label: '子账', children: '<EntitySelect.Sub mode="multiple" parentEntityNo={parentEntityNo} onChange={(_, rows) => { ... }} />' },
  ],
];
```

**来源**: [accounting/src/pages/operation/allot/tax/EditDrawer.jsx](file:///Users/chenlong/Desktop/dev/opencode_副本/accounting/src/pages/operation/allot/tax/EditDrawer.jsx)

### 示例 2: 使用 useDebounce 联动

```jsx
const formItems = [
  { name: 'parentEntityNo', label: '母账', children: '<EntitySelect params={{ type: "PARENT" }} />' },
  { name: 'settlementType', label: '费用类型', valueType: 'dict', valueEnum: AL_Fee_Type },
  { name: 'setDate', label: '会计日', valueType: 'datePicker' },
  { name: 'transAmt', label: '缴费金额', valueType: 'money', inputProps: { min: 1 } },
  useDebounce(({ parentEntityNo, settlementType, setDate, transAmt }) => {
    if (parentEntityNo && settlementType && setDate && transAmt) {
      // 联动逻辑
    }
  }),
];
```

**来源**: [accounting/src/pages/operation/allot/fee/EditDrawer.jsx](file:///Users/chenlong/Desktop/dev/opencode_副本/accounting/src/pages/operation/allot/fee/EditDrawer.jsx)

### 示例 3: 复杂的条件联动

```jsx
const formItems = [
  { name: 'name', label: '识账模版名称' },
  { name: 'counterPartyList', label: '识账规则', children: '<OpponentsSelect mode="multiple" disabled={disabled} />' },
  ({ toC, counterPartyType }) => {
    if (toC && counterPartyType === 'BANK') {
      return [
        { name: 'bankAccountNo', label: '银行账户' },
        { name: 'openBankName', label: '银行名称' },
        { name: 'openBankProvince', label: '省' },
        { name: 'openBankCity', label: '市' },
      ];
    }
    return null;
  },
];
```

**来源**: [accounting/src/pages/reconciliation/opponents/edit/index.jsx](file:///Users/chenlong/Desktop/dev/opencode_副本/accounting/src/pages/reconciliation/opponents/edit/index.jsx)

---

## 常见使用场景总结

### 场景 1: 基础表单编辑

```jsx
const formItems = [
  { name: 'name', label: '名称' },
  { name: 'code', label: '编码' },
  { name: 'desc', label: '描述', required: false },
];

<DrawerBox form actionRef={drawerRef} title="新增">
  <FormSchema items={formItems} />
</DrawerBox>
```

### 场景 2: 带布局的表单

```jsx
<FormSchema
  gutter={12}
  colSpan={8}
  items={[
    { name: 'name', label: '名称' },
    { name: 'code', label: '编码' },
    { name: 'desc', label: '描述', required: false },
  ]}
/>
```

### 场景 3: 动态表单项

```jsx
const formItems = [
  { name: 'name', label: '名称' },
  { name: 'type', label: '类型', valueType: 'select', valueEnum: TYPE_ENUM },
  ({ type }) => type === 'SPECIAL' && [
    { name: 'specialField', label: '特殊字段' },
  ],
];
```

### 场景 4: 条件渲染

```jsx
const formItems = [
  { name: 'name', label: '名称' },
  { name: 'hasAidAgency', label: '是否有助贷', valueType: 'radio', valueEnum: BOOLEAN2 },
  ({ hasAidAgency }) => hasAidAgency === '1' ? [
    { name: 'aidAgencyName', label: '助贷机构名称' },
    { name: 'aidAgencyCode', label: '社会信用代码' },
  ] : null,
];
```

### 场景 5: 自定义组件集成

```jsx
const formItems = [
  { name: 'entityNo', label: '子账', children: '<EntitySelect params={{ type: "SUB" }} />' },
  { name: 'setDate', label: '会计日', valueType: 'datePicker' },
  { name: 'digest', label: '摘要', valueType: 'textarea' },
];
```

### 场景 6: 表单验证

```jsx
const formItems = [
  { name: 'name', label: '名称', rules: [{ required: true, message: '请输入名称' }] },
  { name: 'code', label: '编码', rules: [{ max: 64, message: '最多64个字符' }] },
  { name: 'email', label: '邮箱', rules: [{ type: 'email', message: '请输入正确格式的邮箱' }] },
];
```

### 场景 7: 嵌套表单

```jsx
const formItems = [
  "'基本信息'",
  { name: 'planNo', label: '项目编号' },
  { name: 'planName', label: '项目名称' },
  "'监管账户信息'",
  { name: 'actJGBank', label: '监管银行名称' },
  { name: 'actJGName', label: '监管账户名称' },
  { name: 'actJGNo', label: '监管账号' },
];
```

### 场景 8: 表格编辑

```jsx
const formItems = [
  { name: 'name', label: '名称' },
  { name: 'items', label: '明细列表', children: '<EditTable key="edit" action={false} rowKey="entityNo" name="subTaxFeeDetail" columns={[...]} />' },
];
```

---

## 属性说明

### FormSchema 组件属性

| 属性 | 类型 | 说明 | 示例 |
|------|------|------|------|
| items | array | 表单项配置数组 | `items={formItems}` |
| gutter | number | 栅格间隔 | `gutter={12}` |
| colSpan | number | 每列占用的栅格数 | `colSpan={8}` |
| unique | string/array | 唯一字段名 | `unique="id"` 或 `unique={["id", "version"]}` |
| disabled | boolean | 是否禁用整个表单 | `disabled={true}` |

### 表单项配置属性

| 属性 | 类型 | 说明 | 示例 |
|------|------|------|------|
| name | string | 字段名 | `name="name"` |
| label | string | 标签 | `label="名称"` |
| required | boolean | 是否必填 | `required={true}` |
| hidden | boolean | 是否隐藏 | `hidden={true}` |
| open | boolean/function | 是否显示 | `open={condition}` 或 `open={() => condition}` |
| initialValue | any | 初始值 | `initialValue=""` |
| valueType | string | 值类型 | `valueType="select"` |
| valueEnum | object | 枚举值 | `valueEnum={STATUS_ENUM}` |
| inputProps | object | 输入框属性 | `inputProps={{ placeholder: "请输入" }}` |
| rules | object/array | 验证规则 | `rules={[{ required: true }]}` |
| colSpan | number | 占用栅格数 | `colSpan={12}` |
| span | number | 跨列数 | `span={2}` |
| tooltip | string | 提示信息 | `tooltip="提示文本"` |
| extra | ReactNode | 额外内容 | `extra={<span>额外说明</span>}` |
| children | ReactNode | 自定义子组件 | `children={<SelectList />}` |
| validateFirst | boolean | 是否优先验证 | `validateFirst={true}` |

### valueType 类型

| 类型 | 说明 | 示例 |
|------|------|------|
| input | 文本输入框 | `valueType="input"` |
| number | 数字输入框 | `valueType="number"` |
| textarea | 文本域 | `valueType="textarea"` |
| select | 下拉选择 | `valueType="select"` |
| radio | 单选框 | `valueType="radio"` |
| checkbox | 复选框 | `valueType="checkbox"` |
| switch | 开关 | `valueType="switch"` |
| datePicker | 日期选择器 | `valueType="datePicker"` |
| rangePicker | 范围选择器 | `valueType="rangePicker"` |
| money | 金额输入框 | `valueType="money"` |
| percent | 百分比输入框 | `valueType="percent"` |
| dict | 字典选择 | `valueType="dict"` |

### inputProps 常用属性

| 属性 | 类型 | 说明 | 示例 |
|------|------|------|------|
| placeholder | string | 占位符 | `placeholder="请输入"` |
| disabled | boolean | 是否禁用 | `disabled={true}` |
| maxLength | number | 最大长度 | `maxLength={100}` |
| min | number | 最小值 | `min={0}` |
| max | number | 最大值 | `max={100}` |
| precision | number | 精度 | `precision={2}` |
| prefix | ReactNode | 前缀 | `prefix="¥"` |
| suffix | ReactNode | 后缀 | `suffix="%"` |
| showCount | boolean | 显示字符计数 | `showCount={true}` |
| rows | number | 文本域行数 | `rows={3}` |

---

## 注意事项

1. **items 类型**：items 可以是数组或函数，函数接收表单值作为参数
2. **动态表单项**：使用函数返回表单项数组时，函数会接收当前表单值
3. **条件渲染**：使用 `open` 属性控制表单项显示，可以是布尔值或函数
4. **隐藏字段**：使用 `hidden` 属性隐藏字段，隐藏的字段不会参与表单验证
5. **唯一性验证**：使用 `unique` 属性指定唯一字段，会自动验证唯一性
6. **布局控制**：`gutter` 控制行间距，`colSpan` 控制每列占用的栅格数
7. **嵌套表单**：使用字符串作为表单项会渲染为分组标题
8. **自定义组件**：使用 `children` 属性可以完全自定义表单项内容
9. **表单验证**：`rules` 支持数组和对象两种格式
10. **验证优先级**：`validateFirst` 为 true 时，该字段会优先验证
11. **valueType 使用**：根据数据类型选择合适的 valueType，如金额用 money，百分比用 percent
12. **inputProps 传递**：inputProps 中的属性会传递给底层输入组件
13. **联动处理**：在函数类型的 items 中，可以通过参数访问其他字段的值
14. **表单重置**：FormSchema 会自动处理表单重置逻辑
15. **性能优化**：对于复杂的动态表单项，建议使用 useMemo 缓存配置