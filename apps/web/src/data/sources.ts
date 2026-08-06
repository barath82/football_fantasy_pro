export type SourceType = "website" | "youtube" | "x" | "podcast" | "community" | "tool";

export interface Source {
  id: string;
  name: string;
  website: string;
  type: SourceType;
  description: string;
}

export const SOURCES: Source[] = [
  {
    id: "allaboutfpl",
    name: "AllAboutFPL",
    website: "https://allaboutfpl.com",
    type: "website",
    description: "Free FPL articles covering captaincy, transfers, differentials, scout picks and gameweek guides."
  },
  {
    id: "fantasy-football-scout",
    name: "Fantasy Football Scout",
    website: "https://www.fantasyfootballscout.co.uk",
    type: "website",
    description: "Major FPL content and tools site with gameweek guides, team news, scout picks and analysis."
  },
  {
    id: "fantasy-football-hub",
    name: "Fantasy Football Hub",
    website: "https://www.fantasyfootballhub.co.uk",
    type: "website",
    description: "FPL tips, player predictions, AI tools, points projections and premium analysis."
  },
  {
    id: "official-fpl-scout",
    name: "Official FPL Scout",
    website: "https://www.premierleague.com/en/fantasy-news",
    type: "website",
    description: "Official Premier League fantasy news, tips and FPL content."
  },
  {
    id: "fpl-team",
    name: "fpl.team",
    website: "https://fpl.team",
    type: "tool",
    description: "FPL transfer planning, predictions, fixture predictions and squad analysis tools."
  },
  {
    id: "lets-talk-fpl",
    name: "Let's Talk FPL",
    website: "https://www.youtube.com/@LetsTalkFPL",
    type: "youtube",
    description: "Popular FPL YouTube channel and podcast by Andy."
  },
  {
    id: "fpl-general",
    name: "FPL General",
    website: "https://x.com/FPLGeneral",
    type: "x",
    description: "FPL veteran and podcast creator."
  },
  {
    id: "official-fpl-x",
    name: "Official FPL on X",
    website: "https://x.com/OfficialFPL",
    type: "x",
    description: "Official Fantasy Premier League social account."
  },
  {
    id: "fantasypl-reddit",
    name: "r/FantasyPL",
    website: "https://www.reddit.com/r/FantasyPL/",
    type: "community",
    description: "Large Reddit community dedicated to Fantasy Premier League."
  },
  {
    id: "lets-talk-fpl-podcast",
    name: "Let's Talk FPL Podcast",
    website: "https://podcasts.apple.com/gb/podcast/lets-talk-fpl/id1698716193",
    type: "podcast",
    description: "Weekly FPL podcast content from Let's Talk FPL."
  }
];
