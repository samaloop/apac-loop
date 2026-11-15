export type Pillar = {
  id: string;
  title: string;
  short: string;
  question: string;
  description: string;
};

export const pillars: Pillar[] = [
  {
    id: "inspiring-people",
    title: "Inspiring People",
    short: "People",
    question: "How do we help people grow, lead, and create meaningful impact?",
    description:
      "Helping people unlock their potential and lead with purpose.",
  },
  {
    id: "transforming-systems",
    title: "Transforming Systems",
    short: "Systems",
    question: "How do we create change that extends beyond the individual?",
    description:
      "Creating more conscious, sustainable and human-centred organisations.",
  },
  {
    id: "shaping-society",
    title: "Shaping Society",
    short: "Society",
    question: "How can coaching contribute to the communities and societies we're part of?",
    description:
      "Contributing to a more inclusive, connected and empowered future.",
  },
];
