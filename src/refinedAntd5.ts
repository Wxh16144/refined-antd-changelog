import {
  clean as semverClean,
  valid as semverValid,
} from 'semver'
import type { RefinedAntdOptions } from './type'
import createDetails from './createDetails'

/**
 * refined-antd5
 */
function refinedAntd5(opt: RefinedAntdOptions) {
  const { collapsedDeprecatedDetail, displayOnlyDeprecated, analyzeResult } = opt
  const change = $('.markdown div.refined-changelog:has(h2[id^="5"])')
  const allVersionsAnchor: Map<string, HTMLElement> = new Map()

  for (let i = 0; i < change.length; i++) {
    const el = change[i]
    const versionEl = $(el).find('h2[id^="5"]').get(0)!
    const textVersion = $(versionEl).text()
      .match(/\d+\.\d+\.\d+/)?.[0]

    if (!textVersion || !semverValid(textVersion))
      continue

    const version = semverClean(textVersion)!
    allVersionsAnchor.set(version, $(el).find('a').get(0)!)
    const versionWarp = $(el).children().first()
    const originVersionDetail = $(el).find('div.changelog-details')
    const { recommendVersion, reason } = analyzeResult.get(version) || {}

    if (!analyzeResult.has(version)) {
      if (displayOnlyDeprecated) {
        $(el).attr({ hidden: true })
      }
      continue
    }

    $(versionWarp)
      .attr('data-version', version)
      .attr('data-recommend-version', recommendVersion!)
      .find('>h2')
      .css({
        'text-decoration': 'line-through',
        'color': 'red',
      })

    if (originVersionDetail?.length) {
      const clonedOriginVersionDetail = originVersionDetail.clone(true)

      const newDetails = createDetails({
        allVersionsAnchor,
        collapsedDeprecatedDetail,
        displayOnlyDeprecated,
        currentVersion: version,
        reason,
        recommendVersion,
      }).append(
        clonedOriginVersionDetail
          .css({
            border: '1px solid #1890ff',
            borderBlockStart: 'none',
          }),
      )

      originVersionDetail.replaceWith(newDetails)
    }
  }

  // 清理锚点
  setTimeout(() => {
    // antd 官网的锚点出现极慢，延迟 2s 再执行吧...
    refinedAntd5Anchor(opt);
  }, 2000);
}

// 清理锚点
function refinedAntd5Anchor(opt: RefinedAntdOptions) {
  const { displayOnlyDeprecated, analyzeResult } = opt
  const anchors = $('div.ant-anchor > div[class~="ant-anchor-link"]');

  for (let i = 0; i < anchors.length; i++) {
    const el = anchors[i]
    const textVersion = $(el).text()
      .match(/\d+\.\d+\.\d+/)?.[0]

    if (!textVersion || !semverValid(textVersion))
      continue

    const version = semverClean(textVersion)!

    const { recommendVersion, reason } = analyzeResult.get(version) || {}

    if (analyzeResult.has(version)) {
      $(el)
        .attr('data-version', version)
        .attr('data-recommend-version', recommendVersion!)
        .css({ 'text-decoration': 'line-through', 'color': 'red' })
        .find('*').css({
          'color': 'red',
        });
    } else {
      if (displayOnlyDeprecated) {
        $(el).attr({ hidden: true })
      }
    }
  }
}

export default refinedAntd5
