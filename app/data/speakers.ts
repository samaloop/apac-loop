export type Speaker = {
  id: string;
  name: string;
  role: string;
  company: string;
  bio: string;
  initials: string;
  color: string;
};

const avatarPalette = ["#1f4d46", "#c75b39", "#d9a441", "#4c7a5e", "#2b6cb0", "#8b5cf6"];

const rawSpeakers: Omit<Speaker, "color">[] = [
  {
    id: "speaker-1",
    name: "Speaker 1",
    role: "Keynote Speaker",
    company: "Coaching Organization",
    bio: "Speaker bio coming soon.",
    initials: "S1",
  },
  {
    id: "speaker-2",
    name: "Speaker 2",
    role: "Keynote Speaker",
    company: "Coaching Organization",
    bio: "Speaker bio coming soon.",
    initials: "S2",
  },
  {
    id: "speaker-3",
    name: "Speaker 3",
    role: "Panel Speaker",
    company: "Coaching Organization",
    bio: "Speaker bio coming soon.",
    initials: "S3",
  },
  {
    id: "speaker-4",
    name: "Speaker 4",
    role: "Panel Speaker",
    company: "Coaching Organization",
    bio: "Speaker bio coming soon.",
    initials: "S4",
  },
  {
    id: "speaker-5",
    name: "Speaker 5",
    role: "Workshop Facilitator",
    company: "Coaching Organization",
    bio: "Speaker bio coming soon.",
    initials: "S5",
  },
  {
    id: "speaker-6",
    name: "Speaker 6",
    role: "Workshop Facilitator",
    company: "Coaching Organization",
    bio: "Speaker bio coming soon.",
    initials: "S6",
  },
];

export const speakers: Speaker[] = rawSpeakers.map((speaker, index) => ({
  ...speaker,
  color: avatarPalette[index % avatarPalette.length],
}));
