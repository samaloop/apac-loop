import type { Metadata } from "next";
import { venue, hotels, attractions, nearbyEvents } from "../data/venue";
import SectionHeading from "../components/SectionHeading";
import InfoCard from "../components/InfoCard";

export const metadata: Metadata = {
  title: "Venue | Loop Coaching Summit 2026",
  description: "Venue, hotels, and Bali guide for Loop Coaching Summit 2026.",
};

export default function VenuePage() {
  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-16 px-6 py-20">
      <SectionHeading
        eyebrow="Venue & Bali Guide"
        title="Where to be, and what to do while you're here"
      />

      <div className="flex flex-col gap-4 rounded-2xl bg-surface-muted p-8">
        <h3 className="text-xl font-semibold text-foreground">{venue.name}</h3>
        <p className="text-sm font-medium text-accent">{venue.address}</p>
        <p className="text-sm leading-6 text-foreground/70">{venue.description}</p>
      </div>

      <div className="flex flex-col gap-6">
        <SectionHeading eyebrow="Getting Settled" title="Nearest hotels" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {hotels.map((hotel) => (
            <InfoCard
              key={hotel.id}
              title={hotel.name}
              meta={hotel.distance}
              description={hotel.description}
            />
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-6">
        <SectionHeading eyebrow="While You're Here" title="Bali attractions" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {attractions.map((attraction) => (
            <InfoCard
              key={attraction.id}
              title={attraction.name}
              description={attraction.description}
            />
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-6">
        <SectionHeading eyebrow="Around the Dates" title="Happening in Bali" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {nearbyEvents.map((localEvent) => (
            <InfoCard
              key={localEvent.id}
              title={localEvent.name}
              meta={localEvent.date}
              description={localEvent.description}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
