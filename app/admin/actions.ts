"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { endSession, passwordMatches, requireAdmin, startSession } from "@/lib/admin-auth";
import { PHOTO_BUCKET, supabaseAdmin } from "@/lib/supabase";
import type { MemoryStatus } from "@/lib/memories";

export async function login(_: unknown, formData: FormData) {
  if (!process.env.ADMIN_PASSWORD) return { error: "ADMIN_PASSWORD isn't set in the hosting settings." };
  if (!passwordMatches(String(formData.get("password") ?? ""))) {
    await new Promise((r) => setTimeout(r, 800));
    return { error: "That password isn't right." };
  }
  await startSession();
  redirect("/admin");
}

export async function logout() {
  await endSession();
  redirect("/admin");
}

export async function setStatus(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id"));
  const status = String(formData.get("status")) as MemoryStatus;
  if (!["pending", "approved", "rejected"].includes(status)) throw new Error("Bad status");
  const db = supabaseAdmin()!;
  const { error } = await db
    .from("memories")
    .update({ status, approved_at: status === "approved" ? new Date().toISOString() : null })
    .eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/");
  revalidatePath("/admin");
}

export async function deleteMemory(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id"));
  const db = supabaseAdmin()!;
  const { data, error } = await db.from("memories").delete().eq("id", id).select("photo_paths").single();
  if (error) throw new Error(error.message);
  if (data?.photo_paths?.length) await db.storage.from(PHOTO_BUCKET).remove(data.photo_paths);
  revalidatePath("/");
  revalidatePath("/admin");
}
