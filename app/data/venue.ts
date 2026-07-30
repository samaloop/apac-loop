export const venue = {
  name: "Bali Nusa Dua Convention Center (BNDCC)",
  address: "Kawasan ITDC, Jl. Raya Nusa Dua Selatan, Nusa Dua, Bali 80363",
  description:
    "Set within the Nusa Dua resort enclave, BNDCC is a short walk from beachfront hotels and about 20 minutes from Ngurah Rai International Airport (DPS) by car.",
};

export type Hotel = {
  id: string;
  name: string;
  distance: string;
  description: string;
};

export const hotels: Hotel[] = [
  {
    id: "grand-nusa-dua",
    name: "Grand Nusa Dua Resort",
    distance: "3 min walk",
    description: "Closest option to the venue, right across the convention plaza.",
  },
  {
    id: "samudra-beach-hotel",
    name: "Samudra Beach Hotel",
    distance: "8 min walk",
    description: "Beachfront rooms with an easy walking route along the resort boardwalk.",
  },
  {
    id: "taman-nusa-suites",
    name: "Taman Nusa Suites",
    distance: "10 min walk",
    description: "Budget-friendly suites popular with returning conference attendees.",
  },
  {
    id: "kertha-garden-inn",
    name: "Kertha Garden Inn",
    distance: "5 min drive",
    description: "Quiet garden setting with a free shuttle to the convention center.",
  },
];

export type Attraction = {
  id: string;
  name: string;
  description: string;
};

export const attractions: Attraction[] = [
  {
    id: "water-blow",
    name: "Water Blow, Nusa Dua",
    description: "Dramatic ocean spray over coral cliffs, a 10-minute walk from the venue.",
  },
  {
    id: "uluwatu-temple",
    name: "Uluwatu Temple",
    description: "Clifftop temple famous for sunset views and traditional Kecak fire dance.",
  },
  {
    id: "garuda-wisnu-kencana",
    name: "Garuda Wisnu Kencana Cultural Park",
    description: "Home to Bali's giant Garuda Wisnu statue, with art performances and galleries.",
  },
  {
    id: "pandawa-beach",
    name: "Pandawa Beach",
    description: "White-sand beach tucked behind limestone cliffs, about 20 minutes south.",
  },
];

export type LocalEvent = {
  id: string;
  name: string;
  date: string;
  description: string;
};

export const nearbyEvents: LocalEvent[] = [
  {
    id: "nusa-dua-fiesta",
    name: "Nusa Dua Fiesta",
    date: "Mid September",
    description: "Annual arts, culture, and culinary festival held along the Nusa Dua boardwalk.",
  },
  {
    id: "bali-sunset-market",
    name: "Bali Sunset Market",
    date: "Weekly, Friday evenings",
    description: "Local crafts and street food market a short drive from the convention area.",
  },
  {
    id: "ubud-wellness-weekend",
    name: "Ubud Wellness Weekend",
    date: "Late September",
    description: "Yoga and mindfulness gathering in Ubud, about 90 minutes from Nusa Dua.",
  },
];
