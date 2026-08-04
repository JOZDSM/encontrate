export type ServiceOffering = {
  id: string;
  /** Public profile path segment (`/${slug}`). */
  slug?: string;
  title: string;
  professionalName: string;
  category: string;
  neighborhood?: string;
  priceNote?: string;
  imageUrl?: string;
  featured?: boolean;
};

export type FeaturedService = {
  id: string;
  brandName: string;
  /** Optional brand mark instead of plain text title */
  brandLogo?: "pipol" | "dulce-maria";
  tagline: string;
  hours: string[];
  address: string;
  /** Label for the reusable location CTA (e.g. "Gracia, Barcelona") */
  locationLabel?: string;
  /** Google / Apple Maps URL for the location CTA */
  mapsUrl?: string;
  websiteUrl?: string;
  instagramUrl?: string;
  posterUrl: string;
  videoUrl?: string;
};

export type CuratedCollection = {
  id: string;
  title: string;
  slug: string;
  description?: string;
  items: ServiceOffering[];
};

const IMG = {
  cleaning: "/pexels-msbln-5351023.jpg",
  move: "/pexels-apasaric-1388030.jpg",
  repair: "/pexels-ch-jawad-224803663-36883769.jpg",
  tutor: "/pexels-george-cristea-122917183-16058900.jpg",
  portrait: "/pexels-george-cristea-122917183-16104705.jpg",
  pipolHero: "/design/home-services/pipol-hero.png",
  dulceMariaHero: "/design/home-services/dulce-maria-hero.jpg",
  gestoraExtranjeria: "/design/home-services/gestora-extranjeria.jpg",
  nutricionista: "/design/home-services/nutricionista.jpg",
  limpiadora: "/design/home-services/limpiadora.jpg",
  fletero: "/design/home-services/fletero.jpg",
};

const VIDEO = {
  cafe: "https://videos.pexels.com/video-files/3447978/3447978-uhd_2560_1440_25fps.mp4",
  wellness: "https://videos.pexels.com/video-files/4057255/4057255-uhd_2560_1440_25fps.mp4",
  beauty: "https://videos.pexels.com/video-files/3997989/3997989-uhd_2560_1440_25fps.mp4",
};

export const MOCK_FEATURED_SERVICES: FeaturedService[] = [
  {
    id: "feat-pipol",
    brandName: "PiPOL",
    brandLogo: "pipol",
    tagline: "El coffee de la gente",
    hours: [
      "Lunes a Viernes: 8:00 - 20:00",
      "Sábados y Domingos: 9:00 - 21:00",
    ],
    address: "Carrer de Provença, 234, 08036 Barcelona",
    websiteUrl: "https://example.com",
    instagramUrl: "https://instagram.com",
    posterUrl: IMG.pipolHero,
  },
  {
    id: "feat-dulce-maria",
    brandName: "Dulce María",
    brandLogo: "dulce-maria",
    tagline: "Medialunas, Pastelería Artesanal y café de finca",
    hours: [],
    address: "Gràcia, Barcelona",
    locationLabel: "Gracia, Barcelona",
    mapsUrl:
      "https://www.google.com/maps/search/?api=1&query=Dulce+Mar%C3%ADa+Gr%C3%A0cia+Barcelona",
    instagramUrl: "https://www.instagram.com/",
    posterUrl: IMG.dulceMariaHero,
  },
  {
    id: "feat-glow",
    brandName: "Glow Studio",
    tagline: "Belleza con cita previa y trato cercano",
    hours: ["Lunes a Sábado: 9:30 - 20:30"],
    address: "Carrer de Balmes, 120, 08008 Barcelona",
    instagramUrl: "https://instagram.com",
    posterUrl: IMG.cleaning,
    videoUrl: VIDEO.beauty,
  },
  {
    id: "feat-fix",
    brandName: "Fix Hogar",
    tagline: "Reparaciones rápidas para tu piso",
    hours: ["Lunes a Viernes: 8:00 - 19:00"],
    address: "Zona Eixample y alrededores",
    websiteUrl: "https://example.com",
    posterUrl: IMG.repair,
  },
  {
    id: "feat-move",
    brandName: "Mudanzas BCN",
    tagline: "Mudanzas económicas con gente de confianza",
    hours: ["Todos los días: 7:00 - 22:00"],
    address: "Barcelona y área metropolitana",
    posterUrl: IMG.move,
  },
  {
    id: "feat-learn",
    brandName: "Clases BCN",
    tagline: "Profes particulares para idiomas y apoyo escolar",
    hours: ["Horario flexible según profesional"],
    address: "Online y presencial en Barcelona",
    posterUrl: IMG.tutor,
  },
];

const ALL_SERVICES: ServiceOffering[] = [
  {
    id: "svc-1",
    title: "Gestora en extranjería",
    professionalName: "Florencia Gambini",
    category: "Extranjería",
    neighborhood: "Barcelona",
    imageUrl: IMG.gestoraExtranjeria,
    featured: true,
  },
  {
    id: "svc-2",
    title: "Masajista a domicilio",
    professionalName: "Laura V.",
    category: "Wellness",
    neighborhood: "Eixample",
    priceNote: "Desde 45 €/sesión",
    imageUrl: IMG.nutricionista,
    featured: true,
  },
  {
    id: "svc-3",
    title: "Manicura y pedicura",
    professionalName: "Sofía R.",
    category: "Belleza",
    neighborhood: "Sant Antoni",
    priceNote: "Desde 25 €",
    imageUrl: IMG.portrait,
  },
  {
    id: "svc-4",
    title: "Fontanero de urgencia",
    professionalName: "Marc A.",
    category: "Reparaciones",
    neighborhood: "Horta",
    priceNote: "Desde 40 €/visita",
    imageUrl: IMG.repair,
  },
  {
    id: "svc-5",
    title: "Clases particulares de inglés",
    professionalName: "Anna K.",
    category: "Educación",
    neighborhood: "Les Corts",
    priceNote: "25 €/h",
    imageUrl: IMG.tutor,
  },
  {
    id: "svc-6",
    title: "Limpieza profunda del piso",
    professionalName: "María G.",
    category: "Ayuda en el hogar",
    neighborhood: "Gràcia",
    priceNote: "Desde 28 €/h",
    imageUrl: IMG.limpiadora,
  },
  {
    id: "svc-7",
    title: "Yoga para principiantes",
    professionalName: "Nuria T.",
    category: "Wellness",
    neighborhood: "Gràcia",
    priceNote: "15 €/clase",
    imageUrl: IMG.cleaning,
  },
  {
    id: "svc-8",
    title: "Peluquería: corte y color",
    professionalName: "Marta L.",
    category: "Belleza",
    neighborhood: "Born",
    priceNote: "Desde 40 €",
    imageUrl: IMG.portrait,
  },
  {
    id: "svc-9",
    title: "Mudanza económica",
    professionalName: "Carlos R.",
    category: "Mudanza",
    neighborhood: "Barcelona",
    priceNote: "Presupuesto sin compromiso",
    imageUrl: IMG.fletero,
  },
  {
    id: "svc-10",
    title: "Paseador de perros",
    professionalName: "Héctor S.",
    category: "Mascotas",
    neighborhood: "Poble Sec",
    priceNote: "12 €/paseo",
    imageUrl: IMG.move,
  },
  {
    id: "svc-11",
    title: "Chef a domicilio",
    professionalName: "Andrea F.",
    category: "Gastronomía",
    neighborhood: "Eixample",
    priceNote: "Desde 60 €/persona",
    imageUrl: IMG.nutricionista,
  },
  {
    id: "svc-12",
    title: "Entrenador personal",
    professionalName: "Pablo N.",
    category: "Fitness",
    neighborhood: "Diagonal Mar",
    priceNote: "35 €/sesión",
    imageUrl: IMG.portrait,
  },
  {
    id: "svc-13",
    title: "Montaje de muebles",
    professionalName: "Luis D.",
    category: "Ayuda en el hogar",
    neighborhood: "Sants",
    priceNote: "Desde 30 €/h",
    imageUrl: IMG.limpiadora,
  },
  {
    id: "svc-14",
    title: "Fisioterapia a domicilio",
    professionalName: "Clara B.",
    category: "Wellness",
    neighborhood: "Pedralbes",
    priceNote: "50 €/sesión",
    imageUrl: IMG.cleaning,
  },
  {
    id: "svc-15",
    title: "Maquillaje para eventos",
    professionalName: "Irene C.",
    category: "Belleza",
    neighborhood: "Gràcia",
    priceNote: "Desde 55 €",
    imageUrl: IMG.portrait,
  },
  {
    id: "svc-16",
    title: "Catering para eventos pequeños",
    professionalName: "Catering V.",
    category: "Eventos",
    neighborhood: "Barcelona",
    priceNote: "Presupuesto a medida",
    imageUrl: IMG.nutricionista,
  },
  {
    id: "svc-17",
    title: "Electricista certificado",
    professionalName: "Marc A.",
    category: "Reparaciones",
    neighborhood: "Horta",
    priceNote: "Desde 40 €/visita",
    imageUrl: IMG.repair,
  },
  {
    id: "svc-18",
    title: "Apoyo en matemáticas (ESO)",
    professionalName: "David H.",
    category: "Educación",
    neighborhood: "Online",
    priceNote: "22 €/h",
    imageUrl: IMG.tutor,
  },
  {
    id: "svc-19",
    title: "Pilates en pareja",
    professionalName: "Miriam O.",
    category: "Fitness",
    neighborhood: "Sarrià",
    priceNote: "28 €/sesión",
    imageUrl: IMG.cleaning,
  },
  {
    id: "svc-20",
    title: "Organización de armarios",
    professionalName: "Elena M.",
    category: "Ayuda en el hogar",
    neighborhood: "Sarrià",
    priceNote: "Desde 35 €/h",
    imageUrl: IMG.limpiadora,
  },
];

export const MOCK_RECENT_SERVICES: ServiceOffering[] = ALL_SERVICES.slice(0, 8);

/** Ensure each catalog row has enough tiles to scroll past the right edge. */
function padCategoryItems(
  items: ServiceOffering[],
  minCount = 6,
): ServiceOffering[] {
  if (items.length === 0) return items;
  const padded = [...items];
  let n = 0;
  while (padded.length < minCount) {
    const source = items[n % items.length]!;
    padded.push({
      ...source,
      id: `${source.id}-pad-${padded.length}`,
    });
    n += 1;
  }
  return padded;
}

export const MOCK_CATEGORY_ROWS: CuratedCollection[] = [
  {
    id: "wellness",
    title: "Wellness",
    slug: "wellness",
    items: padCategoryItems(
      ALL_SERVICES.filter((s) => s.category === "Wellness"),
    ),
  },
  {
    id: "hogar",
    title: "Ayuda en el hogar",
    slug: "ayuda-en-el-hogar",
    items: padCategoryItems(
      ALL_SERVICES.filter((s) => s.category === "Ayuda en el hogar"),
    ),
  },
  {
    id: "belleza",
    title: "Belleza",
    slug: "belleza",
    items: padCategoryItems(
      ALL_SERVICES.filter((s) => s.category === "Belleza"),
    ),
  },
  {
    id: "gastro",
    title: "Gastronomía",
    slug: "gastronomia",
    items: padCategoryItems(
      ALL_SERVICES.filter((s) => s.category === "Gastronomía"),
    ),
  },
  {
    id: "fitness",
    title: "Fitness",
    slug: "fitness",
    items: padCategoryItems(
      ALL_SERVICES.filter((s) => s.category === "Fitness"),
    ),
  },
  {
    id: "educacion",
    title: "Educación",
    slug: "educacion",
    items: padCategoryItems(
      ALL_SERVICES.filter((s) => s.category === "Educación"),
    ),
  },
  {
    id: "reparaciones",
    title: "Reparaciones",
    slug: "reparaciones",
    items: padCategoryItems(
      ALL_SERVICES.filter((s) => s.category === "Reparaciones"),
    ),
  },
  {
    id: "mascotas",
    title: "Mascotas",
    slug: "mascotas",
    items: padCategoryItems(
      ALL_SERVICES.filter((s) => s.category === "Mascotas"),
    ),
  },
  {
    id: "eventos",
    title: "Eventos",
    slug: "eventos",
    items: padCategoryItems(
      ALL_SERVICES.filter((s) => s.category === "Eventos"),
    ),
  },
  {
    id: "mudanza",
    title: "Mudanza",
    slug: "mudanza",
    items: padCategoryItems(
      ALL_SERVICES.filter((s) => s.category === "Mudanza"),
    ),
  },
];

/** @deprecated Use MOCK_CATEGORY_ROWS — kept for any lingering imports */
export const MOCK_SERVICE_COLLECTIONS = MOCK_CATEGORY_ROWS;

/** @deprecated Search categories are not wired yet */
export const MOCK_SERVICE_CATEGORIES = [
  "Wellness",
  "Ayuda en el hogar",
  "Belleza",
  "Gastronomía",
  "Fitness",
] as const;
