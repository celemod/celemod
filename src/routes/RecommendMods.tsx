import i18n from 'src/i18n'

import { useAutoDisableNewMods, useGamePath, useInstalledMods } from '../states'
// import { Button } from '../components/Button'
import { useState } from 'react'
import { callRemote } from '../utils'
import { _functionalMods, _skinMods } from '../resources/RecommendModData'
import { useRef } from 'react'
import { useGlobalContext } from '../App'
import { enforceEverest } from '../components/EnforceEverestPage'
import { Description, Heading, Button } from '@heroui/react'

const modNameFromUrl = (url: string) => {
  return decodeURIComponent(url.split('/mods/').pop() || '')
}

const RMod = ({
  name,
  download_url,
  description,
  installed,
  startDownloadHandler,
  autoDisableNewMods,
}: {
  name: string
  download_url: string
  description: string
  installed?: boolean
  startDownloadHandler?: any
  modsFolder?: string
  autoDisableNewMods: boolean
}) => {
  const [state, setState] = useState(installed ? i18n.t('已安装') : i18n.t('下载'))
  const ctx = useGlobalContext()

  const startDownload = async () => {
    if (state !== i18n.t('下载')) return
    setState(i18n.t('准备下载'))
    const name = modNameFromUrl(download_url)

    try {
      const [gbFileId] = (await callRemote('get_mod_update', name)) as any[]

      await ctx.download.downloadMod(name, parseInt(gbFileId) === -1 ? download_url : gbFileId, {
        autoDisableNewMods,
        onProgress(task, progress) {
          setState(
            `${progress}% (${
              task.subtasks.filter((v) => v.state === 'Finished').length
            }/${task.subtasks.length})`,
          )
        },
        async onFinished() {
          setState(i18n.t('已安装'))
          await ctx.modManage.reloadMods()
        },
        onFailed() {
          setState(i18n.t('下载失败'))
        },
      })
    } catch (error) {
      console.error(error)
      setState(i18n.t('下载失败'))
    }
  }

  startDownloadHandler.download = startDownload

  return (
    <div>
      <Heading level={6}>{name}</Heading>
      <p className="leading-4 text-xs text-muted">{description}</p>

      <div className="mt-2">
        <Button
          size="sm"
          variant="secondary"
          onClick={() => {
            if (installed) return
            startDownloadHandler.download()
          }}
        >
          {state}
        </Button>
      </div>
    </div>
  )
}

export const RecommendMods = () => {
  const noEverest = enforceEverest()
  if (noEverest) return noEverest

  const functionalMods = _functionalMods()
  const skinMods = _skinMods()

  const { installedMods } = useInstalledMods()
  const [autoDisableNewMods] = useAutoDisableNewMods()
  const [gamePath] = useGamePath()
  const modsPath = gamePath + '/Mods'
  const refDownloadHandlers = useRef(
    [...functionalMods, ...skinMods].reduce((prev, mod) => {
      // @ts-ignore
      prev[mod.name] = {}
      return prev
    }, {}),
  )

  return (
    <div className="max-h-full">
      <Heading level={1}>{i18n.t('推荐的模组')}</Heading>
      <Description>{i18n.t('这里将会列出一些推荐安装的模组及其简介，请按需安装')}</Description>

      <div className="grid grid-cols-2 gap-x-6 mt-4">
        <div className="">
          <Heading level={4} className="flex items-center gap-x-1 mb-2">
            {i18n.t('功能性模组')}
            <Button
              size="sm"
              className={'h-7'}
              variant="secondary"
              onClick={() => {
                for (const mod of functionalMods
                  .filter((v) => !v.visible || v.visible(i18n.language))
                  .filter(
                    (mod) =>
                      !installedMods.some((m) => m.name === modNameFromUrl(mod.download_url)),
                  )
                  .filter((v) => !v.exclude_from_download_all)) {
                  // @ts-ignore
                  refDownloadHandlers.current[mod.name].download()
                }
              }}
            >
              {i18n.t('下载推荐')}
            </Button>
          </Heading>
          <div className="space-y-4">
            {functionalMods.map((mod) => {
              const handler = (refDownloadHandlers.current[mod.name] ??= {})
              return (
                (!mod.visible || mod.visible(i18n.language)) && (
                  <RMod
                    name={mod.name}
                    startDownloadHandler={handler}
                    download_url={mod.download_url}
                    description={mod.description}
                    modsFolder={modsPath}
                    autoDisableNewMods={autoDisableNewMods}
                    installed={installedMods.some(
                      (m) => m.name === modNameFromUrl(mod.download_url),
                    )}
                  />
                )
              )
            })}
          </div>
        </div>

        <div>
          <Heading level={4} className="mb-2">
            {i18n.t('皮肤模组')}
          </Heading>
          <div className="space-y-4">
            {skinMods.map((mod) => (
              <RMod
                name={mod.name}
                download_url={mod.download_url}
                description={mod.description}
                modsFolder={modsPath}
                autoDisableNewMods={autoDisableNewMods}
                startDownloadHandler={
                  // @ts-ignore
                  refDownloadHandlers.current[mod.name]
                }
                installed={installedMods.some((m) => m.name === modNameFromUrl(mod.download_url))}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
