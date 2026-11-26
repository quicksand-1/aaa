/**
 * 锚点滚动
 * @params
 *   dep: 依赖项
 *   anchor: 是否进行锚点滚动
 *   duration: 延时关闭时间，毫秒数
 * */

import { useEffect, useState } from 'react';

type ScrollAnchorProps = {
  dep?: any[];
  anchor?: boolean;
  duration?: number;
};

const useScrollAnchor = (props: ScrollAnchorProps) => {
  const { dep = [], anchor = false, duration = 99999999 } = props;

  const [hash, setHash] = useState('');
  const [flag, setFlag] = useState(true);

  const scrollToHash = () => {
    if (anchor && flag) {
      const hash = window.location.hash;
      if (hash) {
        const element = document.querySelector(hash);
        if (element) {
          const yOffset = -70; // 该值表示固定头部的高度，目前先写死，后面有需要可以写成设置属性
          const y =
            element.getBoundingClientRect().top + window.pageYOffset + yOffset;
          window.scrollTo({ top: y, behavior: 'smooth' });
          setHash(hash.replace('#', ''));
          setFlag(false);
        }
      }
    }
  };

  useEffect(() => {
    if (hash) {
      setTimeout(() => {
        setHash('');
      }, duration);
    }
  }, [hash]);

  useEffect(() => {
    scrollToHash();
    // 页面尺寸发生变化时执行
    // window.addEventListener('resize', scrollToHash);
    // return () => {
    //   window.removeEventListener('resize', scrollToHash);
    // };
  }, [...dep, anchor, flag]);

  return [hash];
};

export default useScrollAnchor;
