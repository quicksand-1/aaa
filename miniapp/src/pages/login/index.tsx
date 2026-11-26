import { useRef, useState } from 'react'
import Taro, { useDidShow } from '@tarojs/taro'
import { Button, Input, Text, View } from '@tarojs/components'
import {
  bindWechat,
  fetchCurrentUser,
  loginWithPassword,
  loginWithWechat,
} from '@/services/auth'
import { clearSessionToken, getSessionToken } from '@/services/session'
import type { LoginResult } from '@/types/auth'
import './index.scss'

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : '登录失败，请稍后重试'
}

export default function Login() {
  const [account, setAccount] = useState('')
  const [password, setPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [checkingWechat, setCheckingWechat] = useState(true)
  const [wechatHint, setWechatHint] = useState('正在检查当前微信是否已绑定账号')
  const enteringRef = useRef(false)

  const enterApp = (result: Pick<LoginResult, 'needModifiedPwd'>) => {
    enteringRef.current = true
    Taro.reLaunch({
      url: result.needModifiedPwd
        ? '/pages/password/index?forced=1'
        : '/pages/home/index',
    })
  }

  const loginByWechat = async () => {
    setCheckingWechat(true)
    setWechatHint('正在检查当前微信是否已绑定账号')
    try {
      const result = await loginWithWechat()
      if (result.bound) {
        enterApp(result)
        return
      }
      setCheckWechatUnbound()
    } catch {
      setCheckingWechat(false)
      setWechatHint('微信自动登录暂不可用，请使用账号密码登录')
    }
  }

  const setCheckWechatUnbound = () => {
    setCheckingWechat(false)
    setWechatHint('首次使用请使用账号密码登录，成功后会自动绑定当前微信')
  }

  useDidShow(() => {
    if (enteringRef.current) return

    if (!getSessionToken()) {
      void loginByWechat()
      return
    }

    fetchCurrentUser()
      .then(enterApp)
      .catch(() => {
        clearSessionToken()
        void loginByWechat()
      })
  })

  const submit = async () => {
    if (submitting || checkingWechat) return
    if (!account.trim() || !password) {
      Taro.showToast({ title: '请输入账号和密码', icon: 'none' })
      return
    }

    setSubmitting(true)
    try {
      const loginResult = await loginWithPassword(account.trim(), password)
      try {
        await bindWechat()
      } catch (error) {
        await new Promise<void>((resolve) => {
          Taro.showModal({
            title: '微信绑定失败',
            content: `${errorMessage(error)} 本次账号登录仍可继续。`,
            showCancel: false,
            complete: () => resolve(),
          })
        })
      }
      enterApp(loginResult)
    } catch (error) {
      clearSessionToken()
      Taro.showToast({ title: errorMessage(error), icon: 'none' })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <View className='login-page'>
      <View className='login-page__hero'>
        <View className='login-brand'>
          <View className='login-brand__mark'>
            <Text>业</Text>
          </View>
          <View>
            <Text className='login-brand__name'>业务工作台</Text>
            <Text className='login-brand__caption'>BUSINESS WORKSPACE</Text>
          </View>
        </View>
        <View className='login-page__intro'>
          <Text className='login-page__eyebrow'>统一业务入口</Text>
          <Text className='login-page__headline'>让业务流程随时随地继续</Text>
          <Text className='login-page__description'>
            首次登录绑定当前微信，之后打开小程序即可免密进入。
          </Text>
        </View>
      </View>

      <View className='login-panel'>
        <View className='login-panel__title-block'>
          <Text className='login-panel__title'>账号登录</Text>
          <Text className='login-panel__subtitle'>内部系统 · 仅限授权账号访问</Text>
        </View>

        <View className={`login-wechat-state ${checkingWechat ? 'is-checking' : ''}`}>
          <View className='login-wechat-state__mark'>
            <Text>{checkingWechat ? '…' : '微'}</Text>
          </View>
          <Text className='login-wechat-state__text'>{wechatHint}</Text>
        </View>

        <View className='login-field'>
          <Text className='login-field__label'>账号</Text>
          <Input
            className='login-field__input'
            disabled={checkingWechat}
            maxlength={30}
            placeholder='请输入账号'
            placeholderClass='login-field__placeholder'
            value={account}
            onInput={(event) => setAccount(event.detail.value)}
          />
        </View>

        <View className='login-field'>
          <Text className='login-field__label'>密码</Text>
          <Input
            className='login-field__input'
            disabled={checkingWechat}
            maxlength={18}
            password
            placeholder='请输入密码'
            placeholderClass='login-field__placeholder'
            value={password}
            onInput={(event) => setPassword(event.detail.value)}
          />
        </View>

        <Button
          className='primary-button login-submit'
          disabled={submitting || checkingWechat}
          loading={submitting || checkingWechat}
          onClick={submit}
        >
          {checkingWechat ? '正在验证微信身份' : '登录并绑定微信'}
        </Button>

        <Text className='login-panel__footer'>业务数据协同 · 安全访问</Text>
      </View>
    </View>
  )
}
