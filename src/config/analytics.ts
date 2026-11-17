// Google Analytics measurement ID ("G-XXXXXXXXXX"). Leave blank while
// analytics is off: with no optional tracking there is nothing to ask
// consent for, so the cookie banner and the footer's "Manage Cookie
// Preferences" link don't appear at all. Set it and both come back, and
// analytics loads only for visitors who accept.
export const GA_MEASUREMENT_ID = '';
export const ANALYTICS_ON = GA_MEASUREMENT_ID.length > 0;
