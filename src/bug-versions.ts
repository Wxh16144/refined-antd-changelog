/**
 * copied from https://github.com/ant-design/ant-design/pull/46755
 */
import {
  major as semverMajor,
  maxSatisfying as semverMaxSatisfying,
  prerelease as semverPrerelease,
  satisfies as semverSatisfies,
  sort as semverSort,
  valid as semverValid,
} from 'semver'

export interface IBugVersions {
  recommendVersion: string
  reason: string[]
}

export interface IFactoryOptions {
  currentVersion?: string
  allVersions: Record<string, string>
  deprecatedVersions: Record<string, string[]>
}

function createAnalyzeBugVersionsFactory(opt: Readonly<IFactoryOptions>) {
  const { allVersions, currentVersion, deprecatedVersions } = opt

  // ====== utils ======
  function arrayToLinkedList(arr: string[]) {
    if (!arr || arr.length === 0)
      return null

    const head = new ListNode(arr[0])
    let current = head

    for (let i = 1; i < arr.length; i++) {
      current.next = new ListNode(arr[i])
      current = current.next
    }

    return head
  }

  function matchDeprecated(v: string) {
    const match = Object.keys(deprecatedVersions).find(deprecated =>
      semverSatisfies(v, deprecated),
    )

    const reason = deprecatedVersions[match as keyof typeof deprecatedVersions] || []

    return { match: match!, reason: Array.isArray(reason) ? reason : [reason] }
  }

  class ListNode {
    value: string

    next: ListNode | null

    constructor(value: string) {
      this.value = value
      this.next = null
    }

    findMaxSatisfyingVersion(versionList: string[]): string | undefined {
      const { match } = matchDeprecated(this.value)
      const maxSatisfyingVersion = semverMaxSatisfying(versionList, match)!

      const maxSatisfyingVersionNext = this.findNext(maxSatisfyingVersion)?.value

      if (!maxSatisfyingVersionNext)
        return undefined

      if (semverMajor(maxSatisfyingVersionNext) > semverMajor(maxSatisfyingVersion))
        return maxSatisfyingVersion

      const { match: nextMatch } = matchDeprecated(maxSatisfyingVersionNext)
      if (nextMatch)
        return this.next?.findMaxSatisfyingVersion(versionList)

      return maxSatisfyingVersionNext
    }

    findNext(version: string) {
      let current: ListNode | null = this
      while (current) {
        if (current.value === version)
          return current.next

        current = current.next
      }
    }
  }

  // ====== function ======
  async function analyzeBugVersions() {
    const bugVersions: Map<string, IBugVersions> = new Map()

    const versionList = semverSort(
      Object.keys(allVersions)
        .filter(version => semverValid(version) && !semverPrerelease(version)),
    )

    if (currentVersion && !versionList.includes(currentVersion))
      versionList.push(currentVersion)

    const linkedList = arrayToLinkedList(versionList)

    if (!linkedList)
      throw new Error('versionList is empty')

    let current = linkedList
    let { next } = linkedList
    while (next) {
      const { match, reason } = matchDeprecated(current.value)

      if (match) {
        const find = current.findMaxSatisfyingVersion(versionList)

        if (find)
          bugVersions.set(current.value, { recommendVersion: find, reason })
      }

      current = next
      next = next.next
    }

    return bugVersions as ReadonlyMap<string, IBugVersions>
  }

  return {
    analyze: analyzeBugVersions,
  }
}

export default createAnalyzeBugVersionsFactory
