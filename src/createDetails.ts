import type { CreateDetailsOptions } from './type'

export const TRACK_CATEGORY_KEY = 'data-refined-antd-changelog'

const createDetails = function (opt: CreateDetailsOptions) {
  const {
    // config
    collapsedDeprecatedDetail,
    displayOnlyDeprecated,
    // data
    recommendVersion,
    reason,
  } = opt

  const detailEl = $('<details></details>')
    .attr({
      [TRACK_CATEGORY_KEY]: 'details',
      open: !collapsedDeprecatedDetail,
    })

  let recommendVersionEl: JQuery<HTMLElement> | undefined

  if (recommendVersion) {
    detailEl.attr('data-recommend-version', recommendVersion)
    recommendVersionEl = $('<code></code>').html(recommendVersion)

    const anchor = opt.allVersionsAnchor.get(recommendVersion)

    // 仅显示弃用的时候不启用锚点。
    if (anchor && displayOnlyDeprecated !== true) {
      recommendVersionEl = $(anchor)
        .clone()
        .removeClass()
        .html(recommendVersionEl.prop('outerHTML'))
    }
  }

  const summaryEl = $('<summary></summary>')
    .html(
      `🙅🏻‍♀️ 该版本存在严重缺陷${recommendVersionEl ? `，建议升级到 ${recommendVersionEl.prop('outerHTML')}` : ''}, 点击查看详情。`,
    )

  const contentEl = $('<div></div>')
    .css({
      border: '1px solid red',
      color: 'red',
      padding: '6px',
    })

  const reasonEl = $('<ul></ul>')
    .append(
      $('<p></p>')
        .html('缺陷原因：')
        .css({ 'font-weight': 'bold', 'margin': 0 }),
    )
    .append(
      (Array.isArray(reason) ? reason : []).map(r => $('<li></li>')
        .html(r.replace(/(https?:\/\/[^ ]+)/g, '<a href="$1" target="_blank">$1</a>')),
      ),
    )

  // 组合
  contentEl.append(reasonEl)
  detailEl.append(summaryEl, contentEl)

  return detailEl
}

export default createDetails
