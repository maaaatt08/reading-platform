import type { Status } from "./types";

export const STATUS_LABELS: Record<Status, string> = {
  to_read: "À lire",
  reading: "En cours",
  read: "Lu",
  dnf: "Abandonné",
};

export const STATUS_OPTIONS: Status[] = ["to_read", "reading", "read", "dnf"];

export const MOOD_OPTIONS = [
  "dark",
  "emotional",
  "funny",
  "hopeful",
  "mysterious",
  "reflective",
  "tense",
  "adventurous",
];

export const PACE_OPTIONS = ["slow", "medium", "fast"];
