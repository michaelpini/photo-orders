import { Pipe, PipeTransform } from '@angular/core';

/**
 * Convert bytes into largest possible unit. <br>
 * Takes a precision argument as number.  <br>
 * Usage:
 *   bytes | fileSize:precision
 * @example
 * // returns 2.3 KB
 * {{ 2300 | fileSize }}
 * @example
 * // returns 12.3 GB
 * {{ 12340000000 | fileSize }}
 * @example
 * // returns 12.345 KB
 * {{ 12345 | fileSize:3 }}
 */
@Pipe({ name: 'fileSize' })
export class FileSizePipe implements PipeTransform {
    private readonly units = ['bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB'];

    transform(bytes: number = 0, precision?: number): string {
        let index = 0;

        while (bytes >= 900) {
            bytes /= 1000;
            index++;
        }

        const unit = this.units[index];

        if (precision === undefined) {
            precision = 3 - bytes.toFixed().length;
        }
        return `${Number.parseFloat(bytes.toFixed(precision))} ${unit}`;
    }
}

