/**
 * @PS：特殊环境下，如果 Editor 未在页面上显示时进行初始化，则会导致样式异常
 *   - 比如在 Tabs 的 forceRender 下面渲染 Editor 组件，在不进行 Observer 包裹时初始化会异常
 * */

import Observer from '../Observer';
import Editor from './Editor';

export default (props: any) => (
  <Observer>
    <Editor {...props} />
  </Observer>
);
