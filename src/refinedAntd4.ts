import {
  clean as semverClean,
  valid as semverValid,
} from 'semver'
import type { RefinedAntdOptions } from './type'
import createDetails from './createDetails'

/**
 * refined-antd4
 */
function refinedAntd4(opt: RefinedAntdOptions) {
  const { collapsedDeprecatedDetail, displayOnlyDeprecated, analyzeResult } = opt
  const change = $('.markdown h2[id^="4."]')
  const allVersionsAnchor: Map<string, HTMLElement> = new Map()

  for (let i = 0; i < change.length; i++) {
    const el = change[i]
    const textVersion = $(el).find('span').text()

    if (!textVersion || !semverValid(textVersion))
      continue

    const version = semverClean(textVersion)!
    allVersionsAnchor.set(version, $(el).find('a').get(0)!)
    const originVersionDetail = $(el).next().nextAll()
    const { recommendVersion, reason } = analyzeResult.get(version) || {}

    if (!analyzeResult.has(version)) {
      if (displayOnlyDeprecated) {
        $(el)
          .closest('.ant-timeline > .ant-timeline-item')
          .attr({
            hidden: true,
          })
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
      let clonedOriginVersionDetail = originVersionDetail.clone(true)

      if (originVersionDetail.length > 1)
        clonedOriginVersionDetail = $('<div></div>').append(clonedOriginVersionDetail)

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

      originVersionDetail
        .first()
        .empty().html(newDetails.prop('outerHTML'))
        .nextAll()
        .remove()
    }
  }
}

export default refinedAntd4
