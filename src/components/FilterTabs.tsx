import { APPOINTMENT_FILTERS } from '../types';
import type { AppointmentFilter, Counts } from '../types';

interface FilterTabsProps {
  value: AppointmentFilter;
  counts: Counts;
  onChange: (value: AppointmentFilter) => void;
}

export function FilterTabs({ value, counts, onChange }: FilterTabsProps) {
  return (
    <div className="filters" role="group" aria-label="Filter appointments by status">
      {APPOINTMENT_FILTERS.map((filter) => (
        <button
          key={filter}
          type="button"
          className="filter-tab"
          aria-pressed={value === filter}
          onClick={() => onChange(filter)}
        >
          <span>{filter}</span>
          <span className="filter-count">{counts[filter] ?? 0}</span>
        </button>
      ))}
    </div>
  );
}
