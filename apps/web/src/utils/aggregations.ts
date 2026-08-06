import type { ContentLink, ContentType } from '../data/contentLinks';
import type { Source } from '../data/sources';

export function getGWContent(gw: number, links: ContentLink[]): ContentLink[] {
  return links.filter(l => l.gameweek === gw);
}

export function getContentByType(links: ContentLink[], type: ContentType): ContentLink[] {
  return links.filter(l => l.contentType === type);
}

export function getPlayerMentionMap(links: ContentLink[]): Map<string, number> {
  const counts = new Map<string, number>();
  for (const link of links) {
    for (const player of link.playersMentioned) {
      const key = player.trim();
      counts.set(key, (counts.get(key) ?? 0) + 1);
    }
  }
  return counts;
}

export function getSortedPlayerMentions(links: ContentLink[]): Array<{ name: string; count: number }> {
  const map = getPlayerMentionMap(links);
  return Array.from(map.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);
}

export function getSortedTeamMentions(links: ContentLink[]): Array<{ name: string; count: number }> {
  const counts = new Map<string, number>();
  for (const link of links) {
    for (const team of link.teamsMentioned) {
      const key = team.trim();
      counts.set(key, (counts.get(key) ?? 0) + 1);
    }
  }
  return Array.from(counts.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);
}

export function getContentTypeDistribution(
  links: ContentLink[]
): Array<{ type: ContentType; count: number }> {
  const counts = new Map<ContentType, number>();
  for (const link of links) {
    counts.set(link.contentType, (counts.get(link.contentType) ?? 0) + 1);
  }
  return Array.from(counts.entries())
    .map(([type, count]) => ({ type, count }))
    .sort((a, b) => b.count - a.count);
}

export function getActiveSourceIds(links: ContentLink[]): Set<string> {
  return new Set(links.map(l => l.sourceId));
}

export function getActiveSources(links: ContentLink[], sources: Source[]): Source[] {
  const activeIds = getActiveSourceIds(links);
  return sources.filter(s => activeIds.has(s.id));
}

export function getLinkCountPerSource(links: ContentLink[]): Map<string, number> {
  const counts = new Map<string, number>();
  for (const link of links) {
    counts.set(link.sourceId, (counts.get(link.sourceId) ?? 0) + 1);
  }
  return counts;
}

export function getSourceActiveGWs(sourceId: string, links: ContentLink[]): number[] {
  return [...new Set(links.filter(l => l.sourceId === sourceId).map(l => l.gameweek))].sort(
    (a, b) => a - b
  );
}

export function getContentForPlayer(playerName: string, links: ContentLink[]): ContentLink[] {
  const lower = playerName.toLowerCase();
  return links.filter(l =>
    l.playersMentioned.some(p => p.toLowerCase() === lower)
  );
}

export function getMostDiscussedPlayer(links: ContentLink[]): string {
  const sorted = getSortedPlayerMentions(links);
  return sorted[0]?.name ?? 'N/A';
}

export function getTopContentType(links: ContentLink[]): string {
  const dist = getContentTypeDistribution(links);
  return dist[0]?.type ?? 'N/A';
}

export function filterBySearch(links: ContentLink[], query: string): ContentLink[] {
  const q = query.trim().toLowerCase();
  if (!q) return links;
  return links.filter(l => {
    return (
      l.title.toLowerCase().includes(q) ||
      l.summary.toLowerCase().includes(q) ||
      l.sourceName.toLowerCase().includes(q) ||
      (l.expertName?.toLowerCase().includes(q) ?? false) ||
      l.playersMentioned.some(p => p.toLowerCase().includes(q)) ||
      l.teamsMentioned.some(t => t.toLowerCase().includes(q)) ||
      l.tags.some(t => t.toLowerCase().includes(q)) ||
      l.contentType.toLowerCase().includes(q)
    );
  });
}

export function formatDate(dateStr?: string): string {
  if (!dateStr) return '';
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: '2-digit' });
  } catch {
    return dateStr;
  }
}

export function getAllPlayers(links: ContentLink[]): string[] {
  const set = new Set<string>();
  for (const link of links) {
    for (const p of link.playersMentioned) set.add(p.trim());
  }
  return Array.from(set).sort();
}

export function getAllTeams(links: ContentLink[]): string[] {
  const set = new Set<string>();
  for (const link of links) {
    for (const t of link.teamsMentioned) set.add(t.trim());
  }
  return Array.from(set).sort();
}

export function getAllExperts(links: ContentLink[]): string[] {
  const set = new Set<string>();
  for (const link of links) {
    if (link.expertName) set.add(link.expertName);
  }
  return Array.from(set).sort();
}
