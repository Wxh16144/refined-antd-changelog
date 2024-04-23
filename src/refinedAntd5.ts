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
  const change = $('.markdown >h2[id^="5"]')
  const allVersionsAnchor: Map<string, HTMLElement> = new Map()

  for (let i = 0; i < change.length; i++) {
    const el = change[i]
    const textVersion = $(el).text()

    if (!textVersion || !semverValid(textVersion))
      continue

    const version = semverClean(textVersion)!
    allVersionsAnchor.set(version, $(el).find('a').get(0)!)
    const originVersionDetail = $(el).next().next()
    const { recommendVersion, reason } = analyzeResult.get(version) || {}

    if (!analyzeResult.has(version)) {
      if (displayOnlyDeprecated) {
        ;[el, $(el).next(), originVersionDetail].forEach(
          el => $(el).attr({ hidden: true }),
        )
      }
      continue
    }

    $(el)
      .attr('data-version', version)
      .attr('data-recommend-version', recommendVersion!)
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
  refinedAntd5Anchor(opt);
}

// 清理锚点
function refinedAntd5Anchor(opt: RefinedAntdOptions) {
  const { displayOnlyDeprecated, analyzeResult } = opt
  const anchors = $('div.ant-anchor > div[class~="ant-anchor-link"]');

  for (let i = 0; i < anchors.length; i++) {
    const el = anchors[i]
    const textVersion = $(el).text()

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
