import {Component, effect, ElementRef, input, InputSignalWithTransform, ViewChild} from "@angular/core";

@Component({
    selector: "spinner",
    standalone: true,
    templateUrl: './spinner.component.html',
    styleUrl: 'spinner.component.scss',
})
export class SpinnerComponent {
    /**
     * Spinner component
     * @example
     * <spinner [open]="isBusy()"><spinner/>  // bind isBusy SIGNAL of parent component
     * <spinner open><spinner/>  // open attribute will always show spinner (to test)
     */
    constructor() {
        effect(() => {
            const dialog: HTMLDialogElement = this.dialogRef.nativeElement;
            if (this.open()) {
                dialog.showModal();
            } else {
                dialog.close();
            }
        });
    }

    @ViewChild('dialog') dialogRef!: ElementRef;

    /**
     * Input signal accepting a boolean value or string (converted to true if present)
     */
    open: InputSignalWithTransform<boolean, boolean|string> = input(false, {
        transform: (value: boolean|string): boolean => typeof value === 'boolean' ? value : true,
    });

    /**
     * Closes dialog forcefully when pressing the x button
     * Should not be used, unless open input trigger is frozen
     */
    forcedClose() {
        const dialog: HTMLDialogElement = this.dialogRef.nativeElement;
        dialog.close();
    }
}
