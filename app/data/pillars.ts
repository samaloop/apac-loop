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
      "Coaching that helps individuals grow into their fullest capacity as leaders, professionals, and humans.",
  },
  {
    id: "transforming-systems",
    title: "Transforming Systems",
    short: "Systems",
    question: "How do we create change that extends beyond the individual?",
    description:
      "Moving beyond one-on-one coaching to reshape how teams, organizations, and institutions work.",
  },
  {
    id: "shaping-society",
    title: "Shaping Society",
    short: "Society",
    question: "How can coaching contribute to the communities and societies we're part of?",
    description:
      "Extending coaching's impact beyond the workplace, into communities and the systems that shape everyday life.",
  },
];
