import {
  clean as semverClean,
  valid as semverValid,
} from 'semver'
import log from './logger'
import type { AnalyzeResult, RefinedAntdConfig } from './type'
import createAnalyzeBugVersionsFactory from './bug-versions'
import refinedAntd5 from './refinedAntd5'
import refinedAntd4 from './refinedAntd4'
import fetchJSONFactory, { CDN } from './fetchJSON'
import refinedAntd3 from './refinedAntd3'
import { TRACK_CATEGORY_KEY } from './createDetails'

// ====== utils ======
const fetchJSON = fetchJSONFactory()

const detectVersion = (function () {
  const selector = [
    'header .version',
    'a[href*="changelog"] span',
  ]
  let version: string | undefined

  return function () {
    if (version)
      return version

    for (const sel of selector) {
      const _version = $(sel).text()
      if (_version && semverValid(_version)) {
        version = semverClean(_version)!
        break
      }
    }

    return version
  }
}())

function useOptions<T>(key: string, title: string, defaultValue: T) {
  if (typeof GM_getValue === 'undefined')
    return defaultValue as { value: T }

  let value = GM_getValue(key, defaultValue)
  const ref = {
    get value() {
      return value
    },
    set value(v) {
      value = v
      GM_setValue(key, v)
      location.reload()
    },
  }

  GM_registerMenuCommand(`${title}: ${value ? '✅' : '❌'}`, () => {
    ref.value = !value
  })

  return ref as { value: T }
}

// ########################################################################
async function run() {
  const OPTIONS_PREFIX = 'rac'

  const COLLAPSED_DEPRECATED_DETAIL = useOptions(
    `${OPTIONS_PREFIX}_collapsed_deprecated_detail`,
    '折叠弃用版本',
    false,
  )

  const DISPLAY_ONLY_DEPRECATED = useOptions(
    `${OPTIONS_PREFIX}_display_only_deprecated`,
    '仅显示弃用版本',
    false,
  )

  const currentAntdVersion = detectVersion()
  const is_V5 = currentAntdVersion?.startsWith('5.')
  const is_V4 = currentAntdVersion?.startsWith('4.')
  const is_V3 = currentAntdVersion?.startsWith('3.')

  let analyzeResult: AnalyzeResult

  const cndTarget = import.meta.env.LOCAL !== undefined ? CDN.local : CDN.cnpm

  try {
    const [antdJSON, bugVersionsJSON] = await Promise.all([
      fetchJSON(cndTarget.antd),
      fetchJSON(cndTarget.BUG_VERSIONS),
    ])

    analyzeResult = await createAnalyzeBugVersionsFactory({
      currentVersion: currentAntdVersion,
      allVersions: antdJSON.time,
      deprecatedVersions: bugVersionsJSON,
    }).analyze()
  }
  catch (e) {
    log.error('Analyze failed!')
    log.error(e)
    return
  }

  const config: RefinedAntdConfig = {
    collapsedDeprecatedDetail: COLLAPSED_DEPRECATED_DETAIL.value,
    displayOnlyDeprecated: DISPLAY_ONLY_DEPRECATED.value,
  }

  log.info({
    currentAntdVersion,
    config,
    analyzeResult,
    cndTarget,
  })

  const refinedAntdConfig = Object.assign({ analyzeResult }, config)
  const _run = () => {
    if ($(`[${TRACK_CATEGORY_KEY}]`).length)
      return log.warn('Already refined, skip!')

    if (is_V5)
      refinedAntd5(refinedAntdConfig)
    if (is_V4)
      refinedAntd4(refinedAntdConfig)
    if (is_V3)
      refinedAntd3(refinedAntdConfig)
    $('html, body')?.scrollTop?.(0)
  }

  // $(_run); // 会有 react ssr 注水问题
  setTimeout(_run, 10000) // 10s 后再执行，避免 react ssr 注水问题

  // fixme: 注水问题不知道怎么解决，添加一个悬浮球，点击后再执行（或者等前面 10s 后自动执行）
  $('<div>').css({
    position: 'fixed',
    inset: 'auto 72px 48px auto',
    width: '40px',
    lineHeight: '40px',
    fontSize: '1.5rem',
    userSelect: 'none',
    textAlign: 'center',
    color: '#fff',
    cursor: 'pointer',
    borderRadius: '50%',
    zIndex: Number.MAX_SAFE_INTEGER,
    background: 'rgba(0,0,0,.5)',
    transform: 'scale(0.68)',
    transformOrigin: 'center right',
  })
    .on('click', _run)
    .on('mouseenter', function () {
      $(this).css('background', 'rgba(0,0,0,.8)')
    })
    .on('mouseleave', function () {
      $(this).css('background', 'rgba(0,0,0,.5)')
    })
    .attr({
      'title': '点击清理日志',
      'id': 'refined-antd-changelog_ball',
      'data-ref': 'https://github.com/Wxh16144/refined-antd-changelog',
    })
    .text('🏀')
    .appendTo('body')
}

// \\\\\\\\\\
run()
// \\\\\\\\\\
