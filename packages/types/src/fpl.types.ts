// Raw FPL API response shapes

export interface FplBootstrapStatic {
  events: FplEvent[];
  teams: FplTeam[];
  elements: FplElement[];
  element_types: FplElementType[];
}

export interface FplEvent {
  id: number;
  name: string;
  deadline_time: string;
  average_entry_score: number;
  finished: boolean;
  data_checked: boolean;
  highest_scoring_entry: number;
  deadline_time_epoch: number;
  deadline_time_game_offset: number;
  highest_score: number;
  is_previous: boolean;
  is_current: boolean;
  is_next: boolean;
  chip_plays: FplChipPlay[];
  most_selected: number;
  most_transferred_in: number;
  top_element: number;
  top_element_info: { id: number; points: number };
  transfers_made: number;
}

export interface FplChipPlay {
  chip_name: string;
  num_played: number;
}

export interface FplTeam {
  id: number;
  name: string;
  short_name: string;
  code: number;
  draw: number;
  loss: number;
  win: number;
  played: number;
  points: number;
  position: number;
  strength: number;
  strength_overall_home: number;
  strength_overall_away: number;
  strength_attack_home: number;
  strength_attack_away: number;
  strength_defence_home: number;
  strength_defence_away: number;
  pulse_id: number;
}

export interface FplElementType {
  id: number;
  plural_name: string;
  plural_name_short: string;
  singular_name: string;
  singular_name_short: string; // GKP | DEF | MID | FWD
}

export interface FplElement {
  id: number;
  first_name: string;
  second_name: string;
  web_name: string;
  team: number;
  element_type: number;
  code: number;
  status: string;
  news: string;
  now_cost: number;
  cost_change_start: number;
  cost_change_event: number;
  selected_by_percent: string;
  total_points: number;
  points_per_game: string;
  form: string;
  value_form: string;
  value_season: string;
  minutes: number;
  goals_scored: number;
  assists: number;
  clean_sheets: number;
  goals_conceded: number;
  own_goals: number;
  penalties_saved: number;
  penalties_missed: number;
  yellow_cards: number;
  red_cards: number;
  saves: number;
  bonus: number;
  bps: number;
  influence: string;
  creativity: string;
  threat: string;
  ict_index: string;
  transfers_in: number;
  transfers_out: number;
  transfers_in_event: number;
  transfers_out_event: number;
  dreamteam_count: number;
  in_dreamteam: boolean;
}

export interface FplFixture {
  id: number;
  event: number | null;
  team_h: number;
  team_a: number;
  team_h_score: number | null;
  team_a_score: number | null;
  kickoff_time: string | null;
  finished: boolean;
  finished_provisional: boolean;
  started: boolean | null;
  team_h_difficulty: number;
  team_a_difficulty: number;
  pulse_id: number;
  stats: FplFixtureStat[];
}

export interface FplFixtureStat {
  identifier: string;
  h: { value: number; element: number }[];
  a: { value: number; element: number }[];
}

export interface FplEventLive {
  elements: FplEventLiveElement[];
}

export interface FplEventLiveElement {
  id: number;
  stats: FplEventLiveStats;
  explain: FplEventLiveExplain[];
}

export interface FplEventLiveStats {
  minutes: number;
  goals_scored: number;
  assists: number;
  clean_sheets: number;
  goals_conceded: number;
  own_goals: number;
  penalties_saved: number;
  penalties_missed: number;
  yellow_cards: number;
  red_cards: number;
  saves: number;
  bonus: number;
  bps: number;
  influence: string;
  creativity: string;
  threat: string;
  ict_index: string;
  total_points: number;
  in_dreamteam: boolean;
}

export interface FplEventLiveExplain {
  fixture: number;
  stats: { identifier: string; points: number; value: number }[];
}

export interface FplElementSummary {
  fixtures: FplElementFixture[];
  history: FplElementHistory[];
  history_past: FplElementHistoryPast[];
}

export interface FplElementFixture {
  id: number;
  event: number;
  finished: boolean;
  kickoff_time: string;
  team_h: number;
  team_a: number;
  team_h_score: number | null;
  team_a_score: number | null;
  is_home: boolean;
  difficulty: number;
}

export interface FplElementHistory {
  element: number;
  fixture: number;
  opponent_team: number;
  total_points: number;
  was_home: boolean;
  kickoff_time: string;
  team_h_score: number;
  team_a_score: number;
  round: number;
  minutes: number;
  goals_scored: number;
  assists: number;
  clean_sheets: number;
  goals_conceded: number;
  own_goals: number;
  penalties_saved: number;
  penalties_missed: number;
  yellow_cards: number;
  red_cards: number;
  saves: number;
  bonus: number;
  bps: number;
  influence: string;
  creativity: string;
  threat: string;
  ict_index: string;
  value: number;
  transfers_balance: number;
  selected: number;
  transfers_in: number;
  transfers_out: number;
}

export interface FplElementHistoryPast {
  season_name: string;
  element_code: number;
  start_cost: number;
  end_cost: number;
  total_points: number;
  minutes: number;
  goals_scored: number;
  assists: number;
  clean_sheets: number;
  goals_conceded: number;
  own_goals: number;
  penalties_saved: number;
  penalties_missed: number;
  yellow_cards: number;
  red_cards: number;
  saves: number;
  bonus: number;
  bps: number;
  influence: string;
  creativity: string;
  threat: string;
  ict_index: string;
}
