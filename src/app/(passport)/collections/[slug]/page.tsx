import type { Metadata } from "next";
import { Container } from "@/components/layout/Container";
import { CollectionDetail } from "@/components/passport/CollectionDetail";
import { getRestaurants } from "@/lib/data/restaurants";
import { buildPageMetadata } from "@/lib/seo/metadata";

type CollectionPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({
  params,
}: CollectionPageProps): Promise<Metadata> {
  const { slug } = await params;
  return buildPageMetadata({
    title: "Collection",
    description: "A private local restaurant collection.",
    path: `/collections/${slug}`,
    noIndex: true,
  });
}

export default async function CollectionPage({ params }: CollectionPageProps) {
  const { slug } = await params;
  const restaurants = getRestaurants();

  return (
    <div className="border-b border-border">
      <Container className="py-10 sm:py-14">
        <CollectionDetail slug={slug} restaurants={restaurants} />
      </Container>
    </div>
  );
}
