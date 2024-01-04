import { name, version } from '../package.json'

class Logger {
  prefix: string
  version = version

  constructor(prefix = name) {
    this.prefix = `[${prefix.toLocaleUpperCase()}: v${version}]`
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
