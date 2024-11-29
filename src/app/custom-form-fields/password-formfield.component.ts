import {Component, input, model, signal} from "@angular/core";
import {faEye, faEyeSlash} from "@fortawesome/free-regular-svg-icons";
import {FaIconComponent} from "@fortawesome/angular-fontawesome";
import {NgClass} from "@angular/common";
import {
    AbstractControl,
    ControlValueAccessor,
    FormsModule, NG_VALIDATORS,
    NG_VALUE_ACCESSOR,
    ValidationErrors,
    Validator
} from "@angular/forms";

type Validated = {
    required?: boolean;
    minLengthNoSpace?: boolean,
    hasCapital?: boolean,
    hasChar?: boolean,
    hasNumber?: boolean
}

@Component({
    selector: "password-formfield",
    templateUrl: 'password-formfield.component.html',
    styleUrl: './password-formfield.component.scss',
    imports: [FaIconComponent, NgClass, FormsModule],
    providers: [
        { provide: NG_VALUE_ACCESSOR, multi: true, useExisting: PasswordFormFieldComponent },
        { provide: NG_VALIDATORS, multi: true, useExisting: PasswordFormFieldComponent },
    ]
})
export class PasswordFormFieldComponent implements ControlValueAccessor, Validator  {
    protected readonly faEyeSlash = faEyeSlash;
    protected readonly faEye = faEye;
    enableValidation = input<boolean | string>(false);
    required = input<boolean | string>(false);
    disabled = model(false);
    value = signal('');
    isPasswordHidden = signal(true);
    validated = signal<Validated>({});

    isTouched = false;
    isInvalid = false;

    onInput(ev: any) {
        const val = ev.target.value as string;
        this.value.set(val);
        this.onChange(val);
    }
    onBlur() {
        if (!this.isTouched) {
            this.isTouched = true;
            this.onTouched();
        }
    }

    // ControlValueAccessor implementation
    onChange = (value: string) => {}
    onTouched = () => {}
    registerOnChange(fn: any): void {
        this.onChange = fn;
    }
    registerOnTouched(fn: any): void {
        this.onTouched = fn;
    }
    setDisabledState(isDisabled: boolean): void {
        this.disabled.set(isDisabled);
    }
    writeValue(value?: string | null): void {
        this.value.set(value || '');
    }

    // Validation implementation
    validateMinLengthNoSpace(value: string): boolean {
        return /^(?!.* ).{10,100}$/.test(value)!;
    }
    validateHasCapital(value: string): boolean {
        return /^(?=.*[A-Z])/.test(value)!;
    }
    validateHasChar(value: string): boolean {
        return /^(?=.*[a-z])/.test(value)!;
    }
    validateHasNumber(value: string): boolean {
        return /^(?=.*[0-9])/.test(value)!;
    }

    validate(control: AbstractControl): ValidationErrors | null {
        const val: string = control.value;
        const validated: Validated = {};
        const errors: Validated = {}
        if (this.required() || this.required() === '') val ? validated.required = true : errors.required = false;
        if (this.enableValidation() || this.enableValidation() === '') {
            this.validateMinLengthNoSpace(val) ? validated.minLengthNoSpace = true : errors.minLengthNoSpace = false;
            this.validateHasCapital(val) ? validated.hasCapital = true : errors.hasCapital = false;
            this.validateHasChar(val) ? validated.hasChar = true : errors.hasChar = false;
            this.validateHasNumber(val) ? validated.hasNumber = true : errors.hasNumber = false;
        }
        this.validated.set(validated);
        this.isInvalid = (Object.keys(errors).length > 0);
        return this.isInvalid ? errors : null;
    }

}
