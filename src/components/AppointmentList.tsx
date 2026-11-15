import { AppointmentRow } from './AppointmentRow';
import { formatDay } from '../format';
import type { Appointment, AppointmentStatus } from '../types';

interface DayGroup {
  key: string;
  items: Appointment[];
}

function groupByDay(appointments: Appointment[]): DayGroup[] {
  const groups: DayGroup[] = [];

  for (const appointment of appointments) {
    const key = appointment.dateTime.slice(0, 10);
    const current = groups[groups.length - 1];

    if (current && current.key === key) {
      current.items.push(appointment);
    } else {
      groups.push({ key, items: [appointment] });
    }
  }

  return groups;
}

interface AppointmentListProps {
  appointments: Appointment[];
  busyIds: Set<string>;
  onChangeStatus: (appointment: Appointment, status: AppointmentStatus) => void;
}

export function AppointmentList({
  appointments,
  busyIds,
  onChangeStatus,
}: AppointmentListProps) {
  const groups = groupByDay(appointments);

  return (
    <div className="schedule-panel">
      {groups.map((group) => (
        <section
          className="day-group"
          key={group.key}
          aria-label={formatDay(group.items[0].dateTime)}
        >
          <div className="day-heading">
            <h3>{formatDay(group.items[0].dateTime)}</h3>
            <span className="day-rule" aria-hidden="true" />
            <span className="day-count">
              {group.items.length} {group.items.length === 1 ? 'appointment' : 'appointments'}
            </span>
          </div>

          {group.items.map((appointment) => (
            <AppointmentRow
              key={appointment.id}
              appointment={appointment}
              busy={busyIds.has(appointment.id)}
              onChangeStatus={onChangeStatus}
            />
          ))}
        </section>
      ))}
    </div>
  );
}
