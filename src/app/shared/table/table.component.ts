import {formatCurrency, formatDate, formatNumber, NgClass,} from '@angular/common';
import {Component, computed, input, model, output, Signal} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {getRandomId, Primitive, quickFilter, sortArr} from "../util";
import {FaIconComponent} from "@fortawesome/angular-fontawesome";
import {faCheck, faChevronRight, faXmark} from "@fortawesome/free-solid-svg-icons";

export type Obj = {[key: string]: Primitive};
export type SortOrder = 'asc' | 'desc' | '';
export type ValueFormatter = ((value: Primitive) => string);
export interface ColDef {
    field: string;
    headerName: string;
    disableSort?: boolean;
    initialSortOrder?: SortOrder;
    format?: string | ValueFormatter;
    width?: string;
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
    standalone: true,
    imports: [FormsModule, NgClass, FaIconComponent,],
    templateUrl: './table.component.html',
    styleUrl: './table.component.scss',

})
export class TableComponent {
    tableId = '';
    colDefs = input<ColDef[]>([]);
    rowData = input<Obj[]>([]);
    hideFilter = input(false, {transform: (val: string | boolean) => typeof val === 'boolean' ? val : true});
    showChevron = input(false, {transform: (val: string | boolean) => typeof val === 'boolean' ? val : true});
    locale = input('de-CH');

    selected = output<Obj>();

    state = model<TableState>(getTableState('', '', ''));

    colDefsMap: Signal<{[field: string]: ColDef}> = computed(() => {
        return this.colDefs().reduce((acc: {[field: string]: ColDef}, val: ColDef) => {
            acc[val.field] = val;
            return acc;
        }, {})
    })

    rowDataFilteredSorted: Signal<Obj[]> = computed(() => {
        const {filter, sortColumn, sortOrder} = this.state();
        const filtered = quickFilter(this.rowData(), filter)
        return sortArr(filtered, sortColumn, sortOrder)
    })

    countInfo: Signal<string> = computed(() => {
        const totalRows = this.rowData().length;
        const filteredRows = this.rowDataFilteredSorted().length;
        if (!totalRows) return '';
        if (totalRows === filteredRows) return `${totalRows} item${totalRows > 1 ? 's' : ''}`;
        return `${filteredRows} of ${totalRows} item${totalRows > 1 ? 's' : ''}`;
    })

    isFiltered: Signal<boolean> = computed(() => {
        return  this.rowDataFilteredSorted().length < this.rowData().length
    })

    constructor() {
        this.tableId = getRandomId();
    }

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

    onSelected(obj: Obj) {
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


    protected readonly faCheck = faCheck;
    protected readonly faXmark = faXmark;
    protected readonly faChevronRight = faChevronRight;
}


