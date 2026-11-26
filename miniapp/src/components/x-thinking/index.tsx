import { useEffect, useState } from 'react'
import { Text, View } from '@tarojs/components'
import './index.scss'

export interface XThinkingProps {
  content: string
  expanded?: boolean
  label?: string
  onToggle?: (expanded: boolean) => void
}

export default function XThinking({
  content,
  expanded = false,
  label = '思考过程',
  onToggle,
}: XThinkingProps) {
  const [innerExpanded, setInnerExpanded] = useState(expanded)

  useEffect(() => {
    setInnerExpanded(expanded)
  }, [expanded])

  const toggle = () => {
    const nextExpanded = !innerExpanded
    setInnerExpanded(nextExpanded)
    onToggle?.(nextExpanded)
  }

  return (
    <View className='x-thinking'>
      <View className='x-thinking__toggle' onClick={toggle}>
        <Text className='x-thinking__label'>{label}</Text>
        <Text
          className={`x-thinking__action ${innerExpanded ? 'is-expanded' : ''}`}
        >
          ›
        </Text>
      </View>
      {innerExpanded ? (
        <Text className='x-thinking__content'>{content}</Text>
      ) : null}
    </View>
  )
}
