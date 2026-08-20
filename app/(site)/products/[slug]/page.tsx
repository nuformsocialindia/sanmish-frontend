import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { findProductBySlug, getAllProducts } from "@/lib/productLookup";
import { fetchApiProductBySlug, fetchApiProducts, publicFileUrl } from "@/lib/publicApi";
import ProductDetailView from "@/components/ProductDetailView";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const apiProducts = await fetchApiProducts({ limit: 100 });
  const product = findProductBySlug(slug, apiProducts);
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
  const [apiProducts, apiDetail] = await Promise.all([
    fetchApiProducts({ limit: 100 }),
    fetchApiProductBySlug(slug),
  ]);

  const allProducts = getAllProducts(apiProducts);
  const product = allProducts.find((p) => p.slug === slug);
  if (!product) notFound();

  // The richer single-product fetch adds description copy, the real
  // volume-pricing ladder (priceSlabs), specifications, and the full image
  // gallery — none of which the list endpoint reliably carries.
  if (apiDetail) {
    product.description = apiDetail.description ?? apiDetail.shortDescription ?? product.description;
    product.priceSlabs = apiDetail.priceSlabs;
    product.specifications = apiDetail.specifications ?? product.specifications;
    if (apiDetail.images?.length) {
      product.images = apiDetail.images.map((img) => publicFileUrl(img.url)).filter((u): u is string => Boolean(u));
    }
  }

  const similarProducts = allProducts
    .filter((p) => p.slug !== product.slug && p.category === product.category)
    .slice(0, 8);

  return <ProductDetailView product={product} similarProducts={similarProducts} />;
}
