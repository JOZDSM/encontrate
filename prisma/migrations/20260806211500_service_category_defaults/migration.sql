-- Ensure curated catalog categories exist (idempotent by name).
-- Synonyms power smart catalog search.

INSERT INTO "ServiceCategory" ("id", "name", "slug", "synonyms", "sortOrder", "createdAt", "updatedAt")
VALUES
  ('cat_seed_extranjeria', 'Extranjería', 'extranjeria', ARRAY['residencia','gestora','tramites','nie','papeleo','extranjeria']::TEXT[], 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('cat_seed_wellness', 'Wellness', 'wellness', ARRAY['masaje','masajista','yoga','bienestar','salud','nutricionista']::TEXT[], 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('cat_seed_hogar', 'Ayuda en el hogar', 'ayuda-en-el-hogar', ARRAY['limpieza','limpiadora','hogar']::TEXT[], 2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('cat_seed_belleza', 'Belleza', 'belleza', ARRAY['manicura','peluqueria','corte','color','estetica']::TEXT[], 3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('cat_seed_fitness', 'Fitness', 'fitness', ARRAY['gym','gimnasio','personal trainer','entrenador','entrenamiento','ejercicio']::TEXT[], 4, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('cat_seed_educacion', 'Educación', 'educacion', ARRAY['clases','profesor','ingles','italiano','tutoria','idiomas']::TEXT[], 5, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('cat_seed_reparaciones', 'Reparaciones', 'reparaciones', ARRAY['fontanero','arreglar','fix']::TEXT[], 6, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('cat_seed_mascotas', 'Mascotas', 'mascotas', ARRAY['perro','paseador','veterinario']::TEXT[], 7, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('cat_seed_gastronomia', 'Gastronomía', 'gastronomia', ARRAY['chef','cocina','comida']::TEXT[], 8, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('cat_seed_eventos', 'Eventos', 'eventos', ARRAY['fotografo','dj','fiesta']::TEXT[], 9, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('cat_seed_mudanza', 'Mudanza', 'mudanza', ARRAY['fletero','mudanzas','transporte']::TEXT[], 10, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT ("name") DO UPDATE SET
  "synonyms" = EXCLUDED."synonyms",
  "sortOrder" = EXCLUDED."sortOrder",
  "updatedAt" = CURRENT_TIMESTAMP;
