import {Component, effect, inject, input, output, signal, ViewChild} from '@angular/core';
import {FormsModule, NgForm} from "@angular/forms";
import {NgClass} from "@angular/common";
import {ProjectInfo, statusMapDe} from "../project.model";
import {Subscription} from "rxjs";
import {PhotoOrdersStore} from "../../../store/photoOrdersStore";

@Component({
    selector: 'project-detail-info',
    imports: [FormsModule, NgClass],
    templateUrl: './project-detail-info.component.html',
    styleUrl: './project-detail-info.component.scss'
})
export class ProjectDetailInfoComponent {
    private valueChangesSubscription: Subscription | undefined;
    private formInitializing = false;
    protected store = inject(PhotoOrdersStore);

    @ViewChild('form', {static: true}) form: NgForm | undefined;

    dataInput = input<ProjectInfo | null>(null);
    data = signal<ProjectInfo | null>(null);
    dataOutput = output<ProjectInfo>();

    constructor(){
        effect(async () => {
            if (this.dataInput()) {
                setTimeout(() => this.setFormData(this.dataInput()));
            }
        });
    }

    setFormData(projectInfo: ProjectInfo | null) {
        this.formInitializing = true;
        this.data.set(projectInfo);
        this.form!.resetForm(projectInfo);
        this.formInitializing = false;
    }

    ngOnInit(): void {
        this.formInitializing = true;
        this.valueChangesSubscription = this.form!.valueChanges?.
        subscribe((value) => {
            if (this.formInitializing || this.data() == null) return;
            this.data.update(currentVal => ({...currentVal, ...value}));
            this.dataOutput.emit(this.data() as ProjectInfo);
        })
        this.formInitializing = false;
    }

    ngOnDestroy(): void {
        this.valueChangesSubscription?.unsubscribe();
    }


    protected readonly statusMapDe = statusMapDe;
    protected readonly Object = Object;
}
