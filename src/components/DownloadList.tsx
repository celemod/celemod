import { useGlobalContext } from '../App'
import { useEffect } from 'react'
import { useState } from 'react'
import { Icon } from './Icon'
import { Download } from '../context/download'
import { Popover } from '@heroui/react'
import { useTranslation } from 'react-i18next'
import { Button } from './Button'

const formatBytes = (bytes: number) => {
  if (!bytes) return '0 B'
  const units = ['B', 'KiB', 'MiB', 'GiB']
  let value = bytes
  let index = 0
  while (value >= 1024 && index < units.length - 1) {
    value /= 1024
    index += 1
  }
  return `${value >= 100 || index === 0 ? value.toFixed(0) : value.toFixed(1)} ${units[index]}`
}

const formatSpeed = (bytesPerSec: number) => {
  if (!bytesPerSec) return '0 B/s'
  return `${formatBytes(bytesPerSec)}/s`
}

const Task = ({ task, download }: { task: Download.TaskInfo; download: any }) => {
  const { t } = useTranslation()
  const all = task.subtasks.length
  const finished = task.subtasks.filter((v) => v.state === 'Finished').length

  const [expanded, setExpanded] = useState(false)

  const activeSubtask = task.subtasks.find((v) => v.state === 'Downloading')
  const action =
    task.state === 'pending'
      ? {
          icon: 'i-cross',
          onClick: () => download.cancelDownload(task.name),
          title: t('取消'),
        }
      : (task.state === 'failed' || task.canceled) && task.source
        ? {
            icon: 'replay',
            onClick: () => download.downloadMod(task.name, task.source, { force: true }),
            title: t('重试'),
          }
        : null

  return (
    <div className="task">
      <label>
        <div className="infoLine">
          <button
            className="b1"
            onClick={() => {
              setExpanded((v) => !v)
            }}
          >
            {<Icon name={expanded ? 'i-down' : 'i-right'} />}
          </button>
          <span className="name">{task.name}</span>
          {action && (
            <button className="taskInlineAction" title={action.title} onClick={action.onClick}>
              <Icon name={action.icon} />
            </button>
          )}
          <span className="progress-label">
            {finished}/{all}
          </span>
        </div>
      </label>
      {activeSubtask && (
        <div className="metaLine">
          <span>
            {formatBytes(activeSubtask.downloadedBytes)}/{formatBytes(activeSubtask.totalBytes)}
          </span>
          <span>{formatSpeed(activeSubtask.speedBytesPerSec)}</span>
        </div>
      )}
      {expanded && (
        <div className="subTasks">
          {task.subtasks
            .filter((v) => v.state !== 'Finished' || v.error)
            .map((subtask) => (
              <div className="subTask" key={subtask.name}>
                <div className="name">{subtask.name}</div>
                <div className="progressLine">
                  <div className="progress">
                    <div
                      className="bar"
                      style={{
                        width: `${subtask.progress}%`,
                      }}
                    ></div>
                  </div>
                  <div className="text">{subtask.progress}%</div>
                </div>
                <div className="metaLine subMetaLine">
                  <span>
                    {formatBytes(subtask.downloadedBytes)}/{formatBytes(subtask.totalBytes)}
                  </span>
                  <span>{formatSpeed(subtask.speedBytesPerSec)}</span>
                </div>
                {subtask.state === 'Failed' && (
                  <div className="error">
                    <Icon name="fail" />
                    {subtask.error}
                  </div>
                )}
              </div>
            ))}
        </div>
      )}
    </div>
  )
}

export function DownloadListPopover() {
  const { t } = useTranslation()
  const { download } = useGlobalContext()
  const [downloadTasks, setDownloadTasks] = useState(download.downloadTasks.current)

  const tasks = Object.values(downloadTasks)

  useEffect(() => {
    download.eventBus.on('taskListChanged', () => {
      setDownloadTasks({ ...download.downloadTasks.current })
    })
  }, [])

  return (
    <Popover>
      <Button type="default">
        <Icon name={tasks?.length ? 'loaderPinwheel' : 'download'} />
      </Button>

      <Popover.Content placement="top left">
        <Popover.Dialog>
          <Popover.Heading>{t('下载任务')}</Popover.Heading>
          <div>
            {tasks
              .filter((v) => v.state !== 'finished' || v.canceled)
              .map((task) => (
                <Task key={task.name} task={task} download={download} />
              ))}
          </div>
        </Popover.Dialog>
      </Popover.Content>
    </Popover>
  )
}
