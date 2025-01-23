import adapter from '@sveltejs/adapter-cloudflare';
import dotenv from 'dotenv';

dotenv.config();

export default {
  kit: {
    adapter: adapter({
      out: '.svelte-kit/cloudflare'
    })
  }
};
