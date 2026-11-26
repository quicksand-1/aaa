/**
 * 平台下拉框、应用下拉框
 * @ENV_PLATFORM_KEY：框架中的环境变量，判断当前是否有指定渲染的平台信息
 * */

import { Dropdown } from 'antd';
import platformStorage from '../../global/platformStorage';
import Module from './Module';

const AppDropdown = () => {
  const { apps, app } = platformStorage.get();

  if (apps?.length) {
    return (
      <Dropdown
        menu={{
          defaultSelectedKeys: [app.key || ''],
          items: apps.map((i) => ({ key: i.key, label: i.name })),
          onClick: ({ key }) => {
            platformStorage.set({ app: { ...app, key } });
            window.location.reload();
          },
        }}
      >
        <Module icon="audit" title={app.name} />
      </Dropdown>
    );
  }

  return null;
};

export default AppDropdown;
