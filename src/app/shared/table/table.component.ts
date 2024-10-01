import { DecimalPipe, NgClass} from '@angular/common';
import {Component, computed, input, model, Signal} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {quickFilter, sortArr} from "../util";

export type Obj = {[key: string]: string | number | boolean};

export interface ColDef {
    field: string;
    headerName: string;
    sortable?: boolean;
}

export interface TableState {
    filter: string;
    sortColumn: string;
    sortOrder: 'asc' | 'desc' | '';
}


@Component({
    selector: 'app-table',
    standalone: true,
    imports: [DecimalPipe, FormsModule, NgClass,],
    templateUrl: './table.component.html',
    styleUrl: './table.component.scss',
    providers: [DecimalPipe],
})
export class TableComponent {

    colDefs = input<ColDef[]>([]);
    rowData = input<Obj[]>([]);
    isLoading = input<boolean>(false);
    searchTerm = model<string>('');
    tableState = model<TableState>({filter: '', sortColumn: '', sortOrder: 'asc'});
    colDefsMap: Signal<{[field: string]: ColDef}> = computed(
        () => this.colDefs().reduce((map: {[field: string]: ColDef}, colDef: ColDef) => {
        map[colDef.field] = colDef;
        return map
    }, {}))
    rowDataFilteredSorted: Signal<Obj[]> = computed(
        () => {
            const {filter, sortColumn, sortOrder} = this.tableState();
            const filtered = quickFilter(this.rowData(), filter)
            return sortArr(filtered, sortColumn, sortOrder)
        }
    )



    constructor() {
    }

    rotate(current: '' | 'asc' | 'desc') {
        if (current === '') return 'asc';
        if (current === 'asc') return 'desc';
        return '';
    }

    onSort(e: MouseEvent) {
        const field = (e.target as HTMLElement).dataset['field'];
        if (!field || this.colDefsMap()['field'].sortable === false) return;
        if (field !== this.tableState().sortColumn) {
            this.tableState.update(
                val => ({...val, sortColumn: field, sortOrder: 'asc' })
            );
        } else {
            this.tableState.update(
                val => ({...val, sortOrder: this.rotate('asc') })
            );
        }



    }

}
