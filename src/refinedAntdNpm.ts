import {
  clean as semverClean,
  valid as semverValid,
} from 'semver'
import type { RefinedAntdOptions } from './type'
import { TRACK_CATEGORY_KEY } from './createDetails'


// 通过 url 查询参数判断是否在 version 页面
function isVersionTab() {
  const QR = '?activeTab=versions'

  try {
    const versionTab = $(`#top > ul > li > a[href^="${QR}"]`)
    const c1 = $(versionTab).length > 0 && $(versionTab).attr('aria-selected') === 'true'

    if (c1) return true

    const c2 = new URLSearchParams(window.location.search).get('activeTab') === 'versions'

    return c2
  } catch (e) {
    return false
  }
}

function refinedAntdNpm(opt: RefinedAntdOptions) {
  const { collapsedDeprecatedDetail, displayOnlyDeprecated, analyzeResult } = opt

  if (!isVersionTab()) return;
  // #version-history 同级别的元素 table 里面的 tr 元素(除了第一个)
  const versionList = $('#version-history')
    .parent()
    .find('table:last tr:not(:first-child)')

  for (let i = 0; i < versionList.length; i++) {
    const el = versionList[i];

    // 第一个 a 元素是版本号
    const textVersion = $(el).find('a:first').text();

    if (!textVersion || !semverValid(textVersion))
      continue

    const version = semverClean(textVersion)!

    const { recommendVersion, reason } = analyzeResult.get(version) || {}

    if (analyzeResult.has(version)) {
      $(el)
        .attr('data-version', version)
        .attr('data-recommend-version', recommendVersion!)
        .css({ /* 'text-decoration': 'line-through', */ 'color': 'red' })

      $(el).find('*').css({ 'color': 'red' })
      $(el).find('td:first').css({ display: 'flex', alignItems: 'center' })

      const whyDeprecated = $('<span>')
        .attr({
          [TRACK_CATEGORY_KEY]: 'details',
          title: 'Click to see the reason',
        })
        .css({ marginLeft: '5px', cursor: 'help', whiteSpace: 'nowrap' })
        .on('click', () => {
          const firstReason = reason?.[0]
          if (firstReason) {
            window.open(firstReason, '_blank')
          } else {
            window.alert('Can not find the reason!')
          }
        })
        .text('🙅🏻‍♀️ deprecated! why?')

      $(el).find("a:first").after(whyDeprecated)

    } else {
      if (displayOnlyDeprecated) {
        $(el)
          .attr({ hidden: true })
          .css({ 'display': 'none' });
      }
    }

  }
}

export default refinedAntdNpm