import { formatTime } from '../format';
import { APPOINTMENT_STATUSES } from '../types';
import type { Appointment, AppointmentStatus } from '../types';

interface AppointmentRowProps {
  appointment: Appointment;
  busy: boolean;
  onChangeStatus: (appointment: Appointment, status: AppointmentStatus) => void;
}

export function AppointmentRow({ appointment, busy, onChangeStatus }: AppointmentRowProps) {
  const statusId = `status-${appointment.id}`;

  return (
    <article className="appointment" data-status={appointment.status} aria-busy={busy}>
      <span className="appointment-time">{formatTime(appointment.dateTime)}</span>

      <div className="appointment-body">
        <p className="customer-name">{appointment.customerName}</p>
        <p className="appointment-service">{appointment.service}</p>
      </div>

      <div className="appointment-status">
        <label className="sr-only" htmlFor={statusId}>
          Status for {appointment.customerName}
        </label>
        <select
          id={statusId}
          className="status-select"
          value={appointment.status}
          disabled={busy}
          onChange={(event) =>
            onChangeStatus(appointment, event.target.value as AppointmentStatus)
          }
        >
          {APPOINTMENT_STATUSES.map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </select>
      </div>
    </article>
  );
}
