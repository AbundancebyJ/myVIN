import type { MetadataRoute } from "next";
import { getIndex, hubIndexable, makesIn, modelsIn } from "@/lib/data";
import { abs } from "@/lib/site";
import { makePath, modelPath, vehiclePath } from "@/lib/slug";

export const dynamic = "force-static";

/** Only indexable pages are listed; noindex pages are deliberately left out. */
export default function sitemap(): MetadataRoute.Sitemap {
  const index = getIndex();
  const latest = index.reduce((a, e) => (e.fetchedAt > a ? e.fetchedAt : a), "") || undefined;
  const entries: MetadataRoute.Sitemap = [
    { url: abs("/"), changeFrequency: "weekly", priority: 1 },
    { url: abs("/recalls/"), lastModified: latest, changeFrequency: "weekly", priority: 0.8 },
  ];
  for (const mk of makesIn(index)) {
    const models = modelsIn(mk.slug, index);
    if (hubIndexable(models.length)) entries.push({ url: abs(makePath(mk.name)), lastModified: latest, priority: 0.5 });
    for (const m of models) {
      if (hubIndexable(m.years.length)) entries.push({ url: abs(modelPath(m.make, m.name)), lastModified: latest, priority: 0.6 });
    }
  }
  for (const e of index) {
    if (!e.indexable) continue;
    entries.push({
      url: abs(vehiclePath(e.make, e.model, e.year)),
      lastModified: e.fetchedAt,
      changeFrequency: "weekly",
      priority: 0.7,
    });
  }
  for (const p of ["/about/", "/contact/", "/privacy/", "/terms/"]) entries.push({ url: abs(p), priority: 0.2 });
  return entries;
}
