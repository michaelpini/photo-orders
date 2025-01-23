import {Component, effect, input, signal} from "@angular/core";

@Component({
    selector: 'picture-item',
    templateUrl: './picture-item.component.html',
    styleUrl: './picture-item.component.scss',
})
export class PictureItemComponent {
    name = input<string>('');
    baseUrl = input<string>('');
    fullName = input<string>('');
    xsUrl = signal<string>('');
    smUrl = signal<string>('');
    mdUrl = signal<string>('');
    lgUrl = signal<string>('');
    fullUrl = signal<string>('');

    constructor() {
        effect(() => {
            if (!this.baseUrl() || !this.fullName()) return;
            const arr =  this.fullName().split('.');
            const ext = arr.pop()!;
            const fileName = arr.join('.');
            const thumbnailsPathBase = this.baseUrl() + 'thumbnails%2F' + fileName;
            this.xsUrl.set(`${thumbnailsPathBase}_300x200.${ext}?alt=media`)
            this.smUrl.set(`${thumbnailsPathBase}_600x400.${ext}?alt=media`)
            this.mdUrl.set(`${thumbnailsPathBase}_1000x666.${ext}?alt=media`)
            this.lgUrl.set(`${thumbnailsPathBase}_2000x1333.${ext}?alt=media`)
            this.fullUrl.set(`${this.baseUrl()}/${this.fullName()}?alt=media`);
        })
    }

}
