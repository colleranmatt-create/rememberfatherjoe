"use server";

import { randomUUID } from "node:crypto";
import { relationships } from "@/site.config";
import { PHOTO_BUCKET, supabaseAdmin } from "@/lib/supabase";
import { youtubeId } from "@/lib/youtube";
import { MAX_PHOTOS } from "@/lib/limits";

const PHOTO_PATH = /^submissions\/[0-9a-f-]{36}\.jpg$/;

// Photos go straight from the browser to Supabase Storage via one-time signed
// URLs, which keeps large uploads off the Vercel function (4.5 MB body limit).
export async function createPhotoUploads(count: number) {
  const db = supabaseAdmin();
  if (!db) return { error: "The site isn't connected to its database yet." };
  const n = Math.min(Math.max(Math.floor(count), 0), MAX_PHOTOS);
  const uploads = [];
  for (let i = 0; i < n; i++) {
    const path = `submissions/${randomUUID()}.jpg`;
    const { data, error } = await db.storage.from(PHOTO_BUCKET).createSignedUploadUrl(path);
    if (error || !data) return { error: "Couldn't prepare the photo upload. Please try again." };
    uploads.push({ path, signedUrl: data.signedUrl });
  }
  return { uploads };
}

export type SubmitInput = {
  name: string;
  relationships: string[];
  relationshipDetail: string;
  yearFrom: string;
  yearTo: string;
  location: string;
  memory: string;
  photoPaths: string[];
  youtubeUrl: string;
  email: string;
  website: string; // honeypot: real people never fill this in
};

const clean = (s: unknown, max: number) => (typeof s === "string" ? s.trim().slice(0, max) : "");

function year(s: string) {
  if (!s.trim()) return null;
  const n = Number(s);
  const max = new Date().getFullYear();
  return Number.isInteger(n) && n >= 1900 && n <= max ? n : NaN;
}

export async function submitMemory(input: SubmitInput): Promise<{ ok: true } | { ok: false; error: string }> {
  if (clean(input.website, 200)) return { ok: true };

  const name = clean(input.name, 120);
  const picked = Array.isArray(input.relationships) ? input.relationships : [];
  const rels = relationships.map((r) => r.value).filter((v) => picked.includes(v));
  const relationshipDetail = clean(input.relationshipDetail, 120);
  const location = clean(input.location, 120);
  const memory = clean(input.memory, 10000);
  const youtubeUrl = clean(input.youtubeUrl, 300);
  const email = clean(input.email, 254);
  const yearFrom = year(clean(input.yearFrom, 4));
  const yearTo = year(clean(input.yearTo, 4));
  const photoPaths = Array.isArray(input.photoPaths) ? input.photoPaths.slice(0, MAX_PHOTOS) : [];

  if (!name) return { ok: false, error: "Please add your name." };
  if (!rels.length || picked.length !== rels.length) return { ok: false, error: "Please choose your connection to Fr. Joe." };
  if (rels.includes("other") && !relationshipDetail) return { ok: false, error: "Please tell us your connection to Fr. Joe." };
  if (memory.length < 2) return { ok: false, error: "Please share a memory." };
  if (Number.isNaN(yearFrom) || Number.isNaN(yearTo)) return { ok: false, error: "Please check the years." };
  if (yearFrom && yearTo && yearTo < yearFrom) return { ok: false, error: "The end year is before the start year." };
  if (youtubeUrl && !youtubeId(youtubeUrl)) return { ok: false, error: "That doesn't look like a YouTube link." };
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { ok: false, error: "Please check your email." };
  if (!photoPaths.every((p) => typeof p === "string" && PHOTO_PATH.test(p)))
    return { ok: false, error: "Something went wrong with the photos. Please try again." };

  const db = supabaseAdmin();
  if (!db) return { ok: false, error: "The site isn't connected to its database yet." };

  const { error } = await db.from("memories").insert({
    name,
    relationships: rels,
    relationship_detail: relationshipDetail || null,
    year_from: yearFrom,
    year_to: yearTo,
    location: location || null,
    memory,
    photo_paths: photoPaths,
    youtube_url: youtubeUrl || null,
    email: email || null,
  });
  if (error) {
    console.error("Failed to save memory", error);
    return { ok: false, error: "We couldn't save your memory. Please try again in a moment." };
  }
  return { ok: true };
}
