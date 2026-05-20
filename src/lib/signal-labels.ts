/**
 * Spanish labels for the Señal enum-shaped fields. Keep this file purely
 * client-safe (no Prisma imports) so it can be used from any RSC/CSR module.
 */
export const SIGNAL_GENDER_LABELS: Record<string, string> = {
  FEMALE: "Mujer",
  MALE: "Hombre",
  NON_BINARY: "No binarie",
  OTHER: "Otro",
};

export const SIGNAL_OCCUPATION_LABELS: Record<string, string> = {
  STUDENT: "Estudiante",
  EMPLOYED: "Empleado/a en relación de dependencia",
  FREELANCE: "Freelancer",
  ENTREPRENEUR: "Emprendedor/a",
  REMOTE_WORKER: "Trabajador/a remoto",
  OTHER: "Entre cosas :)",
};

export const SIGNAL_LANGUAGE_LABELS: Record<string, string> = {
  ES: "Español",
  EN: "English",
  CA: "Català",
  IT: "Italiano",
  FR: "Français",
  DE: "Deutsch",
  PT: "Português",
  OTHER: "Otro",
};

export const SIGNAL_MOVING_WITH_LABELS: Record<string, string> = {
  SOLO: "Yo",
  COUPLE: "Mi pareja y yo",
  OTHER: "Otros",
};

export const SIGNAL_FLEX_STAY_LABELS: Record<string, string> = {
  WEEKEND: "Fin de semana",
  WEEK: "Semana",
  MONTH: "Mes",
};

export const SIGNAL_BED_SIZE_LABELS: Record<string, string> = {
  INDIVIDUAL: "Individual",
  DOBLE: "Doble",
};

export const SIGNAL_WINDOW_TYPE_LABELS: Record<string, string> = {
  CALLE: "A la calle",
  CORAZON_DE_MANZANA: "Corazón de manzana",
  POZO_DE_AIRE: "Pozo de aire",
  SIN_VENTANA: "Sin ventana",
};

/** Spanish label for a `YYYY-MM` flex-month token, e.g. "ago 2026". */
export function formatFlexMonth(ym: string): string {
  const [yearStr, monthStr] = ym.split("-");
  const year = Number(yearStr);
  const monthIdx = Number(monthStr) - 1;
  if (!Number.isFinite(year) || monthIdx < 0 || monthIdx > 11) return ym;
  const d = new Date(year, monthIdx, 1);
  return d.toLocaleDateString("es-ES", { month: "short", year: "numeric" });
}
