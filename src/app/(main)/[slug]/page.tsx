import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ServiceDetailPage } from "@/components/service-detail-page";
import {
  getPublishedServiceBySlug,
  getSimilarServices,
} from "@/lib/service-catalog";
import { isReservedServiceSlug } from "@/lib/service-slug";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  if (isReservedServiceSlug(slug)) return {};
  const service = await getPublishedServiceBySlug(slug);
  if (!service) return {};
  return {
    title: `${service.professionalName} · ${service.title}`,
    description: service.description.slice(0, 160),
  };
}

export default async function ServiceSlugPage({ params }: Props) {
  const { slug } = await params;
  if (isReservedServiceSlug(slug)) notFound();

  const service = await getPublishedServiceBySlug(slug);
  if (!service) notFound();

  const similares = await getSimilarServices(service);

  return <ServiceDetailPage service={service} similares={similares} />;
}
