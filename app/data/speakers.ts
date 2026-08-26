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
    id: "amelia-santoso",
    name: "Dr. Amelia Santoso",
    role: "Executive Coach & Founder",
    company: "Loop Institute of Coaching",
    bio: "Amelia has spent over 15 years coaching senior leaders across Southeast Asia, and founded Loop Institute to grow a professional coaching community in Indonesia.",
    initials: "AS",
  },
  {
    id: "bagus-wirawan",
    name: "Bagus Wirawan",
    role: "Master Certified Coach",
    company: "ICF Indonesia",
    bio: "Bagus is one of Indonesia's most experienced ICF-credentialed coaches, focused on coach supervision and raising the bar for coaching practice nationally.",
    initials: "BW",
  },
  {
    id: "clara-dewanti",
    name: "Clara Dewanti",
    role: "Leadership Coach",
    company: "Growth Partners",
    bio: "Clara works with mid-to-senior leaders navigating change, blending coaching with practical leadership frameworks drawn from her own corporate background.",
    initials: "CD",
  },
  {
    id: "fajar-nugroho",
    name: "Fajar Nugroho",
    role: "Organizational Psychologist",
    company: "Talenta Consulting",
    bio: "Fajar bridges psychology and organizational design, helping companies build coaching cultures that stick beyond a single workshop.",
    initials: "FN",
  },
  {
    id: "kirana-putri",
    name: "Kirana Putri",
    role: "Team Coaching Specialist",
    company: "Kirana & Co",
    bio: "Kirana specializes in systemic team coaching, helping leadership teams work through conflict and align around shared goals.",
    initials: "KP",
  },
  {
    id: "raka-pradana",
    name: "Raka Pradana",
    role: "Career Transition Coach",
    company: "NextStep Coaching",
    bio: "Raka supports professionals through major career pivots, drawing on his own transition from finance into coaching a decade ago.",
    initials: "RP",
  },
];

export const speakers: Speaker[] = rawSpeakers.map((speaker, index) => ({
  ...speaker,
  color: avatarPalette[index % avatarPalette.length],
}));
