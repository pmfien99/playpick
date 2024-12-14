export type Team = {
  id: string;
  full_name: string;
  short_name: string;
  logo_url: string;
};

export enum PlayState {
  OPEN = "play_open",
  STARTED = "play_started",
  CLOSED = "play_closed",
  ARCHIVED = "play_archived",
};