import { useEffect, useState, type ReactNode } from 'react'
import { Textarea, View } from '@tarojs/components'
import './index.scss'

export interface XSenderProps {
  value?: string
  placeholder?: string
  disabled?: boolean
  maxlength?: number
  confirmType?: 'send' | 'search' | 'next' | 'go' | 'done'
  confirmHold?: boolean
  autoHeight?: boolean
  children?: ReactNode
  onInput?: (value: string) => void
  onConfirm?: (value: string) => void
}

export default function XSender({
  value,
  placeholder = '',
  disabled = false,
  maxlength = 500,
  confirmType = 'send',
  confirmHold = false,
  autoHeight = false,
  children,
  onInput,
  onConfirm,
}: XSenderProps) {
  const [innerValue, setInnerValue] = useState(value || '')
  const currentValue = value ?? innerValue

  useEffect(() => {
    if (value !== undefined) setInnerValue(value)
  }, [value])

  const handleInput = (event: any) => {
    const nextValue = String(event.detail.value || '')
    setInnerValue(nextValue)
    onInput?.(nextValue)
  }

  return (
    <View className='x-sender'>
      <View className='x-sender__field'>
        <Textarea
          className='x-sender__input'
          autoHeight={autoHeight}
          confirmHold={confirmHold}
          confirmType={confirmType}
          disabled={disabled}
          maxlength={maxlength}
          placeholder={placeholder}
          placeholderClass='x-sender__placeholder'
          value={currentValue}
          onConfirm={(event) =>
            onConfirm?.(String(event.detail.value ?? currentValue))
          }
          onInput={handleInput}
        />
      </View>
      {children ? <View className='x-sender__action'>{children}</View> : null}
    </View>
  )
}
