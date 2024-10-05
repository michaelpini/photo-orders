import {Component, inject, OnDestroy, OnInit, signal} from '@angular/core';
import {ColDef, TableComponent, TableState} from "../../shared/table/table.component";
import {patchState} from "@ngrx/signals";
import {PhotoStore} from "../../store/photoStore";
import {tableState} from "../../store/tableState";

@Component({
    selector: 'customer-list',
    standalone: true,
    imports: [ TableComponent ],
    templateUrl: './customer-list.component.html',
    styleUrl: './customer-list.component.scss'
})
export class CustomerListComponent implements OnInit, OnDestroy{
    readonly store = inject(PhotoStore);
    readonly tableState = signal<TableState>({filter: '', sortColumn: '', sortOrder: ''});

    colDefs: ColDef[] = [
        {field: 'firstName', headerName: 'First Name', width: '25%'},
        {field: 'lastName', headerName: 'Last Name', width: '25%'},
        {field: 'phone', headerName: 'Phone', disableSort: true},
        {field: 'auth', headerName: 'Auth', width: '15%'},
        {field: 'amount', headerName: 'Amount', format: 'number2'},
    ]

    ngOnInit() {
        this.tableState.set(tableState.users());
    }
    ngOnDestroy(): void {
        patchState(tableState, old => ({...old, users: this.tableState()}))
    }
}
