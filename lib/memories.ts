import "server-only";
import { photoUrl, supabaseAdmin } from "./supabase";

export type MemoryStatus = "pending" | "approved" | "rejected";

// What the public wall may show. Deliberately excludes email.
export type PublicMemory = {
  id: string;
  created_at: string;
  name: string;
  relationships: string[];
  relationship_detail: string | null;
  year_from: number | null;
  year_to: number | null;
  location: string | null;
  memory: string;
  photos: string[];
  youtube_url: string | null;
};

export type AdminMemory = PublicMemory & { status: MemoryStatus; email: string | null; photo_paths: string[] };

const PUBLIC_COLUMNS =
  "id, created_at, name, relationships, relationship_detail, year_from, year_to, location, memory, photo_paths, youtube_url";

type Row = Omit<PublicMemory, "photos"> & { photo_paths: string[] };

function withPhotos<T extends Row>(row: T) {
  return { ...row, photos: row.photo_paths.map(photoUrl) };
}

export async function getApprovedMemories(): Promise<PublicMemory[]> {
  const db = supabaseAdmin();
  if (!db) return [];
  const { data, error } = await db
    .from("memories")
    .select(PUBLIC_COLUMNS)
    .eq("status", "approved")
    .order("created_at", { ascending: false })
    .limit(2000);
  if (error) {
    console.error("Failed to load memories", error);
    return [];
  }
  return (data as Row[]).map(({ photo_paths, ...row }) => ({ ...row, photos: photo_paths.map(photoUrl) }));
}

export async function getMemoriesForAdmin(status: MemoryStatus): Promise<AdminMemory[]> {
  const db = supabaseAdmin();
  if (!db) return [];
  const { data, error } = await db
    .from("memories")
    .select(`${PUBLIC_COLUMNS}, status, email`)
    .eq("status", status)
    .order("created_at", { ascending: false })
    .limit(2000);
  if (error) throw new Error(error.message);
  return (data as (Row & { status: MemoryStatus; email: string | null })[]).map(withPhotos);
}

export async function countByStatus(): Promise<Record<MemoryStatus, number>> {
  const db = supabaseAdmin();
  const counts = { pending: 0, approved: 0, rejected: 0 };
  if (!db) return counts;
  await Promise.all(
    (Object.keys(counts) as MemoryStatus[]).map(async (status) => {
      const { count } = await db.from("memories").select("id", { count: "exact", head: true }).eq("status", status);
      counts[status] = count ?? 0;
    }),
  );
  return counts;
}

export function formatYears(from: number | null, to: number | null) {
  if (from && to && from !== to) return `${from}–${to}`;
  return String(from ?? to ?? "");
}
