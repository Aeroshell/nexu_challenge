import * as currency from 'currency.js';

export function isNumber(value: string | number): boolean {
    try {
        currency(value, { errorOnInvalid: true });
        const is_number = /^-?\d*\.?\d+$/.test(`${value}`);
        return is_number;
    } catch (error) {
        return false;
    }
}

export function isIntegerPositive(value: string | number): boolean {
    try {
        const int_positive = /^(0|[1-9]\d*)$/.test(`${value}`);
        return int_positive;
    } catch (error) {
        return false;
    }
}