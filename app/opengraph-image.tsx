import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { site } from "@/site.config";

export const alt = `Remember ${site.name}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// The preview card shown when the link is pasted into a text, Facebook, etc.
export default async function Image() {
  let photo: string | null = null;
  if (site.photo) {
    const ext = site.photo.split(".").pop()?.toLowerCase();
    const mime = ext === "png" ? "image/png" : "image/jpeg";
    const data = await readFile(join(process.cwd(), "public", site.photo));
    photo = `data:${mime};base64,${data.toString("base64")}`;
  }

  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", background: "#faf6ef", color: "#2b2420" }}>
        {photo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={photo} alt="" width={504} height={630} style={{ objectFit: "cover", objectPosition: "center 30%" }} />
        ) : (
          <div style={{ width: 504, height: 630, display: "flex", alignItems: "center", justifyContent: "center", background: "#7a2e2e", color: "#faf6ef", fontSize: 160 }}>
            FJ
          </div>
        )}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", padding: "0 64px" }}>
          <div style={{ fontSize: 28, letterSpacing: 4, textTransform: "uppercase", color: "#7a2e2e" }}>In loving memory</div>
          <div style={{ fontSize: 76, fontWeight: 700, lineHeight: 1.05, marginTop: 20 }}>{site.name}</div>
          {site.lifespan && <div style={{ fontSize: 34, marginTop: 12, color: "#6b5f55" }}>{site.lifespan}</div>}
          <div style={{ fontSize: 34, marginTop: 40, color: "#4a3f38" }}>Share a memory, a photo or a story.</div>
        </div>
      </div>
    ),
    size,
  );
}
