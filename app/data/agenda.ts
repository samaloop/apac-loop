export type Session = {
  time: string;
  title: string;
  description: string;
};

export type AgendaDayData = {
  day: string;
  date: string;
  sessions: Session[];
};

export const agenda: AgendaDayData[] = [
  {
    day: "Day 1",
    date: "22 September 2026",
    sessions: [
      {
        time: "08:00",
        title: "Registration & Welcome Coffee",
        description: "Check in, collect your badge, and meet fellow attendees.",
      },
      {
        time: "09:00",
        title: "Opening Keynote",
        description: "Speaker 1 opens the summit with a look at coaching's next decade.",
      },
      {
        time: "10:30",
        title: "Panel: The Future of Coaching",
        description: "A moderated discussion with speakers on trends shaping the profession.",
      },
      {
        time: "12:00",
        title: "Lunch",
        description: "Buffet lunch and informal networking.",
      },
      {
        time: "13:30",
        title: "Workshop Tracks (Parallel Sessions)",
        description: "Choose from breakout workshops on team coaching, leadership, and career transitions.",
      },
      {
        time: "16:00",
        title: "Networking Reception",
        description: "Casual mixer to close out Day 1.",
      },
    ],
  },
  {
    day: "Day 2",
    date: "23 September 2026",
    sessions: [
      {
        time: "08:30",
        title: "Morning Coffee",
        description: "Light refreshments before the day begins.",
      },
      {
        time: "09:00",
        title: "Keynote: Coaching Cultures That Stick",
        description: "Speaker 4 on building coaching practices that outlast a single workshop.",
      },
      {
        time: "10:30",
        title: "Case Studies from the Field",
        description: "Short talks from practicing coaches on real client engagements.",
      },
      {
        time: "12:00",
        title: "Lunch",
        description: "Buffet lunch and informal networking.",
      },
      {
        time: "13:30",
        title: "Workshop Tracks (Parallel Sessions)",
        description: "A second round of breakout workshops, open to all attendees.",
      },
      {
        time: "15:30",
        title: "Closing Panel & Takeaways",
        description: "Speakers reflect on the summit and share what's next for the community.",
      },
      {
        time: "16:30",
        title: "Closing Remarks",
        description: "Loop Institute of Coaching wraps up the summit.",
      },
    ],
  },
];
