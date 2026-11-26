import { useModel } from '@umijs/max';
import { Card } from 'antd';
import MobileChangePassword from '@/components/MobileChangePassword';

export default function MobilePasswordPage() {
  const { setInitialState } = useModel('@@initialState');

  return (
    <div className="p-4 pb-6">
      <Card className="rounded-2xl" styles={{ body: { padding: 20 } }}>
        <p className="mb-5 mt-0 text-sm leading-6 text-slate-500">
          新密码需为 12-18 位，并同时包含大小写字母、数字和特殊字符。
        </p>
        <MobileChangePassword
          onSuccess={() => {
            setInitialState((previous) => ({
              ...previous,
              currentUser: {
                ...previous?.currentUser,
                needModifiedPwd: false,
              },
            }));
          }}
        />
      </Card>
    </div>
  );
}
