/**
 * 自定义404页面
 *
 * */

import { history } from '@umijs/max';
import { Button, Result } from 'antd';

const Result404 = () => {
  return (
    <Result
      status="404"
      title="404"
      subTitle="抱歉，您访问的页面不存在。"
      extra={
        <Button type="primary" onClick={() => history.replace('/')}>
          返回首页
        </Button>
      }
    />
  );
};

export default Result404;
