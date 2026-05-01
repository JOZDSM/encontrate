export type ListingWindowValue =
  | "CALLE"
  | "CORAZON_DE_MANZANA"
  | "POZO_DE_AIRE"
  | "SIN_VENTANA";

export const LISTING_WINDOW_OPTIONS: {
  value: ListingWindowValue;
  title: string;
  description: string;
}[] = [
  {
    value: "CALLE",
    title: "A la calle",
    description:
      "La habitación tiene al menos una ventana que da a la calle.",
  },
  {
    value: "CORAZON_DE_MANZANA",
    title: "A corazón de manzana",
    description:
      "La habitación tiene al menos una ventana que da al típico corazón de manzana que permite mucha luz.",
  },
  {
    value: "POZO_DE_AIRE",
    title: "A pozo de aire",
    description:
      "La habitación tiene al menos una ventana que da a un pozo de aire o patio interno pequeño.",
  },
  {
    value: "SIN_VENTANA",
    title: "Sin ventana :/",
    description: "La habitación no tiene ninguna ventana.",
  },
];
