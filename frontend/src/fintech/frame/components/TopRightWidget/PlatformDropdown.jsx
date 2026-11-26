/**
 * 平台下拉框、应用下拉框
 * @ENV_PLATFORM_KEY：框架中的环境变量，判断当前是否有指定渲染的平台信息
 * */

import { Dropdown } from 'antd';
import platformList from 'config/platform';
import platformStorage from '../../global/platformStorage';
import Module from './Module';

const PlatformDropdown = () => {
  const { key, name } = platformStorage.get();

  if (!ENV_PLATFORM_KEY && platformList?.length > 1) {
    return (
      <Dropdown
        menu={{
          defaultSelectedKeys: [key || ''],
          items: platformList.map((i) => ({
            key: i.key,
            label: i.alias || i.name,
          })),
          onClick: ({ key }) => {
            platformStorage.set({ key });
            window.location.reload();
          },
        }}
      >
        <Module icon="bank" title={name} />
      </Dropdown>
    );
  }

  return null;
};

export default PlatformDropdown;
