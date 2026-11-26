import { useState } from 'react'
import Taro, { useRouter } from '@tarojs/taro'
import { Button, Input, Text, View } from '@tarojs/components'
import PageShell from '@/components/PageShell'
import { fetchCurrentUser } from '@/services/auth'
import { request } from '@/services/request'
import { useCurrentUser } from '@/hooks/useCurrentUser'
import './index.scss'

const PASSWORD_PATTERN =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*? ])\S{12,18}$/

const PASSWORD_MESSAGE =
  '密码必须包含大小写字母、数字、特殊字符(!@#$%^&*?)，长度12-18位'

function requestMessage(error: unknown): string {
  return error instanceof Error ? error.message : '修改失败，请稍后重试'
}

export default function Password() {
  const router = useRouter()
  const forced = router.params.forced === '1'
  const { user, setUser, loading } = useCurrentUser(true)
  const [oldPwd, setOldPwd] = useState('')
  const [newPwd, setNewPwd] = useState('')
  const [rePwd, setRePwd] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const submit = async () => {
    if (submitting) return
    if (!oldPwd || !newPwd || !rePwd) {
      Taro.showToast({ title: '请完整填写密码', icon: 'none' })
      return
    }
    if (!PASSWORD_PATTERN.test(newPwd)) {
      Taro.showToast({ title: PASSWORD_MESSAGE, icon: 'none' })
      return
    }
    if (newPwd !== rePwd) {
      Taro.showToast({ title: '两次输入的新密码不一致', icon: 'none' })
      return
    }

    setSubmitting(true)
    try {
      await request('/system/user/changePwd.json', {
        method: 'POST',
        data: { oldPwd, newPwd, rePwd },
      })
      const updatedUser = await fetchCurrentUser()
      setUser(updatedUser)
      Taro.showToast({ title: '修改成功', icon: 'success' })

      if (forced) {
        Taro.reLaunch({ url: '/pages/home/index' })
      } else if (getCurrentPages().length > 1) {
        Taro.navigateBack()
      } else {
        Taro.reLaunch({ url: '/pages/profile/index' })
      }
    } catch (error) {
      Taro.showToast({ title: requestMessage(error), icon: 'none' })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <PageShell
      title='修改密码'
      user={user}
      loading={loading}
      showBack={!forced}
    >
      <View className='password-page'>
        <View className='password-tip card'>
          <Text className='password-tip__title'>
            {forced ? '当前账号需要先修改密码' : '账号安全'}
          </Text>
          <Text className='password-tip__description'>
            新密码需为 12-18 位，并同时包含大小写字母、数字和特殊字符（!@#$%^&*?）。
          </Text>
        </View>

        <View className='password-form card'>
          <View className='password-field'>
            <Text className='password-field__label'>原密码</Text>
            <Input
              className='password-field__input'
              maxlength={18}
              password
              placeholder='请输入原密码'
              placeholderClass='password-field__placeholder'
              value={oldPwd}
              onInput={(event) => setOldPwd(event.detail.value)}
            />
          </View>

          <View className='password-field'>
            <Text className='password-field__label'>新密码</Text>
            <Input
              className='password-field__input'
              maxlength={18}
              password
              placeholder='请输入新密码'
              placeholderClass='password-field__placeholder'
              value={newPwd}
              onInput={(event) => setNewPwd(event.detail.value)}
            />
          </View>

          <View className='password-field'>
            <Text className='password-field__label'>确认新密码</Text>
            <Input
              className='password-field__input'
              maxlength={18}
              password
              placeholder='请再次输入新密码'
              placeholderClass='password-field__placeholder'
              value={rePwd}
              onInput={(event) => setRePwd(event.detail.value)}
            />
          </View>

          <Button
            className='primary-button'
            disabled={submitting}
            loading={submitting}
            onClick={submit}
          >
            确认修改
          </Button>
        </View>
      </View>
    </PageShell>
  )
}
