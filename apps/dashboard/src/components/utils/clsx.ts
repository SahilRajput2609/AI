export function clsx(...classes: (string | false | null | undefined | 0 | 0n)[]): string {
  return classes.filter(c => typeof c === 'string').join(' ')
}
