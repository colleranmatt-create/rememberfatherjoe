import { relationshipLabel } from "@/site.config";
import { formatYears, type PublicMemory } from "@/lib/memories";
import { youtubeId } from "@/lib/youtube";
import PhotoGrid from "./PhotoGrid";
import YouTubeEmbed from "./YouTubeEmbed";

export default function MemoryCard({ memory, children }: { memory: PublicMemory; children?: React.ReactNode }) {
  const years = formatYears(memory.year_from, memory.year_to);
  const video = memory.youtube_url ? youtubeId(memory.youtube_url) : null;

  return (
    <article className="card" id={`memory-${memory.id}`}>
      <header>
        <h3>{memory.name}</h3>
        <p className="meta">
          {memory.relationships.map((r) => (
            <span className="tag" key={r}>
              {relationshipLabel(r)}
            </span>
          ))}
          {memory.relationship_detail && <span>{memory.relationship_detail}</span>}
          {years && <span>{years}</span>}
          {memory.location && <span>{memory.location}</span>}
        </p>
      </header>
      <p className="memory-text">{memory.memory}</p>
      <PhotoGrid photos={memory.photos} name={memory.name} />
      {video && <YouTubeEmbed id={video} />}
      {children}
    </article>
  );
}
