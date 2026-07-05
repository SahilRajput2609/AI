// Simple logger utility

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
}

export class Logger {
  private level: LogLevel
  private prefix: string

  constructor(prefix: string = '', level: LogLevel = LogLevel.INFO) {
    this.prefix = prefix
    this.level = level
  }

  private log(level: LogLevel, message: string, ...args: unknown[]): void {
    if (level < this.level) return

    const timestamp = new Date().toISOString()
    const levelStr = LogLevel[level]
    const prefixStr = this.prefix ? `[${this.prefix}]` : ''

    const fullMessage = `${timestamp} ${levelStr} ${prefixStr} ${message}`

    switch (level) {
      case LogLevel.DEBUG:
      case LogLevel.INFO:
        console.log(fullMessage, ...args)
        break
      case LogLevel.WARN:
        console.warn(fullMessage, ...args)
        break
      case LogLevel.ERROR:
        console.error(fullMessage, ...args)
        break
    }
  }

  debug(message: string, ...args: unknown[]): void {
    this.log(LogLevel.DEBUG, message, ...args)
  }

  info(message: string, ...args: unknown[]): void {
    this.log(LogLevel.INFO, message, ...args)
  }

  warn(message: string, ...args: unknown[]): void {
    this.log(LogLevel.WARN, message, ...args)
  }

  error(message: string, ...args: unknown[]): void {
    this.log(LogLevel.ERROR, message, ...args)
  }

  setLevel(level: LogLevel): void {
    this.level = level
  }
}

export const createLogger = (prefix: string, level?: LogLevel): Logger => {
  return new Logger(prefix, level)
}
