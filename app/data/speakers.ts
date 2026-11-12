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
    bio: "With over a decade of experience guiding leaders through organizational change, Speaker 1 blends evidence-based coaching methods with real-world business acumen to help teams navigate uncertainty and grow.",
    initials: "S1",
  },
  {
    id: "speaker-2",
    name: "Speaker 2",
    role: "Keynote Speaker",
    company: "Coaching Organization",
    bio: "A sought-after voice in executive coaching, Speaker 2 has worked with senior leaders across Asia Pacific to build resilient, high-performing cultures rooted in trust and accountability.",
    initials: "S2",
  },
  {
    id: "speaker-3",
    name: "Speaker 3",
    role: "Panel Speaker",
    company: "Coaching Organization",
    bio: "Speaker 3 specializes in cross-cultural coaching practices, helping organizations bridge communication gaps and build inclusive leadership pipelines across diverse teams.",
    initials: "S3",
  },
  {
    id: "speaker-4",
    name: "Speaker 4",
    role: "Panel Speaker",
    company: "Coaching Organization",
    bio: "Drawing on a background in psychology and organizational development, Speaker 4 explores how coaching can drive sustainable behavioral change at both the individual and systemic level.",
    initials: "S4",
  },
  {
    id: "speaker-5",
    name: "Speaker 5",
    role: "Workshop Facilitator",
    company: "Coaching Organization",
    bio: "Speaker 5 designs hands-on coaching workshops that turn theory into practice, equipping participants with practical tools they can apply the moment they leave the room.",
    initials: "S5",
  },
  {
    id: "speaker-6",
    name: "Speaker 6",
    role: "Workshop Facilitator",
    company: "Coaching Organization",
    bio: "A certified coach and trainer, Speaker 6 focuses on building coaching capability within organizations, helping managers become better everyday coaches to their teams.",
    initials: "S6",
  },
];

export const speakers: Speaker[] = rawSpeakers.map((speaker, index) => ({
  ...speaker,
  color: avatarPalette[index % avatarPalette.length],
}));
