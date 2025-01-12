import {Component, computed, inject, signal} from '@angular/core';
import {BarChartModule, Color, ScaleType} from "@swimlane/ngx-charts";
import {Project, statusMapDe} from "../projects/project.model";
import {PhotoOrdersStore} from "../../store/photoOrdersStore";
import {FormsModule} from "@angular/forms";

type TimeRange = 'all' | 'currentYear' | 'lastYear' | 'last12Months';

@Component({
    selector: 'app-dashboard',
    imports: [
        BarChartModule,
        FormsModule,
    ],
    templateUrl: './dashboard.component.html',
    styleUrl: './dashboard.component.scss'
})
export class DashboardComponent {
    protected store = inject(PhotoOrdersStore);
    view = signal<[x: number, y: number]>([800, 400]);
    timeRangeSelection = signal<TimeRange>('all');

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
        } else if (selection === 'last12Months') {
            start = new Date();
            start.setFullYear(currentYear - 1);
        }
        return {start, end};
    })

    statusData = computed(() => {
        const projects = this.store.projectsEntities();
        const start = this.timeRange().start;
        const end = this.timeRange().end;
        const data: {[key: number | string]: {name: string, value: number, extra: {status: number | string, projects: Project[]}}} = {};
        for (let [status, name] of Object.entries(statusMapDe)) {
            data[status] = {
                name,
                value: 0,
                extra: {
                    status,
                    projects: []
                }
            }
        }

        projects.forEach(project => {
            const date = new Date(project.eventDate || '');
            const status = project.status || 0;
            if (date > start && date < end) {
                data[status].value += 1;
                data[status].extra.projects.push(project);
            }
        })

        const result = Object.values(data);
        console.log('timeRange:', this.timeRange(), 'result:', result);
        return result;
    })

    colorScheme = signal<Color>({
        name: 'custom',
        selectable: false,
        group: ScaleType.Ordinal,
        domain: ['#5AA454', '#A10A28', '#C7B42C', '#AAAAAA']
    });


    constructor() {
    }


    onTimeRangeChange(ev: Event) {
        const val = (ev.target as HTMLSelectElement).value as TimeRange;
        this.timeRangeSelection.set(val);
    }

    onSelect(ev: Event) {
        console.log(ev);
    }


}
