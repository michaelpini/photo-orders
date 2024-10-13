import {inject, Pipe, PipeTransform} from '@angular/core';
import {DomSanitizer, SafeHtml} from "@angular/platform-browser";


@Pipe({
    name: 'safeHtml',
    standalone: true,
})
/**
 * CAUTION: Disables security for HTML parsing - do not use with user generated data
 */
export class SafeHtmlPipe implements PipeTransform {
    sanitizer = inject(DomSanitizer);
    transform(value: string): SafeHtml {
        return this.sanitizer.bypassSecurityTrustHtml(value);
    }
}

