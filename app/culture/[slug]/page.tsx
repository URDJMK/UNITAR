import { notFound } from "next/navigation";
import { CultureProfile } from "../../components/CultureProfile";
import { communities, getCommunity } from "../../data/communities";

export function generateStaticParams() {
  return communities.map((community) => ({ slug: community.slug }));
}

export default async function CulturePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const community = getCommunity(slug);
  if (!community) notFound();
  return <CultureProfile community={community} />;
}
