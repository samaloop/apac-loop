// Registration on/off switch. Closed unless NEXT_PUBLIC_REGISTRATION_OPEN is
// exactly "true" — set it in App Platform (and .env locally) and redeploy to
// open. NEXT_PUBLIC_ values are baked in at build time, so a change needs a
// new build, not just a restart.
export const registrationOpen = process.env.NEXT_PUBLIC_REGISTRATION_OPEN === "true";

export const REGISTRATION_CLOSED_LABEL = "Registration opens soon";
