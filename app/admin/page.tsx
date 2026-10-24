import type { Metadata } from "next";
import Link from "next/link";
import { isAdmin } from "@/lib/admin-auth";
import { countByStatus, getMemoriesForAdmin, type MemoryStatus } from "@/lib/memories";
import { supabaseAdmin } from "@/lib/supabase";
import MemoryCard from "@/components/MemoryCard";
import ConfirmButton from "@/components/ConfirmButton";
import LoginForm from "./LoginForm";
import { deleteMemory, logout, setStatus } from "./actions";

export const metadata: Metadata = { title: "Admin", robots: { index: false, follow: false } };

const TABS: { status: MemoryStatus; label: string }[] = [
  { status: "pending", label: "Waiting" },
  { status: "approved", label: "On the wall" },
  { status: "rejected", label: "Hidden" },
];

export default async function AdminPage({ searchParams }: { searchParams: Promise<{ tab?: string }> }) {
  if (!(await isAdmin())) {
    return (
      <main className="container narrow">
        <h1 className="page-title">Admin</h1>
        <LoginForm />
      </main>
    );
  }

  if (!supabaseAdmin()) {
    return (
      <main className="container narrow">
        <h1 className="page-title">Admin</h1>
        <p className="form-error">SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY aren&apos;t set in the hosting settings.</p>
      </main>
    );
  }

  const { tab } = await searchParams;
  const status = TABS.find((t) => t.status === tab)?.status ?? "pending";
  const [memories, counts] = await Promise.all([getMemoriesForAdmin(status), countByStatus()]);

  return (
    <main className="container admin">
      <div className="admin-header">
        <h1 className="page-title">Review memories</h1>
        <form action={logout}>
          <button className="link-button">Sign out</button>
        </form>
      </div>
      <nav className="tabs">
        {TABS.map((t) => (
          <Link key={t.status} href={`/admin?tab=${t.status}`} className={t.status === status ? "active" : ""}>
            {t.label} <span className="count">{counts[t.status]}</span>
          </Link>
        ))}
      </nav>

      {memories.length === 0 ? (
        <p className="empty">{status === "pending" ? "Nothing waiting for review." : "Nothing here."}</p>
      ) : (
        <div className="cards">
          {memories.map((m) => (
            <MemoryCard key={m.id} memory={m}>
              <div className="admin-info">
                <span>Sent {new Date(m.created_at).toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short", timeZone: "America/New_York" })}</span>
                {m.email && (
                  <span>
                    Email (private): <a href={`mailto:${m.email}`}>{m.email}</a>
                  </span>
                )}
              </div>
              <div className="admin-actions">
                {status !== "approved" && (
                  <form action={setStatus}>
                    <input type="hidden" name="id" value={m.id} />
                    <input type="hidden" name="status" value="approved" />
                    <button className="button">Approve</button>
                  </form>
                )}
                {status !== "rejected" && (
                  <form action={setStatus}>
                    <input type="hidden" name="id" value={m.id} />
                    <input type="hidden" name="status" value="rejected" />
                    <button className="button button-quiet">{status === "approved" ? "Take down" : "Hide"}</button>
                  </form>
                )}
                {status === "rejected" && (
                  <form action={deleteMemory}>
                    <input type="hidden" name="id" value={m.id} />
                    <ConfirmButton className="button button-danger" message="Delete this memory and its photos permanently?">
                      Delete forever
                    </ConfirmButton>
                  </form>
                )}
              </div>
            </MemoryCard>
          ))}
        </div>
      )}
    </main>
  );
}
