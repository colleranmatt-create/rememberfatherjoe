import Link from "next/link";
import { site } from "@/site.config";
import { getApprovedMemories } from "@/lib/memories";
import MemoryCard from "@/components/MemoryCard";

// The page is cached and rebuilt when a memory is approved; this is a safety net.
export const revalidate = 300;

export default async function Home() {
  const memories = await getApprovedMemories();

  return (
    <main>
      <section className="hero">
        <div className="container narrow">
          {site.photo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img className="portrait portrait-photo" src={site.photo} alt={site.photoAlt} width={800} height={982} fetchPriority="high" />
          ) : (
            <div className="portrait portrait-placeholder" aria-hidden="true">
              FJ
            </div>
          )}
          <p className="eyebrow">In loving memory</p>
          <h1>{site.name}</h1>
          {site.lifespan && <p className="lifespan">{site.lifespan}</p>}
          <div className="tribute">
            {site.tribute.map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>
          <Link href="/share" className="button button-large button-gold">
            Share a memory
          </Link>
          {memories.length > 0 && (
            <p className="hero-link">
              <a href="#memories">
                Read {memories.length} {memories.length === 1 ? "memory" : "memories"} ↓
              </a>
            </p>
          )}
        </div>
      </section>

      {site.services.length > 0 && (
        <section className="container narrow services" aria-labelledby="services-heading">
          <h2 id="services-heading">Services</h2>
          {site.services.map((s) => (
            <div className="service" key={s.title + s.when}>
              {s.title && <h3>{s.title}</h3>}
              <p>
                <strong>{s.when}</strong>
                {s.time && <> · {s.time}</>}
              </p>
              {s.where && (
                <p>{s.mapUrl ? <a href={s.mapUrl} target="_blank" rel="noopener noreferrer">{s.where}</a> : s.where}</p>
              )}
            </div>
          ))}
          {site.servicesNote && <p className="services-note">{site.servicesNote}</p>}
        </section>
      )}

      <section className="container wall" id="memories" aria-labelledby="memories-heading">
        <h2 id="memories-heading">Memories</h2>
        {memories.length === 0 ? (
          <div className="empty">
            <p>No memories have been shared yet. Yours could be the first.</p>
            <Link href="/share" className="button">
              Share a memory
            </Link>
          </div>
        ) : (
          <div className="cards">
            {memories.map((m) => (
              <MemoryCard key={m.id} memory={m} />
            ))}
          </div>
        )}
      </section>

      {memories.length > 2 && (
        <div className="container narrow closing">
          <Link href="/share" className="button button-large">
            Share a memory
          </Link>
        </div>
      )}
    </main>
  );
}
