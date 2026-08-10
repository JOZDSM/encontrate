import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { scoreService, searchCatalog } from "@/lib/catalog-search";
import type { ServiceOffering } from "@/lib/mock-services-catalog";

const mariaG: ServiceOffering = {
  id: "maria-g",
  slug: "maria-g",
  title: "Limpieza profunda del piso",
  professionalName: "María G.",
  category: "Ayuda en el hogar",
  categorySynonyms: ["limpieza", "limpiadora", "hogar"],
};

const florencia: ServiceOffering = {
  id: "florencia",
  slug: "florencia-gambini",
  title: "Gestora en extranjería",
  professionalName: "Florencia Gambini",
  category: "Extranjería",
};

describe("catalog search scoring", () => {
  it("does not match María G. on gentrification via single-letter G", () => {
    assert.equal(scoreService(mariaG, "gentrification"), 0);
    assert.deepEqual(searchCatalog([mariaG, florencia], "gentrification"), []);
  });

  it("still matches limpieza and exact G initial", () => {
    assert.ok(scoreService(mariaG, "limpieza") > 0);
    assert.ok(scoreService(mariaG, "limp") > 0);
    assert.ok(scoreService(mariaG, "g") > 0);
  });

  it("still matches fitness-style synonym expansion for titles", () => {
    const trainer: ServiceOffering = {
      id: "trainer",
      title: "Personal trainer",
      professionalName: "Ana F.",
      category: "Fitness",
      categorySynonyms: ["gym", "entrenador"],
    };
    assert.ok(scoreService(trainer, "fitness") > 0);
  });
});
