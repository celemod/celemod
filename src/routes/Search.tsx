import i18n from 'src/i18n'
import { Fragment } from 'react'
import { useState, useEffect } from 'react'
import { ModList } from '../components/ModList'
import { currentMirror, initSearchSort, useGamePath, useSearchSort } from '../states'
import { Button } from '../components/Button'
import { Icon } from '../components/Icon'
import { useRef } from 'react'
import { Content, searchSubmission } from '../api/wegfan'
import { Select, ListBox, Input } from '@heroui/react'
import { enforceEverest } from '../components/EnforceEverestPage'

const categoryIdMap = {
  Assets: 15655,
  Dialog: 4633,
  Effects: 1501,
  Helpers: 5081,
  Maps: 6800,
  Mechanics: 4635,
  'Other/Misc': 4632,
  Skins: 11181,
  'Twitch Integration': 4636,
  UI: 2317,
}

export const Search = () => {
  const noEverest = enforceEverest()
  if (noEverest) return noEverest

  const [mods, setMods] = useState<Content[]>([])
  const [type, setType] = useState<string>('')
  const [search, setSearch] = useState<string>('')
  const [selectedPath] = useGamePath()
  const [loading, setLoading] = useState(true)
  const loadingLock = useRef(false)
  initSearchSort()
  const [sort, setSort] = useSearchSort()
  const [currentPage, setCurrentPage] = useState(1)

  const fetchModPage = async (page: number) => {
    console.log('fetching', page)
    setLoading(true)
    const res = await searchSubmission({
      page,
      // @ts-ignore
      categoryId: categoryIdMap[type],
      search,
      sort,
      // section: 'Mod',
      size: 25,
      includeExclusiveSubmissions: currentMirror() === 'wegfan',
    })
    console.log('finished, size:', res.content.length)
    setLoading(false)
    return res
  }

  useEffect(() => {
    loadingLock.current = false
  }, [mods])

  function handleSearch() {
    setMods([])
    setCurrentPage(1)
    fetchModPage(1).then((v) => {
      setMods(v.content)
    })
  }

  useEffect(handleSearch, [])

  return (
    <Fragment>
      <div className="flex items-center space-x-2">
        <Input
          className={'grow'}
          value={search}
          onChange={(e) => {
            setSearch(e.target.value)
          }}
          onKeyUp={(e) => {
            if (e.code === 'Enter') {
              handleSearch()
            }
          }}
        />
        <Button
          onClick={() => {
            handleSearch()
          }}
        >
          <Icon name="search" />
        </Button>
        <Select
          className="w-36"
          variant="secondary"
          value={type}
          onChange={(v) => setType(v as string)}
        >
          <Select.Trigger>
            <Select.Value />
            <Select.Indicator />
          </Select.Trigger>
          <Select.Popover>
            <ListBox>
              <ListBox.Item id="" textValue={i18n.t('全部')}>
                {i18n.t('全部')}
                <ListBox.ItemIndicator />
              </ListBox.Item>
              <ListBox.Item id="Maps" textValue={i18n.t('地图')}>
                {i18n.t('地图')}
                <ListBox.ItemIndicator />
              </ListBox.Item>
              <ListBox.Item id="Assets" textValue={i18n.t('资源')}>
                {i18n.t('资源')}
                <ListBox.ItemIndicator />
              </ListBox.Item>
              <ListBox.Item id="Effects" textValue={i18n.t('特效')}>
                {i18n.t('特效')}
                <ListBox.ItemIndicator />
              </ListBox.Item>
              <ListBox.Item id="UI" textValue="UI">
                UI
                <ListBox.ItemIndicator />
              </ListBox.Item>
              <ListBox.Item id="Dialog" textValue={i18n.t('对话')}>
                {i18n.t('对话')}
                <ListBox.ItemIndicator />
              </ListBox.Item>
              <ListBox.Item id="Other/Misc" textValue={i18n.t('其他')}>
                {i18n.t('其他')}
                <ListBox.ItemIndicator />
              </ListBox.Item>
              <ListBox.Item id="Helpers" textValue={i18n.t('辅助')}>
                {i18n.t('辅助')}
                <ListBox.ItemIndicator />
              </ListBox.Item>
              <ListBox.Item id="Skins" textValue={i18n.t('皮肤')}>
                {i18n.t('皮肤')}
                <ListBox.ItemIndicator />
              </ListBox.Item>
              <ListBox.Item id="Mechanics" textValue={i18n.t('机制')}>
                {i18n.t('机制')}
                <ListBox.ItemIndicator />
              </ListBox.Item>
            </ListBox>
          </Select.Popover>
        </Select>
        <Select
          className="w-36"
          variant="secondary"
          value={sort}
          onChange={(v) => setSort(v as any)}
        >
          <Select.Trigger>
            <Select.Value />
            <Select.Indicator />
          </Select.Trigger>
          <Select.Popover>
            <ListBox>
              <ListBox.Item id="new" textValue={i18n.t('最近发布')}>
                {i18n.t('最近发布')}
                <ListBox.ItemIndicator />
              </ListBox.Item>
              <ListBox.Item id="updateAdded" textValue={i18n.t('最近添加')}>
                {i18n.t('最近添加')}
                <ListBox.ItemIndicator />
              </ListBox.Item>
              <ListBox.Item id="updated" textValue={i18n.t('最近更新')}>
                {i18n.t('最近更新')}
                <ListBox.ItemIndicator />
              </ListBox.Item>
              <ListBox.Item id="views" textValue={i18n.t('最多浏览')}>
                {i18n.t('最多浏览')}
                <ListBox.ItemIndicator />
              </ListBox.Item>
              <ListBox.Item id="likes" textValue={i18n.t('最多点赞')}>
                {i18n.t('最多点赞')}
                <ListBox.ItemIndicator />
              </ListBox.Item>
            </ListBox>
          </Select.Popover>
        </Select>
      </div>

      <div className="mt-6">
        {mods.length > 0 ? (
          mods[0] ? (
            <ModList
              mods={mods}
              loading={loading}
              modFolder={selectedPath + '/Mods'}
              currentPage={currentPage}
              totalPages={Math.ceil(mods.length / 25)}
              onPageChange={async (page: number) => {
                if (loadingLock.current) return
                loadingLock.current = true
                const data = await fetchModPage(page)
                setMods(data.content)
                setCurrentPage(page)
                loadingLock.current = false
              }}
            />
          ) : (
            <div>{i18n.t('加载失败，请重试')}</div>
          )
        ) : loading ? (
          <div></div>
        ) : (
          <div>{i18n.t('无内容')}</div>
        )}
      </div>
    </Fragment>
  )
}
