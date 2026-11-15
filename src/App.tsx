import { useCallback, useEffect, useRef, useState } from 'react';
import { api } from './api';
import { AppointmentForm } from './components/AppointmentForm';
import { AppointmentList } from './components/AppointmentList';
import { FilterTabs } from './components/FilterTabs';
import { SearchBar } from './components/SearchBar';
import { Toast } from './components/Toast';
import type {
  Appointment,
  AppointmentFilter,
  AppointmentInput,
  AppointmentStatus,
  Counts,
  StorageKind,
  ToastKind,
  ToastState,
} from './types';

const EMPTY_COUNTS: Counts = { All: 0, Pending: 0, Confirmed: 0, Cancelled: 0 };
const SEARCH_DEBOUNCE_MS = 250;
const TOAST_DURATION_MS = 4200;

const todayLabel = new Intl.DateTimeFormat('en-GB', {
  weekday: 'short',
  day: '2-digit',
  month: 'short',
}).format(new Date());

function LoadingPanel() {
  return (
    <div className="schedule-panel" aria-label="Loading appointments" aria-busy="true">
      {[0, 1, 2].map((row) => (
        <div className="skeleton-row" key={row}>
          <span className="skeleton-bar skeleton-time" />
          <span className="skeleton-bar skeleton-body" />
          <span className="skeleton-bar skeleton-pill" />
        </div>
      ))}
    </div>
  );
}

interface EmptyPanelProps {
  filtered: boolean;
  onClear: () => void;
  onAdd: () => void;
}

function EmptyPanel({ filtered, onClear, onAdd }: EmptyPanelProps) {
  return (
    <div className="schedule-panel empty">
      <h3>{filtered ? 'No matching appointments' : 'The daybook is empty'}</h3>
      <p>
        {filtered
          ? 'Try a different customer name or status.'
          : 'Add the first appointment to get the day started.'}
      </p>
      {filtered ? (
        <button type="button" className="text-button" onClick={onClear}>
          Clear filters
        </button>
      ) : (
        <button type="button" className="text-button" onClick={onAdd}>
          Add an appointment
        </button>
      )}
    </div>
  );
}

export default function App() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [counts, setCounts] = useState<Counts>(EMPTY_COUNTS);
  const [status, setStatus] = useState<AppointmentFilter>('All');
  const [search, setSearch] = useState('');
  const [reloadToken, setReloadToken] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [toast, setToast] = useState<ToastState | null>(null);
  const [busyIds, setBusyIds] = useState<Set<string>>(() => new Set());
  const [storage, setStorage] = useState<StorageKind | ''>('');

  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const notify = useCallback((kind: ToastKind, message: string) => {
    if (toastTimer.current !== null) clearTimeout(toastTimer.current);
    setToast({ id: Date.now(), kind, message });
  }, []);

  const refresh = useCallback(() => {
    setReloadToken((token) => token + 1);
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    const delay = search.trim() ? SEARCH_DEBOUNCE_MS : 0;

    const timer = setTimeout(async () => {
      setLoading(true);
      setLoadError('');

      try {
        const result = await api.list({ status, search }, { signal: controller.signal });
        setAppointments(result.data);
        setCounts(result.meta.counts);
      } catch (error) {
        if (!(error instanceof DOMException && error.name === 'AbortError')) {
          setLoadError(
            error instanceof Error ? error.message : 'Could not load appointments.',
          );
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }, delay);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [status, search, reloadToken]);

  useEffect(() => {
    let cancelled = false;

    api
      .health()
      .then((result) => {
        if (!cancelled) setStorage(result.storage);
      })
      .catch(() => {});

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!toast) return undefined;

    toastTimer.current = setTimeout(() => setToast(null), TOAST_DURATION_MS);

    return () => {
      if (toastTimer.current !== null) clearTimeout(toastTimer.current);
    };
  }, [toast]);

  const handleCreate = useCallback(
    async (values: AppointmentInput): Promise<Appointment> => {
      const result = await api.create(values);
      setStatus('All');
      setSearch('');
      refresh();
      notify('success', `${result.data.customerName} added to the daybook.`);
      return result.data;
    },
    [notify, refresh],
  );

  const handleStatusChange = useCallback(
    async (appointment: Appointment, nextStatus: AppointmentStatus): Promise<void> => {
      setBusyIds((previous) => {
        const next = new Set(previous);
        next.add(appointment.id);
        return next;
      });

      try {
        await api.updateStatus(appointment.id, nextStatus);
        setAppointments((previous) =>
          previous.map((row) =>
            row.id === appointment.id ? { ...row, status: nextStatus } : row,
          ),
        );
        notify('success', `${appointment.customerName} is now ${nextStatus.toLowerCase()}.`);
        refresh();
      } catch (error) {
        notify(
          'error',
          error instanceof Error ? error.message : 'Could not update the status.',
        );
      } finally {
        setBusyIds((previous) => {
          const next = new Set(previous);
          next.delete(appointment.id);
          return next;
        });
      }
    },
    [notify, refresh],
  );

  function focusForm() {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    document.getElementById('composer')?.scrollIntoView({
      behavior: reduceMotion ? 'auto' : 'smooth',
      block: 'start',
    });
    document.querySelector<HTMLInputElement>('#customer-name')?.focus({ preventScroll: true });
  }

  const filtersActive = status !== 'All' || search.trim() !== '';

  const summary =
    loading && appointments.length === 0
      ? 'Loading appointments…'
      : filtersActive
        ? `${appointments.length} of ${counts.All} ${
            counts.All === 1 ? 'appointment' : 'appointments'
          } shown.`
        : `${counts.All} ${counts.All === 1 ? 'appointment' : 'appointments'} on the books.`;

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="brand">
          <span className="brand-mark" aria-hidden="true" />
          <div className="brand-text">
            <h1>Daybook</h1>
            <p>Appointment manager</p>
          </div>
        </div>

        <div className="topbar-side">
          <div className="today">
            <span>Today</span>
            <strong>{todayLabel}</strong>
          </div>
          <button type="button" className="ghost-button" onClick={focusForm}>
            New appointment
          </button>
        </div>
      </header>

      <main className="workspace">
        <AppointmentForm onCreate={handleCreate} />

        <section className="schedule" aria-labelledby="schedule-title">
          <div className="schedule-head">
            <div>
              <h2 id="schedule-title" className="schedule-title">
                Schedule
              </h2>
              <p className="schedule-summary" aria-live="polite">
                {summary}
              </p>
            </div>
          </div>

          <div className="toolbar">
            <FilterTabs value={status} counts={counts} onChange={setStatus} />
            <SearchBar value={search} onChange={setSearch} />
          </div>

          {loadError && (
            <div className="banner" role="alert">
              <span>{loadError}</span>
              <button type="button" onClick={refresh}>
                Try again
              </button>
            </div>
          )}

          {loading && appointments.length === 0 ? (
            <LoadingPanel />
          ) : appointments.length === 0 ? (
            <EmptyPanel
              filtered={filtersActive}
              onClear={() => {
                setStatus('All');
                setSearch('');
              }}
              onAdd={focusForm}
            />
          ) : (
            <AppointmentList
              appointments={appointments}
              busyIds={busyIds}
              onChangeStatus={handleStatusChange}
            />
          )}
        </section>
      </main>

      <footer className="footnote">
        <span>Fictional demo data for the Daybook assessment.</span>
        <span>
          {storage === 'mongodb'
            ? 'Stored in MongoDB.'
            : storage === 'json-file'
              ? 'Stored in a local JSON file.'
              : 'Local API storage.'}
        </span>
      </footer>

      <Toast key={toast?.id ?? 'none'} toast={toast} onDismiss={() => setToast(null)} />
    </div>
  );
}
