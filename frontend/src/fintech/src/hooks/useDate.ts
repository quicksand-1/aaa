import { useEffect, useState } from 'react';

const useDate = () => {
  const [data, setData] = useState({});

  useEffect(() => {
    const tick = () => {
      const date = new Date();
      const YYYY = date.getFullYear();
      const MM = (date.getMonth() + 1).toString().padStart(2, '0');
      const DD = date.getDate().toString().padStart(2, '0');
      const hh = date.getHours().toString().padStart(2, '0');
      const mm = date.getMinutes().toString().padStart(2, '0');
      const ss = date.getSeconds().toString().padStart(2, '0');
      const week = [
        '星期日',
        '星期一',
        '星期二',
        '星期三',
        '星期四',
        '星期五',
        '星期六',
      ][date.getDay()];

      setData({ YYYY, MM, DD, hh, mm, ss, week });
      requestAnimationFrame(tick);
    };

    requestAnimationFrame(tick);
  }, []);

  return data;
};

export default useDate;
