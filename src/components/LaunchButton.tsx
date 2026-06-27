import { Button } from '@heroui/react'
import { ReactNode, useState } from 'react'
import { useTranslation } from 'react-i18next'

export function LanuchButton({
  className,
  onClick,
  text,
  startingText,
}: {
  className?: string
  onClick?: (e: any) => void
  text?: ReactNode
  startingText?: ReactNode
}) {
  const { t } = useTranslation()
  const [isStarting, setIsStarting] = useState(false)

  function handleStart() {
    setIsStarting(true)

    setTimeout(() => {
      setIsStarting(false)
    }, 4000)
  }

  return (
    <Button
      variant="secondary"
      size="sm"
      className={className}
      isDisabled={isStarting}
      onClick={(e) => {
        onClick?.(e)

        handleStart()
      }}
    >
      {isStarting ? startingText || t('正在启动') : text || t('启动')}
    </Button>
  )
}
