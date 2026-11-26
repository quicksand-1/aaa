// @ts-nocheck

import { useId } from 'react';
import useAsyncScripts from './useAsyncScripts';

function useHtml2Image() {
  const id = useId();
  const [loading] = useAsyncScripts(['assets/html2canvas.js']);

  return {
    loading,
    onImage: (element = document.body, filename = id) => {
      window['html2canvas'](element).then((canvas) => {
        // 将 canvas 转换为图片数据 URL
        const imgData = canvas.toDataURL('image/png');

        // 创建一个 <a> 元素用于触发下载
        const link = document.createElement('a');
        link.href = imgData;
        link.download = `${filename}.png`;

        // 触发点击事件以开始下载
        link.click();
      });
    },
  };
}

export default useHtml2Image;
