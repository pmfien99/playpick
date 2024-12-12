export type Team = {
  id: string;
  full_name: string;
  short_name: string;
  logo_url: string;
};

export type Drive = {
  drive_id: string;
  is_active: boolean;
  match_id: string;
  start_time: string;
  team_id: string;
};

export enum PlayState {
  OPEN = "play_open",
  STARTED = "play_started",
  CLOSED = "play_closed",
  ARCHIVED = "play_archived",
};