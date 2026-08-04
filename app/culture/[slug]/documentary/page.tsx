import { notFound } from "next/navigation";
import { DocumentaryStudio } from "../../../components/DocumentaryStudio";
import { communities, getCommunity } from "../../../data/communities";

export function generateStaticParams() {
  return communities.map((community) => ({ slug: community.slug }));
}

export default async function DocumentaryPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ mode?: string }>;
}) {
  const { slug } = await params;
  const { mode } = await searchParams;
  const community = getCommunity(slug);
  if (!community) notFound();
  return <DocumentaryStudio community={community} initialMode={mode === "watch" ? "watch" : "generate"} />;
}
