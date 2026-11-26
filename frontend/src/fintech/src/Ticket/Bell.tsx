/**
 * 我的待办工单提醒
 * */

import { Badge } from 'antd';
import { useEffect, useRef, useState } from 'react';
import LinkBtn from '../LinkBtn';
import MagicTabs from '../MagicTabs';
import request from '../fetch/request';

export default ({ linkProps = {} }) => {
  const [count, setCount] = useState(0);
  const timerRef = useRef(null);

  const query = () => {
    request('/workOrder/my.json?pageSize=1', {
      showError: false,
    }).then(({ total }) => {
      setCount(total);
    });
  };

  useEffect(() => {
    query();
    timerRef.current = setInterval(query, 1000 * 60 * 5);

    return () => {
      if (timerRef.current) {
        timerRef.current = null;
        clearInterval(timerRef.current);
      }
    };
  }, []);

  if (count > 0) {
    return (
      <Badge count={count} size="small">
        <LinkBtn
          to="/system/ticket"
          onClick={() => {
            MagicTabs.updateKey('ticket', 'todo');
          }}
          {...linkProps}
        >
          工单
        </LinkBtn>
      </Badge>
    );
  }

  return null;
};
