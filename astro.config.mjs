// @ts-check
import { defineConfig } from 'astro/config';

// Plain static output — the whole site is client-rendered HTML/CSS/JS with
// no server-side rendering, so no adapter is needed. Builds to dist/, which
// is what Render's Static Site (and any other static host) expects.
export default defineConfig({});