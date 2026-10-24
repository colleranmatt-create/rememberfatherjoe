import type { Metadata } from "next";
import Link from "next/link";
import { site } from "@/site.config";
import ShareForm from "./ShareForm";

export const metadata: Metadata = {
  title: "Share a memory",
  description: `Share a memory, photo or story of ${site.name}.`,
};

export default function SharePage() {
  return (
    <main className="container narrow">
      <Link href="/" className="back-link">
        ← Back
      </Link>
      <h1 className="page-title">Share a memory of {site.shortName}</h1>
      <p className="lede">
        However you knew him, and however long ago, your story matters. Write as much or as little as you like.
      </p>
      <ShareForm college={site.college} />
    </main>
  );
}
