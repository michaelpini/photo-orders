import {Component, computed, effect, inject, input, output, signal, ViewChild} from '@angular/core';
import {FormsModule, NgForm} from "@angular/forms";
import {Subscription} from "rxjs";
import {ProjectInvoice, ProjectQuote} from "../project.model";
import {PhotoOrdersStore} from "../../../store/photoOrdersStore";

@Component({
    selector: 'project-detail-cost',
    imports: [FormsModule],
    templateUrl: './project-detail-cost.component.html',
    styleUrl: './project-detail-cost.component.scss'
})
export class ProjectDetailCostComponent {
    private valueChangesSubscription: Subscription | undefined;
    private formInitializing = false;
    protected store = inject(PhotoOrdersStore);

    @ViewChild('form', {static: true}) form: NgForm | undefined;
    quoteOrInvoice = input<'quote' | 'invoice'>('quote');

    dataInput = input<ProjectQuote | ProjectInvoice | null>(null);
    data = signal<ProjectQuote | ProjectInvoice | null>({});
    dataOutput = output<ProjectQuote | ProjectInvoice>();
    docx = output<'quote' | 'invoice'>();
    attach = output<'quote' | 'invoice'>();
    downloadPDF = output<'quote' | 'invoice'>();

    constructor() {
        effect(async () => {
            if (this.dataInput()) {
                setTimeout(() => this.setFormData(this.dataInput()));
            }
        });
    }

    setFormData(projectInfo: ProjectQuote | ProjectInvoice | null) {
        this.formInitializing = true;
        this.data.set(projectInfo);
        this.form!.resetForm(projectInfo);
        this.formInitializing = false;
    }

    getTotalHours(data: ProjectQuote | ProjectInvoice | null): number {
        if (data == null) return 0;
        const preparationHours = data.preparationHours || 0;
        const travelHours = data.travelHours || 0;
        const photoShootingHours = data.photoShootingHours || 0;
        const postProductionHours = data.postProductionHours || 0;
        return preparationHours + travelHours + photoShootingHours + postProductionHours;
    }

    getCost(hours: number, rate: number) {
        return
    }

    ngOnInit(): void {
        this.formInitializing = true;
        this.valueChangesSubscription = this.form!.valueChanges?.subscribe((value: ProjectQuote | ProjectInvoice) => {
            if (this.formInitializing || this.data() == null) return;
            this.data.update(currentVal => {
                const totalHours = this.getTotalHours(value);
                const totalCHF = totalHours * (value.hourlyRateCHF || 0);
                return {...currentVal, ...value, totalHours, totalCHF};
            });
            this.dataOutput.emit(this.data() as ProjectQuote | ProjectInvoice);
        })
        this.formInitializing = false;
    }

    ngOnDestroy(): void {
        this.valueChangesSubscription?.unsubscribe();
    }

    onDocx() {
        this.docx.emit(this.quoteOrInvoice());
    }

    onAttachPDF() {
        this.attach.emit(this.quoteOrInvoice());
    }

    onDownloadPDF() {
        this.downloadPDF.emit(this.quoteOrInvoice());
    }


}
