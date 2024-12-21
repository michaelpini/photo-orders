import {Component, effect, input, signal} from "@angular/core";

@Component({
    selector: 'picture-item',
    templateUrl: './picture-item.component.html',
    styles: `
        :host {
            position: relative;
            container-type: inline-size;
        }
        .img {
            width: 100%;
            height: auto;
        }
        .name {
            position: absolute;
            width: 100%;
            bottom: 0;
            font-size: 1rem;
            font-weight: lighter;
            text-align: center;
            text-shadow: 1px 1px 4px black;
            color: #e3e3e3b8;
            background: linear-gradient(0deg, rgba(0, 0, 0, 0.7019607843), rgb(0 0 0 / 0%));
            height: 3rem;
            padding-top: 1.3rem;        
        }
        @container (min-width: 230px) {
            .name { font-size: 1.6rem; height: 4rem; padding-top: 1.4rem; }
        }
        @container (min-width: 290px) {
            .name { font-size: 2rem; height: 5rem; padding-top: 1.7rem;}
        }
        @container (min-width: 320px) {
            .name { font-size: 2.2rem; height: 5rem; padding-top: 1.4rem;}
        }
        @container (min-width: 400px) {
            .name { font-size: 2.7rem; height: 6rem; padding-top: 1.7rem;}
        }
    `,
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
