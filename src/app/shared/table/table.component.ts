import {formatCurrency, formatDate, formatNumber, NgClass,} from '@angular/common';
import {Component, computed, input, model, output, Signal} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {ObjAny, ObjFlat, Primitive, quickFilter, sortArr} from "../util";
import {FaIconComponent} from "@fortawesome/angular-fontawesome";
import {faCheck, faChevronRight, faFilterCircleXmark, faXmark} from "@fortawesome/free-solid-svg-icons";

export type SortOrder = 'asc' | 'desc' | '';
export type ValueFormatter = ((value: Primitive) => string);
export interface ColDef {
    field: string;
    headerName: string;
    disableSort?: boolean;
    initialSortOrder?: SortOrder;
    format?: string | ValueFormatter;
    width?: string;
    hidden?: boolean;
    excludeFromQuickFilter?: boolean;
}
export interface TableState {
    filter: string;
    sortColumn: string;
    sortOrder: SortOrder;
}

export const getTableState = (filter = '', sortColumn = '', sortOrder: SortOrder = ''): TableState => {
    return {filter, sortColumn, sortOrder};
}
const rotateSort: {[key: string]: SortOrder} = {'': 'asc', asc: 'desc', desc: ''};


@Component({
    selector: 'app-table',
    imports: [FormsModule, NgClass, FaIconComponent,],
    templateUrl: './table.component.html',
    styleUrl: './table.component.scss'
})
export class TableComponent {
    colDefs = input<ColDef[]>([]);
    rowData = input<ObjAny[]>([]);
    hideFilter = input(false, {transform: (val: string | boolean) => typeof val === 'boolean' ? val : true});
    showChevron = input(false, {transform: (val: string | boolean) => typeof val === 'boolean' ? val : true});
    locale = input('de-CH');
    state = model<TableState>(getTableState('', '', ''));
    selectedId = model<string>('');
    selected = output<ObjAny>();

    colDefsMap: Signal<{[field: string]: ColDef}> = computed(() => {
        return this.colDefs().reduce((acc: {[field: string]: ColDef}, val: ColDef) => {
            acc[val.field] = val;
            return acc;
        }, {})
    })
    rowDataFlat: Signal<ObjFlat[]> = computed(() => {
        return this.getFlatRowData(this.rowData(), this.colDefs());
    })
    rowDataFilteredSorted: Signal<ObjAny[]> = computed(() => {
        const filterFieldsArray = this.colDefs().filter(x => !x.excludeFromQuickFilter).map(x => x.field);
        const {filter, sortColumn, sortOrder} = this.state();
        const filtered = quickFilter((this.rowDataFlat()), filter, filterFieldsArray)
        return sortArr(filtered, sortColumn, sortOrder)
    })
    countInfo: Signal<string> = computed(() => {
        const totalRows = this.rowData().length;
        const filteredRows = this.rowDataFilteredSorted().length;
        if (!totalRows) return '';
        if (totalRows === filteredRows) return `${totalRows} item${totalRows > 1 ? 's' : ''}`;
        return `${filteredRows} von ${totalRows} item${totalRows > 1 ? 's' : ''}`;
    })
    isFiltered: Signal<boolean> = computed(() => {
        return  this.rowDataFilteredSorted().length < this.rowData().length
    })


    onSort(event: MouseEvent) {
        const field = (event.target as HTMLElement).dataset?.['field'];
        if (field) this.sort(field);
    }

    sort(field: string) {
        const {disableSort, initialSortOrder} = this.colDefsMap()[field];
        const {sortColumn, sortOrder} = this.state();
        if (disableSort) return;
        if (field === sortColumn) {
            this.state.update(
                val => ({...val, sortOrder: rotateSort[sortOrder] })
            );
        } else {
            this.state.update(
                val => ({...val, sortColumn: field, sortOrder: initialSortOrder || 'asc' })
            );
        }
    }

    onFilter(searchTerm: string) {
        this.state.update(
            val => ({...val, filter: searchTerm})
        )
    }

    onClearFilter() {
        this.state.update(val => ({...val, filter: ''}));
    }

    onSelected(obj: ObjAny) {
        this.selectedId.set(String(obj['id']) || '')
        this.selected.emit(obj);
    }

    formatValue(value: Primitive, format: string | ValueFormatter | undefined) {
        if (!format) return value;
        if (typeof format === 'function') return format(value);
        if (value == null) return '';
        const num = Number(value);
        switch (format) {
            case 'number0':
                return formatNumber(num, this.locale(), '1.0-0');
            case 'number2':
                return formatNumber(num, this.locale(), '1.2-2');
            case 'date':
                if (typeof value === 'boolean') return '';
                return formatDate(value, 'shortDate',this.locale());
            case 'chf':
                return formatCurrency(num, this.locale(), 'CHF', 'CHF', '1.2-2');
            case 'boolean':
                // rendered in html directly
            default:
                return value;
        }
    }

    getFlatRowData(rows: ObjAny[], colDefs: ColDef[]): ObjFlat[] {
        let rowsFlat: ObjFlat[] = [];
        for (let row of rows) {
            let obj: ObjFlat = {};
            for (let colDef of colDefs) {
                obj[colDef.field] = this.getFieldValue(row, colDef.field);
            }
            rowsFlat.push(obj)
        }
        return rowsFlat;
    }

    getFieldValue(row: ObjAny = {}, field: string = '') {
        if (field in row) return row[field];
        if (field.includes('.')) {
            return field.split('.').reduce((obj, prop) => {
                return obj && obj[prop] || undefined;
            }, row)
        }
        return undefined
    }


    protected readonly faCheck = faCheck;
    protected readonly faXmark = faXmark;
    protected readonly faChevronRight = faChevronRight;
    protected readonly faFilterCircleXmark = faFilterCircleXmark;
}


