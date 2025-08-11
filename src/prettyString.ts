import chalk from "chalk";

export function info(...msg: unknown[]): string {
  return [chalk.blue("[INFO]"), ...msg].join(" ");
}

export function error(...msg: unknown[]): string {
  return [chalk.red("[ERR]"), ...msg].join(" ");
}

export function success(...msg: unknown[]): string {
  return [chalk.green("[OK]"), ...msg].join(" ");
}
