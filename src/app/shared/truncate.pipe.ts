import {Pipe, PipeTransform} from "@angular/core";
import {truncateStr} from "./util";

/**
 * Truncates a string if it exceeds the max number of Character
 * @param value {string | null | undefined} the source string
 * @param maxChar {number} the maximum number of Characters (default=30)
 * @return {string}  The truncated string or empty string, if value is null or undefined
 * @example
 * {{ 'This sentence is way too long' | truncate:20 }}  // 'This sent...too long'
 * {{ 'This sentence is ok!' | truncate:20 }}           // 'This sentence is ok!'
 * */
@Pipe({ name: 'truncate' })
export class TruncatePipe implements PipeTransform {

    transform(value: string | null | undefined,
              maxChar: number = 30): string {
        return truncateStr(value, maxChar)
    }
}
