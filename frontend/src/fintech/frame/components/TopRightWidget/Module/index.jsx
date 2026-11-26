import { AuditOutlined, BankOutlined, UserOutlined } from '@ant-design/icons';
import { forwardRef } from 'react';
import useStyles from './style';

const ICON = {
  user: <UserOutlined />,
  bank: <BankOutlined />,
  audit: <AuditOutlined />,
};

export default forwardRef(({ icon, title, ...props }, ref) => {
  const { styles } = useStyles();
  const curIcon = typeof icon === 'string' ? ICON[icon] : icon;

  return (
    <div ref={ref} {...props}>
      <div className={styles.module}>
        {curIcon && <div className={styles.icon}>{curIcon}</div>}
        {title && <div>{title}</div>}
      </div>
    </div>
  );
});
