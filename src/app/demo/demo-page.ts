import { Component, signal } from '@angular/core';
import { email, form, FormField, max, min, required } from '@angular/forms/signals';
import { Avatar } from '../shared/avatar/avatar';
import { AvatarGroup, AvatarPerson } from '../shared/avatar/avatar-group';
import { Badge } from '../shared/badge/badge';
import { Button, ButtonVariant } from '../shared/button/button';
import { DateField } from '../shared/date-field/date-field';
import { NumberField } from '../shared/number-field/number-field';
import { SelectField, SelectOption } from '../shared/select/select';
import { TextareaField } from '../shared/textarea/textarea';
import { TextField } from '../shared/text-field/text-field';
import { TimeField } from '../shared/time-field/time-field';
import { ButtonLink } from '../shared/button-link/button-link';
import { Icon } from '../shared/icon/icon';
import { Progress } from '../shared/progress/progress';
import { Skeleton } from '../shared/skeleton/skeleton';
import { SkeletonList, SkeletonListVariant } from '../shared/skeleton/skeleton-list';
import { Spinner } from '../shared/spinner/spinner';
import { Category, Size, Tone } from '../shared/types/ui';
import { fieldError } from '../shared/validation/field-error';
import { dniNie, phone } from '../shared/validation/validators';

interface DemoModel {
  name: string;
  mail: string;
  phone: string;
  dni: string;
  notes: string;
  calendar: string;
  date: string;
  time: string;
  guests: number | null;
}

const SIZES: Size[] = ['s', 'm', 'l', 'xl'];
const BUTTON_VARIANTS: ButtonVariant[] = [
  'primary',
  'accent',
  'secondary',
  'ghost',
  'ghost-danger',
  'danger',
];
const BADGE_TONES: Exclude<Tone, 'accent'>[] = [
  'neutral',
  'brand',
  'success',
  'warning',
  'danger',
  'info',
  'inverse',
  'glass',
  'count',
];
const CATEGORIES: Category[] = ['orange', 'violet', 'red', 'blue', 'green', 'mustard', 'cyan'];
const PEOPLE: AvatarPerson[] = [
  { name: 'Lucía Martín' },
  { name: 'Javier Ruiz' },
  { name: 'Marta Gómez' },
  { name: 'Pablo Sanz' },
  { name: 'Elena Torres' },
];
const SECTIONS = [
  { id: 'icon', name: 'Icon' },
  { id: 'spinner', name: 'Spinner' },
  { id: 'badge', name: 'Badge' },
  { id: 'avatar', name: 'Avatar' },
  { id: 'progress', name: 'Progress' },
  { id: 'skeleton', name: 'Skeleton' },
  { id: 'button', name: 'Button' },
  { id: 'button-link', name: 'ButtonLink' },
  { id: 'text-field', name: 'TextField' },
  { id: 'textarea-field', name: 'TextareaField' },
  { id: 'select-field', name: 'SelectField' },
  { id: 'date-field', name: 'DateField' },
  { id: 'time-field', name: 'TimeField' },
  { id: 'number-field', name: 'NumberField' },
];
const CALENDARS: SelectOption[] = [
  { value: 'personal', label: 'Personal' },
  { value: 'trabajo', label: 'Trabajo' },
  { value: 'familia', label: 'Familia' },
];

@Component({
  selector: 'app-demo-page',
  imports: [
    Icon,
    Spinner,
    Badge,
    Avatar,
    AvatarGroup,
    Progress,
    Skeleton,
    SkeletonList,
    Button,
    ButtonLink,
    TextField,
    TextareaField,
    SelectField,
    DateField,
    TimeField,
    NumberField,
    FormField,
  ],
  templateUrl: './demo-page.html',
  styleUrl: './demo-page.css',
})
export class DemoPage {
  protected readonly sections = SECTIONS;
  protected readonly sizes = SIZES;
  protected readonly spinnerSizes = SIZES.filter((s) => s !== 'xl') as Exclude<Size, 'xl'>[];
  protected readonly buttonVariants = BUTTON_VARIANTS;
  protected readonly badgeTones = BADGE_TONES;
  protected readonly categories = CATEGORIES;
  protected readonly people = PEOPLE;
  protected readonly progressTones = ['brand', 'success', 'accent'] as const;
  protected readonly skeletonVariants: SkeletonListVariant[] = ['agenda', 'task', 'card'];
  protected readonly calendars = CALENDARS;

  readonly model = signal<DemoModel>({
    name: '',
    mail: '',
    phone: '',
    dni: '',
    notes: '',
    calendar: '',
    date: '',
    time: '',
    guests: null,
  });
  readonly demoForm = form(this.model, (path) => {
    required(path.name);
    required(path.mail);
    email(path.mail);
    required(path.phone);
    phone(path.phone);
    required(path.dni);
    dniNie(path.dni);
    required(path.notes);
    required(path.calendar);
    required(path.date);
    required(path.time);
    required(path.guests);
    min(path.guests, 1);
    max(path.guests, 20);
  });
  protected readonly fieldError = fieldError;
}
