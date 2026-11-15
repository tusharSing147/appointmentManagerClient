import { useRef, useState } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import { APPOINTMENT_STATUSES } from '../types';
import type { Appointment, AppointmentInput, AppointmentStatus, FieldErrors } from '../types';

const EMPTY: AppointmentInput = {
  customerName: '',
  service: '',
  dateTime: '',
  status: 'Pending',
};

const SERVICE_SUGGESTIONS = [
  'Consultation',
  'Follow-up',
  'Review',
  'Assessment',
  'Treatment',
];

const FIELD_ORDER = ['customerName', 'service', 'dateTime'] as const;
type TextField = (typeof FIELD_ORDER)[number];

function validate(values: AppointmentInput): FieldErrors {
  const errors: FieldErrors = {};
  const customerName = values.customerName.trim();
  const service = values.service.trim();

  if (!customerName) {
    errors.customerName = 'Enter the customer name.';
  } else if (customerName.length < 2) {
    errors.customerName = 'Use at least 2 characters.';
  } else if (customerName.length > 80) {
    errors.customerName = 'Use 80 characters or fewer.';
  }

  if (!service) {
    errors.service = 'Enter the service.';
  } else if (service.length < 2) {
    errors.service = 'Use at least 2 characters.';
  } else if (service.length > 80) {
    errors.service = 'Use 80 characters or fewer.';
  }

  if (!values.dateTime) {
    errors.dateTime = 'Choose a date and time.';
  }

  if (!values.status) {
    errors.status = 'Choose a status.';
  }

  return errors;
}

interface AppointmentFormProps {
  onCreate: (values: AppointmentInput) => Promise<Appointment>;
}

export function AppointmentForm({ onCreate }: AppointmentFormProps) {
  const [values, setValues] = useState<AppointmentInput>(EMPTY);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [formMessage, setFormMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const nameRef = useRef<HTMLInputElement>(null);
  const serviceRef = useRef<HTMLInputElement>(null);
  const dateRef = useRef<HTMLInputElement>(null);

  const fieldRefs = {
    customerName: nameRef,
    service: serviceRef,
    dateTime: dateRef,
  };

  function clearError(field: keyof FieldErrors) {
    setErrors((previous) => {
      if (!previous[field]) return previous;
      const next = { ...previous };
      delete next[field];
      return next;
    });
  }

  function update(field: TextField) {
    return (event: ChangeEvent<HTMLInputElement>) => {
      const { value } = event.target;
      setValues((previous) => ({ ...previous, [field]: value }));
      clearError(field);
    };
  }

  function updateStatus(status: AppointmentStatus) {
    setValues((previous) => ({ ...previous, status }));
    clearError('status');
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const nextErrors = validate(values);
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      setFormMessage('Check the highlighted fields and try again.');
      const firstInvalid = FIELD_ORDER.find((field) => nextErrors[field]);
      if (firstInvalid) fieldRefs[firstInvalid].current?.focus();
      return;
    }

    setSubmitting(true);
    setFormMessage('');

    try {
      await onCreate({
        ...values,
        customerName: values.customerName.trim(),
        service: values.service.trim(),
      });
      setValues(EMPTY);
      setErrors({});
      nameRef.current?.focus();
    } catch (error) {
      if (error instanceof Error) {
        const fieldErrors = (error as { fieldErrors?: FieldErrors }).fieldErrors;
        if (fieldErrors) setErrors(fieldErrors);
        setFormMessage(error.message || 'Could not save the appointment. Try again.');
      } else {
        setFormMessage('Could not save the appointment. Try again.');
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form id="composer" className="composer" onSubmit={handleSubmit} noValidate>
      <div className="composer-head">
        <h2>New appointment</h2>
        <p>All fields are required.</p>
      </div>

      <div className={`field${errors.customerName ? ' has-error' : ''}`}>
        <label htmlFor="customer-name">Customer name</label>
        <input
          id="customer-name"
          ref={nameRef}
          name="customerName"
          type="text"
          autoComplete="off"
          placeholder="e.g. Alex Morgan"
          value={values.customerName}
          onChange={update('customerName')}
          aria-invalid={Boolean(errors.customerName)}
          aria-describedby={errors.customerName ? 'customer-name-error' : undefined}
        />
        {errors.customerName && (
          <p className="field-error" id="customer-name-error">
            {errors.customerName}
          </p>
        )}
      </div>

      <div className={`field${errors.service ? ' has-error' : ''}`}>
        <label htmlFor="service">Service</label>
        <input
          id="service"
          ref={serviceRef}
          name="service"
          type="text"
          autoComplete="off"
          list="service-suggestions"
          placeholder="e.g. Consultation"
          value={values.service}
          onChange={update('service')}
          aria-invalid={Boolean(errors.service)}
          aria-describedby={errors.service ? 'service-error' : undefined}
        />
        <datalist id="service-suggestions">
          {SERVICE_SUGGESTIONS.map((service) => (
            <option key={service} value={service} />
          ))}
        </datalist>
        {errors.service && (
          <p className="field-error" id="service-error">
            {errors.service}
          </p>
        )}
      </div>

      <div className={`field${errors.dateTime ? ' has-error' : ''}`}>
        <label htmlFor="appointment-datetime">Date and time</label>
        <input
          id="appointment-datetime"
          ref={dateRef}
          name="dateTime"
          type="datetime-local"
          value={values.dateTime}
          onChange={update('dateTime')}
          aria-invalid={Boolean(errors.dateTime)}
          aria-describedby={errors.dateTime ? 'datetime-error' : undefined}
        />
        {errors.dateTime && (
          <p className="field-error" id="datetime-error">
            {errors.dateTime}
          </p>
        )}
      </div>

      <fieldset className={`status-field${errors.status ? ' has-error' : ''}`}>
        <legend>Status</legend>
        <div className="status-options">
          {APPOINTMENT_STATUSES.map((status) => (
            <label key={status} className="status-option" data-status={status}>
              <input
                type="radio"
                name="status"
                value={status}
                checked={values.status === status}
                onChange={() => updateStatus(status)}
              />
              <span>{status}</span>
            </label>
          ))}
        </div>
        {errors.status && <p className="field-error">{errors.status}</p>}
      </fieldset>

      {formMessage && (
        <p className="form-alert" role="alert">
          {formMessage}
        </p>
      )}

      <button className="button-primary" type="submit" disabled={submitting}>
        {submitting ? 'Adding appointment…' : 'Add appointment'}
      </button>
    </form>
  );
}
