export type CommitteeMember = {
  id: string;
  name: string;
  role: string;
  organization: string;
  initials: string;
  color: string;
};

const avatarPalette = ["#1f4d46", "#c75b39", "#d9a441", "#4c7a5e", "#2b6cb0", "#8b5cf6"];

const rawCommittee: Omit<CommitteeMember, "color">[] = [
  {
    id: "committee-1",
    name: "Committee Member 1",
    role: "Conference Chair",
    organization: "Asia Pacific Alliance of Coaches",
    initials: "C1",
  },
  {
    id: "committee-2",
    name: "Committee Member 2",
    role: "Program Director",
    organization: "Asia Pacific Alliance of Coaches",
    initials: "C2",
  },
  {
    id: "committee-3",
    name: "Committee Member 3",
    role: "Local Organizing Chair",
    organization: "Loop Institute of Coaching",
    initials: "C3",
  },
  {
    id: "committee-4",
    name: "Committee Member 4",
    role: "Logistics & Venue Lead",
    organization: "Loop Institute of Coaching",
    initials: "C4",
  },
  {
    id: "committee-5",
    name: "Committee Member 5",
    role: "Partnerships & Sponsorship Lead",
    organization: "Asia Pacific Alliance of Coaches",
    initials: "C5",
  },
  {
    id: "committee-6",
    name: "Committee Member 6",
    role: "Marketing & Communications Lead",
    organization: "Loop Institute of Coaching",
    initials: "C6",
  },
];

export const committeeMembers: CommitteeMember[] = rawCommittee.map((member, index) => ({
  ...member,
  color: avatarPalette[index % avatarPalette.length],
}));
