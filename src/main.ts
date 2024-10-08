import {
  clean as semverClean,
  valid as semverValid,
} from 'semver'
import './jq';
import log from './logger'
import type { AnalyzeResult, RefinedAntdConfig } from './type'
import createAnalyzeBugVersionsFactory from './bug-versions'
import refinedAntd5 from './refinedAntd5'
import refinedAntd4 from './refinedAntd4'
import fetchJSONFactory, { CDN } from './fetchJSON'
import refinedAntd3 from './refinedAntd3'
import refinedAntdNpm from './refinedAntdNpm'
import { TRACK_CATEGORY_KEY } from './createDetails'

// ====== utils ======
function isAntdWebsite() {
  const RE = /ant[.-\s]design/i
  // return RE.test(document.title) || RE.test(document.URL)
  return [
    document.title,
    document.URL,
    $('meta[name="generator"]').attr('content'),
  ].some(v => RE.test(v as string))
}

function isNpmJSWithAntd() {
  const isNpmJS = window.location.host === 'www.npmjs.com'
  const isAntd = window.location.pathname.includes('package/antd');

  return isNpmJS && isAntd
}

async function xhr(url: string) {
  if (typeof GM_xmlhttpRequest === 'undefined') {
    return fetch;
  }

  const fn = () => new Promise((resolve, reject) => {
    GM_xmlhttpRequest({
      method: 'GET',
      url,
      responseType: 'json',
      onload(res: any) {
        resolve(res.response)
      },
      onerror: reject,
    })
  });

  return { json: fn };
};

const fetchJSON = fetchJSONFactory(xhr)

// 失败了从下一个 CDN 获取
async function requestNextOnFailure(urls: string[], verifier: (json: any) => boolean) {
  for (const url of urls) {
    try {
      const json = await fetchJSON(url)
      if (verifier(json)) return json;
    } catch (e) {
      log.error(e)
    }
  }
  return Promise.reject(`All requests failed: ${[, ...urls].join('\n')}`)
}

const detectVersion = (function () {
  const selector = [
    'header .version', // 适用于 4.x 和 3.x
    // 'a[href*="changelog"] span', // 5.x ~ 5.14.3 是好的
    'a[href*="changelog"] span:last-child', // <= https://github.com/ant-design/ant-design/commit/f5e9d2df450d2f917620fabf0074f847a9bbbe54 (5.14.3 ~ 5.20.3 适用)
    'a[href*="changelog"] > span:last-child', // https://github.com/ant-design/ant-design/pull/50625 又改了...

    '.markdown >h2[id^="5"]:first' // v5 再一次用 changelog 内容兜底
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
      GM_setValue?.(key, v)
      location.reload()
    },
  }

  GM_registerMenuCommand?.(`${title}: ${value ? '✅' : '❌'}`, () => {
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

  const is_V5 = (function () {
    if (currentAntdVersion) {
      return currentAntdVersion.startsWith('5.');
    }

    // 经常遇到没有版本号的情况，这时候就默认当作 5.x 处理。
    log.error('No version detected, assume it is 5.x, please report this issue to https://github.com/Wxh16144/refined-antd-changelog')

    return true
  }());

  const is_V4 = currentAntdVersion?.startsWith('4.')
  const is_V3 = currentAntdVersion?.startsWith('3.')

  let analyzeResult: AnalyzeResult
  const cdnTargets = [CDN.cnpm, CDN.remote];

  if (isNpmJSWithAntd()) cdnTargets.reverse(); // 优先使用 npmjs.com

  if (import.meta.env.LOCAL !== undefined) {
    cdnTargets.unshift(CDN.local); // 本地优先
  }

  const antdUrls = cdnTargets.map(({ antd }) => antd)
  const bugVersionsUrls = cdnTargets.map(({ BUG_VERSIONS }) => BUG_VERSIONS)

  try {
    const [antdJSON, bugVersionsJSON] = await Promise.all([
      requestNextOnFailure(
        antdUrls,
        (json) => !!json?.time
      ),
      requestNextOnFailure(
        bugVersionsUrls,
        (json) => typeof json === 'object' &&
          json !== null &&
          Object.keys(json).length > 3 // 至少 3 项, antd Christmas egg. 就有 3 项了...
      ),
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
    cdnTargets,
  })

  const refinedAntdConfig = Object.assign({ analyzeResult }, config)

  const _run = () => {
    if ($(`[${TRACK_CATEGORY_KEY}]`).length)
      return log.warn('Already refined, skip!')

    // === Right here! ===
    try {
      if (isAntdWebsite()) {
        if (is_V5)
          refinedAntd5(refinedAntdConfig)
        if (is_V4)
          refinedAntd4(refinedAntdConfig)
        if (is_V3)
          refinedAntd3(refinedAntdConfig)
      } else if (isNpmJSWithAntd()) {
        refinedAntdNpm(refinedAntdConfig)
      }
    } catch (e) {
      log.error(`Refine failed!`, e)
    }

    $('html, body')?.scrollTop?.(0)
  }

  function _interval(count: number, fn: () => void) {
    const delayTime = isAntdWebsite() ? 5 : 1
    let i = 0
    const timer = setInterval(() => {
      fn()
      if (++i >= count) {
        clearInterval(timer)
      }
    }, delayTime * 1000)
  }

  _interval(3, _run);

  const size = isAntdWebsite() ? 40 : 68;
  // fixme: 注水问题不知道怎么解决，添加一个悬浮球，点击后再执行（或者等前面 5s 后自动执行）
  $('<div>').css({
    position: 'fixed',
    inset: 'auto 72px 48px auto',
    width: `${size}px`,
    height: `${size}px`,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    userSelect: 'none',
    cursor: 'pointer',
    borderRadius: '50%',
    zIndex: Number.MAX_SAFE_INTEGER,
    transform: 'scale(0.68)',
    transformOrigin: 'center right',
    background: 'url(https://gw.alipayobjects.com/zos/rmsportal/KDpgvguMpGfqaHPjicRK.svg) no-repeat center center / 100% 100%',
    boxShadow: `0 6px 16px 0 rgba(0, 0, 0, 0.08),
    0 3px 6px -4px rgba(0, 0, 0, 0.12),
    0 9px 28px 8px rgba(0, 0, 0, 0.05)`
  })
    .on('click', _run)
    .attr({
      'title': '点击清理日志',
      'id': 'refined-antd-changelog_ball',
      'data-ref': 'https://github.com/Wxh16144/refined-antd-changelog',
    })
    .on('contextmenu', (e) => {
      // 右键打开项目地址不过分吧？（挺过分的）
      // window.open($(e.currentTarget).attr('data-ref'))
    })
    .appendTo('body')
}

// \\\\\\\\\\
run()
// \\\\\\\\\\
