import type createAnalyzeBugVersionsFactory from './bug-versions'
import type { IBugVersions } from './bug-versions'

// ====== Types ======
type UnPromise<T> = T extends Promise<infer U> ? U : T
export type AnalyzeResult = UnPromise<ReturnType<ReturnType<typeof createAnalyzeBugVersionsFactory>['analyze']>>
export interface RefinedAntdConfig {
  collapsedDeprecatedDetail: boolean
  displayOnlyDeprecated: boolean
}

export interface RefinedAntdOptions extends RefinedAntdConfig {
  analyzeResult: AnalyzeResult
}

export interface CreateDetailsOptions extends Partial<IBugVersions>, RefinedAntdConfig {
  allVersionsAnchor: ReadonlyMap<string, HTMLElement>
  currentVersion?: string
}

export type CDN_ITEM = Readonly<{
  antd: string
  BUG_VERSIONS: string
}>