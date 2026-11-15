export const APPOINTMENT_STATUSES = ['Pending', 'Confirmed', 'Cancelled'] as const;
export type AppointmentStatus = (typeof APPOINTMENT_STATUSES)[number];

export const APPOINTMENT_FILTERS = ['All', ...APPOINTMENT_STATUSES] as const;
export type AppointmentFilter = (typeof APPOINTMENT_FILTERS)[number];

export interface AppointmentInput {
  customerName: string;
  service: string;
  dateTime: string;
  status: AppointmentStatus;
}

export interface Appointment extends AppointmentInput {
  id: string;
  createdAt: string;
  updatedAt?: string;
}

export type Counts = Record<AppointmentFilter, number>;

export interface AppointmentListMeta {
  counts: Counts;
  shown: number;
}

export interface AppointmentListResponse {
  data: Appointment[];
  meta: AppointmentListMeta;
}

export type StorageKind = 'json-file' | 'mongodb';

export interface HealthResponse {
  status: string;
  storage: StorageKind;
}

export type FieldErrors = Partial<
  Record<'customerName' | 'service' | 'dateTime' | 'status', string>
>;

export type ToastKind = 'success' | 'error';

export interface ToastState {
  id: number;
  kind: ToastKind;
  message: string;
}
