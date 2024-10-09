import {Component, inject, OnDestroy, OnInit, signal} from '@angular/core';
import {ColDef, Obj, TableComponent, TableState} from "../../shared/table/table.component";
import {patchState} from "@ngrx/signals";
import {PhotoStore} from "../../store/photoStore";
import {tableState} from "../../store/tableState";
import {Router} from "@angular/router";

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
        {field: 'firstName', headerName: 'Vorname', width: '25%'},
        {field: 'lastName', headerName: 'Nachname', width: '25%'},
        {field: 'email', headerName: 'Email', width: '25%'},
        {field: 'phone', headerName: 'Tel.', disableSort: true, excludeFromQuickFilter: true},
        {field: 'id', headerName: 'Id', hidden: true},
    ]

    constructor(private router: Router) {}

    ngOnInit() {
        this.tableState.set(tableState.users());
    }
    ngOnDestroy(): void {
        patchState(tableState, old => ({...old, users: this.tableState()}))
    }
    onSelect(obj: Obj) {
        const id = obj['id'];
        this.router.navigate([`/customers/${id}`]);
    }
}
