import {inject, Injectable} from "@angular/core";
import Docxtemplater from "docxtemplater";
import PizZip from "pizzip";
import {saveBlobToFile, transformDateTime} from "./util";
import {Project, ProjectInvoice, ProjectQuote} from "../components/projects/project.model";
import {PhotoOrdersStore} from "../store/photoOrdersStore";
import {FirebaseService} from "../persistance/firebase.service";

interface DocxData {
    issuedDate: string;
    customerName: string;
    streetAndNumber: string;
    plzAndPlace: string;
    country: string;
    referenceNumber: string;
    projectName: string;
    firstName: string;
    lastName: string;
    description: string;
    eventDate: string;
    eventLocation: string;
    equipment: string;
    numberOfPhotos: string;
    resolutionAndType: string;
    editingOptions: string;
    deadline: string;
    remarks: string;
    prepH: string;
    prepCHF: string;
    travelH: string;
    travelCHF: string;
    shootingH: string;
    shootingCHF: string;
    postH: string;
    postCHF: string;
    totalH: string;
    totalCHF: string;
    remarksCost: string;
}


@Injectable({providedIn: 'root'})
export class DocxTemplaterService {
    protected store = inject(PhotoOrdersStore);
    protected firebaseService = inject(FirebaseService);

    async getTemplate(url: string) {
        const response = await fetch(url);
        return await response.arrayBuffer();
    }

    async generateDocx(template: string | ArrayBuffer | Blob, data: object, filename = 'output.docx'): Promise<Blob> {
        let content: ArrayBuffer;
        if (template instanceof ArrayBuffer) {
            content = template;
        } else if (template instanceof Blob) {
            content = await template.arrayBuffer();
        } else {
            content = await this.getTemplate(template)
        }

        const zip = new PizZip(content);
        const doc = new Docxtemplater(zip, {
            paragraphLoop: true,
            linebreaks: true,
        });
        doc.render(data);
        const out = doc.getZip().generate({
            type: "blob",
            mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        });
        saveBlobToFile(out, filename);
        return out;
    }

    async generateQuote(project: Project) {
        const template = await this.firebaseService.downloadFile('/documents/template-offerte.docx', false);
        const data = this.constructDocxData(project, 'quote');
        const filename = `Offerte ${data.referenceNumber}.docx`;
        await this.generateDocx(template, data, filename);
    }

    async generateInvoice(project: Project) {
        const template = await this.firebaseService.downloadFile('/documents/template-rechnung.docx', false);
        const data = this.constructDocxData(project, 'invoice');
        const filename = `Rechnung ${data.referenceNumber}.docx`;
        await this.generateDocx(template, data, filename);
    }

    private constructDocxData(project: Project, type: 'quote' | 'invoice') {
        const {quote, invoice, ...details} = project;
        const cost: ProjectQuote | ProjectInvoice = (type === 'quote') ? quote! : invoice!;
        const rate = cost.hourlyRateCHF || 0;
        const user = this.store.getUser(details.userId)!;
        let data: Partial<DocxData> = {};
        data.issuedDate = transformDateTime(cost.issueDate, 'dmy', '');
        data.customerName = user.isCompany ? user.companyName || '' : user.firstName + ' ' + user.lastName;
        data.streetAndNumber = user.streetAndNumber || '';
        data.plzAndPlace = `${user.country ? user.country + '-' : ''}${user.plz || ''} ${user.place || ''}`  ;
        data.country = user.country || '';
        data.referenceNumber = `${user.customerNumber}.${transformDateTime(cost.issueDate, 'dmy', '')}`;
        data.projectName = details.projectName || '';
        data.firstName = user.firstName || '';
        data.lastName = user.lastName || '';
        data.description = details.description || '';
        data.eventDate = transformDateTime(details.eventDate, 'dmy', 'hm');
        data.eventLocation = details.eventLocation || '';
        data.equipment = details.equipment || '';
        data.numberOfPhotos = details.numberOfPhotos?.toString() || '';
        data.resolutionAndType = details.resolutionAndType || '';
        data.editingOptions = details.editingOptions || '';
        data.deadline = transformDateTime(details.deadline);
        data.remarks = details.remarks || '';
        data.prepH = cost.preparationHours?.toPrecision(1) || '';
        data.prepCHF = __calcCost(cost.preparationHours);
        data.travelH = cost.travelHours?.toPrecision(1) || '';
        data.travelCHF = __calcCost(cost.travelHours);
        data.shootingH = cost.photoShootingHours?.toPrecision(1) || '';
        data.shootingCHF = __calcCost(cost.photoShootingHours);
        data.postH = cost.postProductionHours?.toPrecision(1) || '';
        data.postCHF = __calcCost(cost.postProductionHours);
        data.totalH = cost.totalHours?.toPrecision(1) || '';
        data.totalCHF = __calcCost(cost.totalHours);
        data.remarksCost = cost.remarks;
        return data;

        function __calcCost(hours?: number) {
            if (!rate || !hours) return '';
            return `${(rate * hours).toFixed(2)} CHF`;
        }
    }
}
