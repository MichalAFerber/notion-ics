import adapter from '@sveltejs/adapter-cloudflare';
import { defineConfig } from 'vite';

export default defineConfig({
  kit: {
    adapter: adapter(),
    // other configurations
  }
});
