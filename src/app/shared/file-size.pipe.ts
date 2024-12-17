import { Pipe, PipeTransform } from '@angular/core';
import {transformSize} from "./util";

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

    transform(bytes: number = 0, precision?: number): string {
        return transformSize(bytes, precision);
    }
}

