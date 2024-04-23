import { name, version } from '../package.json'

class Logger {
  prefix: string
  version = version

  constructor(prefix = name) {
    let _prefix = `[${prefix.toLocaleUpperCase()}: v${version}]`

    if (import.meta.env.LOCAL) {
      console.log(`%c LOCAL! ${_prefix}`, 'color: #faad14; font-size: 1rem; font-weight: bold;')
      _prefix = `LOCAL! ${_prefix}`
    }

    this.prefix = _prefix
  }

  warn(...args: any[]) {
    globalThis.console.log(`%c${this.prefix}`, 'color: #faad14', ...args)
  }

  info(...args: any[]) {
    globalThis.console.log(`%c${this.prefix}`, 'color: #1890ff', ...args)
  }

  error(...args: any[]) {
    globalThis.console.log(`%c${this.prefix}`, 'color: #f5222d', ...args)
  }
}

export default new Logger()
