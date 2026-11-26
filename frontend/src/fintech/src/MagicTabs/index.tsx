/**
 * 二次封装 Tabs
 * */

import { Tabs } from 'antd';
import { useState } from 'react';
// @ts-ignore
import type { Tab as AntdTab, TabsProps } from 'antd/lib/tabs';
import _filter from '../utils/_filter';
import storageSQL from '../utils/storageSQL';
import useStyles from './style';

interface MagicCardItem extends AntdTab {
  open?: boolean;
  [key: string]: any;
}

interface MagicTabsProps extends Omit<TabsProps, 'items'> {
  ghost?: boolean;
  items: MagicCardItem[];
  persistenceKey?: string | false;
  noTabBarBottom?: boolean;
}

const SQL_FROM = 'magic_tabs';

const updateKey = (persistenceKey = '', type = '') => {
  if (persistenceKey) {
    storageSQL('duplicate', {
      from: SQL_FROM,
      where: `key=${persistenceKey}`,
      values: { key: persistenceKey, type },
    });
  }
};

const MagicTabs = (props: MagicTabsProps) => {
  const {
    persistenceKey = location.pathname,
    items = [],
    onChange = () => {},
    ghost = false,
    noTabBarBottom = false, // tabBar 下是否有间距
    ...rest
  } = props;
  const filterItems = _filter(items);

  const { styles, cx } = useStyles();
  const [activeKey, setActiveKey] = useState(() => {
    /**
     * 初始化选中项
     * 1、当持久化秘钥存在时，则获取缓存数据，优先级最高
     * 2、当持久化数据不存在时，则主动传入的 defaultActiveKey 优先级大于 filterItems 第一个
     * 3、在持久化控制时，使用者并不知道当前的选中项是什么，故提供了 onChange 函数来返回当前的选中项来为使用者提供初始化选中项数据
     * */

    const defaultKey = props.defaultActiveKey || filterItems[0]?.key;
    if (persistenceKey) {
      const findObj = storageSQL('find', {
        from: SQL_FROM,
        where: `key=${persistenceKey}`,
      });
      const currentKey = findObj.type || defaultKey;
      // 检查当前key是否存在于过滤项中，如果存在则触发onChange回调并返回当前key
      if (filterItems.some((i) => i.key === currentKey)) {
        onChange(currentKey);
        return currentKey;
      }
    }

    return defaultKey;
  });

  return (
    <Tabs
      type="card"
      {...rest}
      className={cx(rest.className, styles.magicTabs, {
        [styles.padding]: !ghost,
        [styles.noTabBarBottom]: noTabBarBottom,
      })}
      activeKey={activeKey}
      items={filterItems as AntdTab[]}
      onChange={(key) => {
        if (!!persistenceKey) {
          updateKey(persistenceKey, key);
        }
        setActiveKey(key);
        onChange(key);
      }}
    />
  );
};

MagicTabs.updateKey = updateKey;
export default MagicTabs;
