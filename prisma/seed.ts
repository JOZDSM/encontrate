import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import { PrismaClient } from "../src/generated/prisma/client";
import { slugifyProfessionalName } from "../src/lib/service-slug";

const url = process.env.DATABASE_URL;
if (!url || url.startsWith("prisma+")) {
  console.error("Set DATABASE_URL to a postgresql:// URL before seeding.");
  process.exit(1);
}

const pool = new Pool({ connectionString: url });
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

const DEFAULT_CATEGORIES: {
  name: string;
  synonyms: string[];
  sortOrder: number;
}[] = [
  {
    name: "Extranjería",
    synonyms: ["residencia", "gestora", "tramites", "nie", "papeleo", "extranjeria"],
    sortOrder: 0,
  },
  {
    name: "Wellness",
    synonyms: ["masaje", "masajista", "yoga", "bienestar", "salud", "nutricionista"],
    sortOrder: 1,
  },
  {
    name: "Ayuda en el hogar",
    synonyms: ["limpieza", "limpiadora", "hogar"],
    sortOrder: 2,
  },
  {
    name: "Belleza",
    synonyms: ["manicura", "peluqueria", "corte", "color", "estetica"],
    sortOrder: 3,
  },
  {
    name: "Fitness",
    synonyms: ["gym", "gimnasio", "personal trainer", "entrenador", "entrenamiento", "ejercicio"],
    sortOrder: 4,
  },
  {
    name: "Educación",
    synonyms: ["clases", "profesor", "ingles", "italiano", "tutoria", "idiomas"],
    sortOrder: 5,
  },
  {
    name: "Reparaciones",
    synonyms: ["fontanero", "arreglar", "fix"],
    sortOrder: 6,
  },
  {
    name: "Mascotas",
    synonyms: ["perro", "paseador", "veterinario"],
    sortOrder: 7,
  },
  {
    name: "Gastronomía",
    synonyms: ["chef", "cocina", "comida"],
    sortOrder: 8,
  },
  {
    name: "Eventos",
    synonyms: ["fotografo", "dj", "fiesta"],
    sortOrder: 9,
  },
  {
    name: "Mudanza",
    synonyms: ["fletero", "mudanzas", "transporte"],
    sortOrder: 10,
  },
];

async function upsertCategories() {
  const byName = new Map<string, string>();
  for (const cat of DEFAULT_CATEGORIES) {
    const slug = slugifyProfessionalName(cat.name);
    const row = await prisma.serviceCategory.upsert({
      where: { name: cat.name },
      create: {
        name: cat.name,
        slug,
        synonyms: cat.synonyms,
        sortOrder: cat.sortOrder,
      },
      update: {
        synonyms: cat.synonyms,
        sortOrder: cat.sortOrder,
      },
    });
    byName.set(cat.name, row.id);
  }
  return byName;
}

async function main() {
  const categories = await upsertCategories();

  const extranjeriaId = categories.get("Extranjería");
  const hogarId = categories.get("Ayuda en el hogar");
  const mudanzaId = categories.get("Mudanza");
  const wellnessId = categories.get("Wellness");
  if (!extranjeriaId || !hogarId || !mudanzaId || !wellnessId) {
    throw new Error("Missing seeded categories.");
  }

  const florencia = await prisma.service.upsert({
    where: { slug: "florencia-gambini" },
    create: {
      slug: "florencia-gambini",
      professionalName: "Florencia Gambini",
      title: "Gestora en extranjería",
      categoryId: extranjeriaId,
      description:
        "Acompaño a personas y familias en trámites de extranjería en Barcelona: residencia, arraigo, renovaciones y gestiones ante la administración. Trabajo con claridad, plazos realistas y seguimiento cercano en cada expediente.",
      imageUrl: "/design/home-services/gestora-extranjeria.jpg",
      websiteUrl: "https://example.com",
      instagramUrl: "https://www.instagram.com/unclickaway",
      instagramHandle: "@unclickaway",
      whatsapp: "+34600000000",
      email: "florencia@example.com",
      showWhatsapp: true,
      showEmail: true,
      offeringItems: [
        "Permisos de residencia y trabajo",
        "Gestión de citas y presentaciones",
        "Alta en Seguridad Social",
        "Arraigo social y familiar",
        "Renovaciones y modificaciones",
        "Asesoramiento en reagrupación familiar",
      ],
      published: true,
      featured: true,
      sortOrder: 0,
      neighborhood: "Barcelona",
      reviews: {
        create: [
          {
            authorName: "María P.",
            body: "Ha sido excelente. Me orientó en cada paso del trámite y resolvió dudas con mucha paciencia.",
            rating: 5,
            sortOrder: 0,
          },
          {
            authorName: "Lucas R.",
            body: "Profesional y clara. Conseguimos la cita y el expediente quedó presentado a tiempo.",
            rating: 5,
            sortOrder: 1,
          },
          {
            authorName: "Ana G.",
            body: "Muy recomendable. Explica todo sin rodeos y está disponible cuando hace falta.",
            rating: 5,
            sortOrder: 2,
          },
        ],
      },
    },
    update: {
      published: true,
      featured: true,
      categoryId: extranjeriaId,
      imageUrl: "/design/home-services/gestora-extranjeria.jpg",
    },
  });

  const extras = [
    {
      slug: "maria-g",
      professionalName: "María G.",
      title: "Limpieza profunda del piso",
      categoryId: hogarId,
      description:
        "Servicio de limpieza profunda para pisos en Barcelona. Ideal antes de una mudanza, después de obras o para dejar el hogar a punto.",
      imageUrl: "/design/home-services/limpiadora.jpg",
      offeringItems: [
        "Limpieza profunda de cocina y baños",
        "Interior de armarios a pedido",
        "Productos ecológicos opcionales",
      ],
      neighborhood: "Gràcia",
      priceNote: "Desde 28 €/h",
    },
    {
      slug: "carlos-r",
      professionalName: "Carlos R.",
      title: "Mudanza económica",
      categoryId: mudanzaId,
      description:
        "Mudanzas económicas en Barcelona y alrededores, con presupuesto sin compromiso y cuidado del mobiliario.",
      imageUrl: "/design/home-services/fletero.jpg",
      offeringItems: [
        "Mudanzas locales",
        "Embalaje opcional",
        "Desmontaje y montaje de muebles",
      ],
      neighborhood: "Barcelona",
      priceNote: "Presupuesto sin compromiso",
    },
    {
      slug: "andrea-f",
      professionalName: "Andrea F.",
      title: "Nutricionista",
      categoryId: wellnessId,
      description:
        "Planes de alimentación personalizados y seguimiento cercano para objetivos de salud y bienestar.",
      imageUrl: "/design/home-services/nutricionista.jpg",
      offeringItems: [
        "Primera consulta de evaluación",
        "Plan semanal personalizado",
        "Seguimiento quincenal",
      ],
      neighborhood: "Eixample",
      priceNote: "Desde 45 €/sesión",
    },
  ] as const;

  for (const [i, item] of extras.entries()) {
    await prisma.service.upsert({
      where: { slug: item.slug },
      create: {
        ...item,
        published: true,
        featured: true,
        sortOrder: i + 1,
        showWhatsapp: false,
        showEmail: true,
        email: `${item.slug}@example.com`,
      },
      update: {
        published: true,
        categoryId: item.categoryId,
        imageUrl: item.imageUrl,
        featured: true,
      },
    });
  }

  console.log(`Seeded categories + services (incl. ${florencia.slug}).`);
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
