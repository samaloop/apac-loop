export const event = {
  name: "The Next Frontier",
  tagline: "APAC Coaching Conference 2027",
  organizer: "Asia Pacific Alliance of Coaches",
  date: "22–23 September 2027",
  // Opening time in Bali (WITA, UTC+8): the homepage countdown runs to this.
  startsAt: "2027-09-22T09:00:00+08:00",
  location: "Bali, Indonesia",
  description:
    "Inspiring People . Transforming System . Shaping Society",
  // TODO: placeholder — replace with the real support WhatsApp number
  // (international format, digits only, no "+" or leading 0) once confirmed.
  whatsapp: "6280000000000",
  highlights: [
    "Coaches, leaders & practitioners from across Asia Pacific",
    "2 days of keynotes & hands-on workshops",
    "Community & networking sessions",
    "Practical takeaways for real-world coaching practice",
  ],
};

// "Help" across the site (navbar, footer, FAQ, registration) opens a
// WhatsApp chat with the conference team, as the design's prototype links.
export const helpWhatsAppUrl = `https://wa.me/${event.whatsapp}?text=${encodeURIComponent(
  "Hi, I have a question about APAC Coaching Conference 2027."
)}`;
