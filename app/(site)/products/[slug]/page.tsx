import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { findProductBySlug } from "@/lib/productLookup";
import ProductDetailView from "@/components/ProductDetailView";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = findProductBySlug(slug);
  if (!product) return { title: "Product not found — SANMISH" };
  return {
    title: `${product.title} — ${product.seller} | SANMISH`,
    description: `${product.title} from ${product.seller}, listed under ${product.category} equipment on SANMISH — India's B2B marketplace for clean energy infrastructure.`,
  };
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = findProductBySlug(slug);
  if (!product) notFound();

  return <ProductDetailView product={product} />;
}
