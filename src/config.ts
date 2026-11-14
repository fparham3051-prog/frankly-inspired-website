// Site-wide settings in one place. Organization facts (name, leader,
// contact, booking link, offers) come from src/org.config.json, the same
// profile the operations app and the InstitutionalOS console use. Page copy
// stays in the pages themselves.
// The quick check-up is a copy of the InstitutionalOS landing page (see
// scripts/sync-quick-checkup.py); SCORECARD_URL keeps every link on this domain.
import ORG from './org.config.json';

export { ORG };
export const SITE_URL = ORG.links.website.replace(/\/$/, '');
export const SCORECARD_URL = '/quick-check-up/';
export const CALENDLY_URL = ORG.links.booking;
export const LINKEDIN_URL = 'https://www.linkedin.com/in/franklin-parham-b7a545382';
export const EMAIL = ORG.org.email;
export const PHONE_DISPLAY = ORG.org.phone;
export const PHONE_TEL = '+1' + ORG.org.phone.replace(/\D/g, '');
