import type { CDN_ITEM } from './type'

export const CDN: Record<string, CDN_ITEM> = {
  local: {
    antd: 'http://localhost:8089/antd.json',
    BUG_VERSIONS: 'http://localhost:8089/BUG_VERSIONS.json',
  },
  remote: {
    antd: 'https://registry.npmjs.org/antd',
    BUG_VERSIONS: 'https://unpkg.com/antd/BUG_VERSIONS.json',
  },
  cnpm: {
    antd: 'https://registry.npmmirror.com/antd',
    BUG_VERSIONS: 'https://registry.npmmirror.com/antd/latest/files/BUG_VERSIONS.json',
  },
}

const fetchJSONFactory = function (fetcher = fetch) {
  const cache = new Map<string, any>()

  return async function (url: string) {
    if (cache.has(url))
      return cache.get(url)

    const res = await fetcher(url)
    const json = await res.json()

    cache.set(url, json)

    return json
  }
}

export default fetchJSONFactory
