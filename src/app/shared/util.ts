export type Primitive = string | number | boolean | Date | null | undefined
export type Obj = {[key: string]: Primitive};



/**
 * creates a deferred object with the following properties:
 * - promise: a Promise that can be awaited for
 * - resolve: method to resolve the promise
 * - reject: method to reject promise
 * @example:
 * const deferred = new Deferred();
 *
 * async function waitForIt() {
 *     console.log('waiting...');
 *     await deferred.promise;
 *     console.log('resolved!');
 * }
 * waitForIt();
 * setTimeout(() => deferred.resolve(), 1000);
 */
class Deferred<T> {
    promise: Promise<T>;
    // @ts-ignore  // resolve will be assigned by new promise
    resolve: (value: T) => void;
    // @ts-ignore  // reject will be assigned by new promise
    reject: (error: string | Error) => void;

    constructor() {
        this.promise = new Promise((resolve, reject) => {
            this.resolve = resolve;
            this.reject = reject;
        });
    }
}

/**
 * Returns a random id as UUID 8-4-4-4-12
 * - Uses ``crypto.randomUUID()`` in secure environments and if supported by browser.
 * - Uses ``crypto.getRandomValues()`` otherwise to construct a UUID
 * @example
 * const id = getRandomId();  // "895964fc-31d6-2daf-7603-4f651a90200d"
 * @returns {string}
 */
function getRandomId(): string {
    try {
        return crypto.randomUUID();
    }
    catch (error) {
        let [n1, n2, n3, n4, n5] = crypto.getRandomValues(new BigUint64Array(5));
        const s1= n1.toString(16).slice(-8);
        const s2 = n2.toString(16).slice(-4);
        const s3 = n3.toString(16).slice(-4);
        const s4 = n4.toString(16).slice(-4);
        const s5 = n5.toString(16).slice(-12);
        return `${s1}-${s2}-${s3}-${s4}-${s5}`
    }
}

const compare = (a: Primitive , b: Primitive) => {
    if (a == null && b == null) return 0;
    if (a == null) return -1;
    if (b == null) return 1;
    return  a < b ? -1 : a > b ? 1 : 0
};

/**
 * **Sorts an array of objects by a property / key**
 *
 * @param array {object[]} array of objects to be sorted
 * @param sortBy {string} property / key name to sort by
 * @param direction {'asc'|'desc'} Sort direction (asc by default)
 * @param clone {boolean} indicates whether to return a copy of the array (default
 * @example Sorts arr by name in ascending order (returns a copy of the array)
 * const arr = [
 *     {name: 'John Doe', age: 23},
 *     {name: 'Jane Doe', age: 45},
 * ]
 * sortArr(arr, 'name');
 * @example Returns the ***the original array***, sorted by age in descending order
 * const sortedOriginal = sortArr(arr, 'age', 'desc', false); */
function sortArr( array: any[], sortBy: string, direction: 'asc' | 'desc' | '' = 'asc', clone = true): any[] {
    const arr = clone ? [...array] : array;
    if (sortBy === '' || direction === '') return arr;
    return arr.sort((a, b) => {
        const res = compare(a[sortBy], b[sortBy]);
        return direction === 'asc' ? res : -res;
    });
}

/**
 * Filters an array of objects for a filter string. All rows are included where at least one field has a match
 * @param array {Object[]} Source array of objects
 * @param filter {string} Filter string
 * @param fields {string[]} Optional array of fields (columns) to check - default: all
 *
 * @example
 * const list = [
 *     {id: '1', firstname: 'Peter', lastName: 'Hug'},
 *     {id: '2', firstname: 'Michael', lastName: 'Peters'},
 *     {id: '3', firstname: 'Hans', lastName: 'Meier'},
 * ]
 * const filteredList = quickFilter(list, 'peter')
 * // Returns rows 1 and 2
 * const filteredList = quickFilter(list, 'peter', ['lastName'])
 * // Returns row 2 (only lastName is checked)
 *
 */
function quickFilter(array: any[], filter: string, fields?: string[],): any[] {
    const lower = filter.toLowerCase();
    return array.filter(row => {
        const keys = fields || Object.keys(row);
        for (const key of keys) {
            if (String(row[key]).toLowerCase().includes(filter)) return true;
        }
        return false
    })
}

/**
 * Returns a cleaned copy of an object by removing all keys, which have undefined or null values
 * @param {object} obj source object
 * @returns {object} cleaned object
 * @example
 * const obj1 = {a: 'yes', b: '', c: null, d: undefined}
 * const cleaned = removeNullishObjectKeys(obj1);
 * // Returns {a: 'yes', b: ''}
 */
function removeNullishObjectKeys(obj: object): object {
    const cleaned: any = {};
    for (let key in obj) {
        let objKey = key as keyof typeof obj;
        if (obj[objKey as keyof typeof obj] != null) cleaned[objKey] = obj[objKey];
    }
    return cleaned;
}

/**
 * Saves an object as json to a file. The file is downloaded by the browser to the default download location.
 * @param obj {object} The object to save
 * @param filename {string} filename (without .json, will be added)
 * @example
 * const data = [ { name: Michael, age: 56 } ];
 * saveToFile(data, 'membersList');
 * // %userprofile%\downloads\membersList.json
 */
function saveToFile (obj: object, filename: string) {
    const blob = new Blob([JSON.stringify(obj, null, 2)], {
        type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename}.json`;
    a.click();
    URL.revokeObjectURL(url);
}

/**
 * Sets the src property of an \<img> tag to a placeholder image if the src is broken. <br>
 * The brokenImg is hardcoded, update as needed
 * @param {ErrorEvent} e
 * @example
 * <img src="???" onerror="setBrokenImage(event)" />   (vanilla.js)
 * <img src="???" (error)="setBrokenImage($event)" />  (Angular)
 */
function setBrokenImage(e: ErrorEvent) {
    const brokenImg =  '/assets/broken_img.jpg';
    const target = e.target as HTMLImageElement;
    if (!target.src.includes(brokenImg)) target.src = brokenImg;
}

/**
 * Use for async calls to handle errors gracefully
 * @param {Promise<T>} promise An asnyc function returning a promise (e.g. http call)
 * @param errorHandler optional error handling function, can return treated error
 * @example Simple
 * const [error, data] = await safeAwait( fetch("https://api.example.com") );
 * if (error) return; // Exit if there's an error
 * return data; // Return response data if successful
 *
 * @example 2 - Using an optional error handler
 * const [error, response] = await safeAwait(
 *   fetch("https://api.example.com"),
 *   (err) => console.error("Request failed:", err)
 * );
 * return response; // Return response if successful
 *
 */
async function safeAwait<T>(promise: Promise<T | null>, errorHandler?: (error: any) => any): Promise<[error: any, data: T | null]> {
    try {
        const data = await promise;
        return [null, data]; // Success: No error, return the data
    } catch (error) {
        if (errorHandler) error = errorHandler(error) || error; // Optional error handler
        return [error, null]; // Error occurred, return error with null data
    }
}

export { Deferred, removeNullishObjectKeys, getRandomId, sortArr, quickFilter, saveToFile, setBrokenImage, safeAwait };
