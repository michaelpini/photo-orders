import {Component, computed, inject, model, signal, ViewEncapsulation} from '@angular/core';
import {BarChartModule, Color, PieChartModule, ScaleType} from "@swimlane/ngx-charts";
import {Project, ProjectStatus, statusMapDe} from "../projects/project.model";
import {PhotoOrdersStore} from "../../store/photoOrdersStore";
import {FormsModule} from "@angular/forms";
import {formatCurrency, formatNumber} from "@angular/common";
import {ColDef, TableComponent} from "../../shared/table/table.component";
import {ObjAny, safeAwait} from "../../shared/util";
import {ModalService} from "../../modals/modal.service";
import {Router} from "@angular/router";

type TimeRange = 'all' | 'currentYear' | 'lastYear' | 'currentAndLastYear';
type ChartData = {
    name: string;
    value: number | string;
    extra: {
        type: 'status' | 'financial';
        projects: Project[];
    }
}

@Component({
    selector: 'app-dashboard',
    imports: [
        BarChartModule,
        FormsModule,
        PieChartModule,
        TableComponent,
    ],
    templateUrl: './dashboard.component.html',
    styleUrl: './dashboard.component.scss',
    encapsulation: ViewEncapsulation.None
})
export class DashboardComponent {
    protected store = inject(PhotoOrdersStore);
    timeRangeSelection = signal<TimeRange>('all');
    tableHeading = signal<string>('Alle Projekte');
    tableData = signal<Project[]>([]);
    colDefs = signal<ColDef[]>([
        {field: 'projectName', headerName: 'Projektname', width: '20%'},
        {field: 'eventDate', headerName: 'Datum', format: 'date', width: 'auto'},
        {field: '_customer', headerName: 'Kunde', width: '20%'},
        {field: 'quote.totalCHF', headerName: 'Offerte CHF', width: 'auto', format: 'chf'},
        {field: 'invoice.totalCHF', headerName: 'Rechnung CHF', width: 'auto', format: 'chf'},
        {field: 'status', headerName: 'Status', format: val => this.getStatus(val as ProjectStatus), excludeFromQuickFilter: true},
        {field: 'id', headerName: 'Id', hidden: true},
    ] )
    selectedProjectId = signal<string>('');
    colorSchemeStatus = signal<Color>({
        name: 'custom',
        selectable: false,
        group: ScaleType.Ordinal,
        domain: ['#5AA454', '#A10A28', '#C7B42C', '#AAAAAA']
    });

    timeRange = computed<{start: Date, end: Date}>(() => {
        const selection = this.timeRangeSelection();
        const currentYear = new Date().getFullYear();
        let start = new Date(0);
        let end = new Date(currentYear, 11, 31, 23, 59, 59);
        if (selection === 'currentYear') {
            start = new Date(currentYear, 0, 1);
        } else if (selection === 'lastYear') {
            start = new Date(currentYear - 1, 0, 1);
            end = new Date(currentYear - 1, 11, 31, 23, 59, 59);
        } else if (selection === 'currentAndLastYear') {
            start = new Date(currentYear - 1, 0, 1);
        }
        return {start, end};
    })
    projectsInTimeRange = computed<Project[]>(() => {
        const projects = this.builtTableData(this.store.projectsEntities());
        const start = this.timeRange().start;
        const end = this.timeRange().end;
        setTimeout(() => this.onShowAll(), 200 );
        return projects.reduce((acc, project) => {
            const date = new Date(project.eventDate || '');
            if (date >= start && date <= end) {
                acc.push(project);
            }
            return acc;
        }, [] as Project[]);
    })
    statusData = computed(() => {
        const projects = this.projectsInTimeRange();
        const data: {[key: number | string]: ChartData} = {};
        for (let [status, name] of Object.entries(statusMapDe)) {
            data[status] = {
                name,
                value: '',
                extra: {
                    type: 'status',
                    projects: []
                }
            }
        }
        projects.forEach(project => {
            const status = project.status || ProjectStatus.draft;
            data[status].value = typeof data[status].value === 'number' ? (data[status].value) + 1 : 1;
            data[status].extra.projects.push(project);
        })
        return Object.values(data);
    })
    financialData = computed(() => {
        const projects = this.projectsInTimeRange();
        let data: {[key: number | string]: ChartData} = {
            backlog: {
                name: 'Laufende Aufträge',
                value: 0,
                extra: {
                    type: 'financial',
                    projects: []
                }
            },
            billed: {
                name: 'Offene Rechnungen',
                value: 0,
                extra: {
                    type: 'financial',
                    projects: []
                }
            },
            paid: {
                name: 'Bezahlte Rechnungen',
                value: 0,
                extra: {
                    type: 'financial',
                    projects: []
                }
            }
        };

        projects.forEach(project => {
            const status = Number(project.status || ProjectStatus.draft);
            switch (status) {
                case ProjectStatus["po received"]:
                case ProjectStatus["photo selection"]:
                case ProjectStatus["post processing"]:
                    const quotedCHF = project.quote?.totalCHF || 0;
                    data['backlog'].value = +data['backlog'].value + quotedCHF;
                    data['backlog'].extra.projects.push(project);
                    break;
                case ProjectStatus.billing:
                    const billedCHF = project.quote?.totalCHF || 0;
                    data['billed'].value = +data['billed'].value + billedCHF ;
                    data['billed'].extra.projects.push(project);
                    break;
                case ProjectStatus.paid:
                    const paidCHF = project.quote?.totalCHF || 0;
                    data['paid'].value = +data['paid'].value + paidCHF ;
                    data['paid'].extra.projects.push(project);
                    break;
                }
        })
        return Object.values(data);
    })

    constructor(private modalService: ModalService, private router: Router) {
    }

    builtTableData(projects: Project[]) {
        return projects.map(project => {
            const user = this.store.getUser(project.userId);
            const _customer = user ? user.companyName || `${user.firstName} ${user.lastName}` : project.userId;
            return {...project, _customer};
        })
    }

    roundToInteger(num: number) {
        return Math.round(num);
    }

    formatCHF(num: number) {
        return formatCurrency(num, 'de-CH', 'CHF', 'CHF', '1.0-0');
    }

    formatPercent(num: number) {
        return formatNumber(num, 'de-CH', '1.0-1')
    }

    getStatus(status: ProjectStatus) {
        return statusMapDe[status] || '?: ' + status;
    }

    onSelectChartItem(ev: ChartData) {
        const str= ev.extra.type === 'status' ? `Status «${ev.name}»` : `${ev.name}`;
        this.tableHeading.set(str);
        this.tableData.set(ev.extra.projects)
    }

    onShowAll() {
        this.tableHeading.set('Alle Projekte');
        this.tableData.set(this.projectsInTimeRange());
    }

    async onSelectProject(project: ObjAny) {
        const [error, proceed] = await safeAwait(this.modalService.confirm({message: 'Das entsprechende Projekt öffnen?' ,btnOkText: 'Zum Projekt', title: 'Projekt öffnen?'}))
        if (proceed) {
            await this.router.navigate(['/projects', project?.['id']]);
        } else {
            this.selectedProjectId.set('');
        }
    }

}

