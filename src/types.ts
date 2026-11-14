export const API_URL = 'http://localhost:3000';

export interface Item {
  id: number;
  title: string;
  description: string;
  category: string;
  city: string;
  location: string;
  imageUrl: string | null;
  status: string;
  /** Estado de gestión: ACTIVE (visible) o RESOLVED (entregado o encontrado). */
  state: string;
  userId: number | null;
  /** Indica si el publicador registró un detalle de verificación (el detalle en sí es privado). */
  hasPrivateDetail: boolean;
  createdAt: string;
  /** Solo en "mis objetos": el detalle privado que únicamente ve su autor. */
  privateDetail?: string | null;
}

export interface ItemMatch extends Item {
  /** Similitud con el reporte consultado, entre 0 y 1. */
  matchScore: number;
}

export interface ItemsPage {
  items: Item[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/** El estado se almacenó con valores heterogéneos ("ENCONTRADO", "found", ...). */
export const isFoundStatus = (status: string) => ['found', 'encontrado'].includes(status.toLowerCase());

/** Un objeto encontrado se "entrega" a su dueño; uno perdido se "encuentra". */
export const resolvedLabel = (status: string) => (isFoundStatus(status) ? 'Entregado' : 'Encontrado');

/** Texto de la acción con la que su autor cierra el reporte. */
export const resolveActionLabel = (status: string) =>
  isFoundStatus(status) ? 'Marcar como entregado' : 'Marcar como encontrado';

/** Fecha local en formato AAAA-MM-DD, el que espera la API. */
export const toISODate = (date: Date) => {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
};

export type DatePreset = 'all' | 'today' | '3d' | 'week' | 'custom';

/** Rango [desde, hasta] que corresponde a cada atajo de fecha (los días incluyen el actual). */
export const presetRange = (preset: DatePreset, now = new Date()): { from: string; to: string } => {
  const daysBack = { today: 0, '3d': 2, week: 6 } as const;
  if (preset === 'today' || preset === '3d' || preset === 'week') {
    const start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - daysBack[preset]);
    return { from: toISODate(start), to: '' };
  }
  return { from: '', to: '' };
};
