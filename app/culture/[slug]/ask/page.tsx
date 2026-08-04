import { notFound } from "next/navigation";
import { AskGuide } from "../../../components/AskGuide";
import { communities, getCommunity } from "../../../data/communities";

export function generateStaticParams() {
  return communities.map((community) => ({ slug: community.slug }));
}

export default async function AskPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ auto?: string }>;
}) {
  const { slug } = await params;
  const { auto } = await searchParams;
  const community = getCommunity(slug);
  if (!community) notFound();
  return <AskGuide community={community} autoQuestion={auto === "1"} />;
}
