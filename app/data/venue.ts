export const venue = {
  name: "Venue to be announced",
  address: "Bali, Indonesia",
  description:
    "Full venue details will be announced soon. The conference will take place in Bali, Indonesia.",
};

export type Hotel = {
  id: string;
  name: string;
  distance: string;
  description: string;
};

export const hotels: Hotel[] = [
  {
    id: "hotel-1",
    name: "Partner Hotel 1",
    distance: "TBA",
    description: "Hotel details to be announced.",
  },
  {
    id: "hotel-2",
    name: "Partner Hotel 2",
    distance: "TBA",
    description: "Hotel details to be announced.",
  },
  {
    id: "hotel-3",
    name: "Partner Hotel 3",
    distance: "TBA",
    description: "Hotel details to be announced.",
  },
  {
    id: "hotel-4",
    name: "Partner Hotel 4",
    distance: "TBA",
    description: "Hotel details to be announced.",
  },
];

export type Attraction = {
  id: string;
  name: string;
  description: string;
};

export const attractions: Attraction[] = [
  {
    id: "attraction-1",
    name: "Local Attraction 1",
    description: "Attraction details to be announced.",
  },
  {
    id: "attraction-2",
    name: "Local Attraction 2",
    description: "Attraction details to be announced.",
  },
  {
    id: "attraction-3",
    name: "Local Attraction 3",
    description: "Attraction details to be announced.",
  },
  {
    id: "attraction-4",
    name: "Local Attraction 4",
    description: "Attraction details to be announced.",
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
    id: "local-event-1",
    name: "Local Event 1",
    date: "TBA",
    description: "Event details to be announced.",
  },
  {
    id: "local-event-2",
    name: "Local Event 2",
    date: "TBA",
    description: "Event details to be announced.",
  },
  {
    id: "local-event-3",
    name: "Local Event 3",
    date: "TBA",
    description: "Event details to be announced.",
  },
];
