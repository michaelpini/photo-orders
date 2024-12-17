import { Pipe, PipeTransform } from '@angular/core';
import {transformUnits} from "./util";

/**
 * Converts a number to an expression with units.
 * @param value {number | null | undefined} the number to be labeled
 * @param zero {string} the expression returned if number is 0
 * @param one {string} the unit to be added if number is 1 or -1
 * @param more {string} the unit to be added for all other numbers
 * @return {string | undefined}  The formatted expression or undefined if value is undefined or null
 * @example
 *
 * {{ 0 | units:'no one', 'man', 'men'}}    // no one
 * {{ 0 | units:'no one', 'man', 'men'}}    // 1 man
 * {{ 0 | units:'no one', 'man', 'men'}}    // 2 men
 * */
@Pipe({ name: 'Units' })
export class UnitsPipe implements PipeTransform {

    transform(value: number | null | undefined,
              zero = 'none',
              one = 'unit',
              more = 'units'): string | undefined {
        return transformUnits(value, zero, one, more);
    }
}

