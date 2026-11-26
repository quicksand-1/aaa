import { useModel } from '@umijs/max';
import { Modal } from 'antd';
import ResetPassword from '../settings/ResetPassword';

const PasswordForceGuard = () => {
  const { initialState, setInitialState } = useModel('@@initialState');
  const open = !!initialState?.currentUser?.needModifiedPwd;

  return (
    <Modal
      open={open}
      title="修改密码"
      footer={null}
      width={520}
      centered
      closable={false}
      mask={{ closable: false }}
      keyboard={false}
      destroyOnHidden
    >
      <div style={{ color: 'rgba(0, 0, 0, 0.65)', marginBottom: 24 }}>
        当前账号必须先完成密码修改，修改成功后才可继续使用系统。
      </div>
      <ResetPassword
        onSuccess={() => {
          setInitialState((pre) => ({
            ...pre,
            currentUser: {
              ...pre?.currentUser,
              needModifiedPwd: false,
            },
          }));
        }}
      />
    </Modal>
  );
};

export default PasswordForceGuard;
