import {Component, computed, inject, OnDestroy, OnInit, signal} from '@angular/core';
import {ColDef, TableComponent, TableState} from "../../../shared/table/table.component";
import {patchState} from "@ngrx/signals";
import {PhotoOrdersStore} from "../../../store/photoOrdersStore";
import {tableState as storedTableState} from "../../../store/tableState";
import {NavigationEnd, Router} from "@angular/router";
import {ProjectStatus, statusMapDe} from "../project.model";
import {ObjAny} from "../../../shared/util";

@Component({
    selector: 'project-list',
    imports: [TableComponent],
    templateUrl: './project-list.component.html',
    styleUrl: './project-list.component.scss'
})
export class ProjectListComponent implements OnInit, OnDestroy{
    readonly store = inject(PhotoOrdersStore);
    readonly tableState = signal<TableState>({filter: '', sortColumn: '', sortOrder: ''});

    selectedId = signal('');

    colDefs: ColDef[] = [
        {field: 'projectName', headerName: 'Projektname', width: '25%'},
        {field: 'eventDate', headerName: 'Datum', format: 'date', width: '25%'},
        {field: '_companyOrCustomer', headerName: 'Kunde', width: 'auto'},
        // {field: 'quote.totalCHF', headerName: 'Offerte CHF', width: '25%', format: 'chf'},
        {field: 'status', headerName: 'Status', format: val => this.getStatus(val as ProjectStatus), excludeFromQuickFilter: true},
        {field: 'id', headerName: 'Id', hidden: true},
    ]

    constructor(private router: Router) {}

    data = computed(() => {
        return this.store.projectsEntities().map(project => {
            const user = this.store.getUser(project.userId);
            const _companyOrCustomer = user?.isCompany ? user?.companyName || 'Company?' : `${user?.firstName || ''} ${user?.lastName || ''}`;
            return {...project, _companyOrCustomer};
        })
    })

    checkUrlAndSetProjectId(url: string) {
        const segments = url.split('/');
        const lastSegment = segments[segments.length - 1];
        const id = lastSegment === 'projects' ?  '' : lastSegment;
        this.selectedId.set(id);
    }

    getStatus(status: ProjectStatus) {
        return statusMapDe[status] || '?: ' + status;
    }

    ngOnInit() {
        this.tableState.set(storedTableState().users);
        this.checkUrlAndSetProjectId(this.router.url);
        this.router.events.subscribe((event: any) => {
            if (event instanceof NavigationEnd) this.checkUrlAndSetProjectId(event.url);
        })
    }

    ngOnDestroy(): void {
        patchState(storedTableState, old => ({...old, projects: this.tableState()}));

    }
    
    onSelect(obj: ObjAny) {
        const id = obj['id'];
        this.router.navigate([`/projects/${id}`]);
    }
}
