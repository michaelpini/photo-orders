import {Component, inject, OnDestroy, OnInit, signal} from '@angular/core';
import {ColDef, TableComponent, TableState} from "../../../shared/table/table.component";
import {patchState} from "@ngrx/signals";
import {PhotoOrdersStore} from "../../../store/photoOrdersStore";
import {tableState as storedTableState} from "../../../store/tableState";
import {NavigationEnd, Router} from "@angular/router";
import {ObjAny} from "../../../shared/util";

@Component({
    selector: 'customer-list',
    standalone: true,
    imports: [ TableComponent ],
    templateUrl: './customer-list.component.html',
    styleUrl: './customer-list.component.scss'
})
export class CustomerListComponent implements OnInit, OnDestroy{
    readonly store = inject(PhotoOrdersStore);
    readonly tableState = signal<TableState>({filter: '', sortColumn: '', sortOrder: ''});

    selectedId = signal('');

    colDefs: ColDef[] = [
        {field: 'firstName', headerName: 'Vorname', width: '25%'},
        {field: 'lastName', headerName: 'Nachname', width: '25%'},
        {field: 'email', headerName: 'Email', width: '25%'},
        {field: 'phone', headerName: 'Tel.', disableSort: true, excludeFromQuickFilter: true},
        {field: 'id', headerName: 'Id', hidden: true},
    ]

    constructor(private router: Router) {}

    checkUrlAndSetUserId(url: string) {
        const segments = url.split('/');
        const lastSegment = segments[segments.length - 1];
        const id = lastSegment === 'customers' ?  '' : lastSegment;
        this.selectedId.set(id);
    }

    ngOnInit() {
        this.tableState.set(storedTableState().users);
        this.checkUrlAndSetUserId(this.router.url);
        this.router.events.subscribe((event: any) => {
            if (event instanceof NavigationEnd) this.checkUrlAndSetUserId(event.url);
        })
    }

    ngOnDestroy(): void {
        patchState(storedTableState, old => ({...old, users: this.tableState()}))
    }
    
    onSelect(obj: ObjAny) {
        const id = obj['id'];
        this.router.navigate([`/customers/${id}`]);
    }
}
