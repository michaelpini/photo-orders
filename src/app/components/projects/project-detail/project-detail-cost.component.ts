import {Component, effect, input, output, signal, ViewChild} from '@angular/core';
import {FormsModule, NgForm} from "@angular/forms";
import {Subscription} from "rxjs";
import {ProjectInvoice, ProjectQuote} from "../project.model";

@Component({
  selector: 'project-detail-cost',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './project-detail-cost.component.html',
  styleUrl: './project-detail-cost.component.scss'
})
export class ProjectDetailCostComponent {
  private valueChangesSubscription: Subscription | undefined;
  private formInitializing = false;

  @ViewChild('form', {static: true}) form: NgForm | undefined;

  dataInput = input<ProjectQuote | ProjectInvoice | null>(null);
  data = signal<ProjectQuote | ProjectInvoice | null>(null);
  dataOutput = output<ProjectQuote | ProjectInvoice>();

  constructor(){
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

  ngOnInit(): void {
    this.formInitializing = true;
    this.valueChangesSubscription = this.form!.valueChanges?.
    subscribe((value) => {
      if (this.formInitializing || this.data() == null) return;
      this.data.update(currentVal => ({...currentVal, ...value}));
      this.dataOutput.emit(this.data() as ProjectQuote | ProjectInvoice);
    })
    this.formInitializing = false;
  }

  ngOnDestroy(): void {
    this.valueChangesSubscription?.unsubscribe();
  }

}
