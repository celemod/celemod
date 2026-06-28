import { AlertDialog, AlertDialogIconProps, AlertDialogProps, Button } from '@heroui/react'
import { createGlobalState } from 'react-use'

interface AlertProps {
  status?: AlertDialogIconProps['status']
  isOpen?: AlertDialogProps['isOpen']
  onOpenChange?: AlertDialogProps['onOpenChange']
  title?: string
  message?: React.ReactNode
  cancelText?: string
  okText?: string
  onOk?: () => void
  onCancel?: () => void
}

export function Alert({
  status,
  title,
  message,
  cancelText,
  okText,
  onOk,
  onCancel,
  isOpen,
  onOpenChange,
}: AlertProps) {
  return (
    <AlertDialog isOpen={isOpen} onOpenChange={onOpenChange}>
      <AlertDialog.Backdrop>
        <AlertDialog.Container>
          <AlertDialog.Dialog>
            <AlertDialog.CloseTrigger />
            <AlertDialog.Header>
              <AlertDialog.Icon status={status} />
              <AlertDialog.Heading>{title}</AlertDialog.Heading>
            </AlertDialog.Header>

            <AlertDialog.Body>{message}</AlertDialog.Body>

            <AlertDialog.Footer>
              <Button
                slot="close"
                variant="tertiary"
                onPress={() => {
                  onCancel?.()
                }}
              >
                {cancelText}
              </Button>
              {okText && (
                <Button
                  slot="close"
                  variant={status === 'danger' ? 'danger' : 'primary'}
                  onPress={() => {
                    onOpenChange?.(false)
                    onOk?.()
                  }}
                >
                  {okText}
                </Button>
              )}
            </AlertDialog.Footer>
          </AlertDialog.Dialog>
        </AlertDialog.Container>
      </AlertDialog.Backdrop>
    </AlertDialog>
  )
}

type AlertProviderProps = Omit<AlertProps, 'isOpen' | 'onOpenChange'>
const useAlertValue = createGlobalState<AlertProviderProps | null>()
export function useAlert() {
  const [alertValue, setAlertValue] = useAlertValue()

  return (props: AlertProviderProps) => {
    if (alertValue) {
      return
    }

    setAlertValue(props)
  }
}
export function AlertProvider() {
  const [alertValue, setAlertValue] = useAlertValue()

  return (
    <Alert
      {...alertValue}
      isOpen={!!alertValue}
      onOpenChange={() => {
        setAlertValue(null)
      }}
    />
  )
}
