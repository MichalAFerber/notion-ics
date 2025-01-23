import adapter from '@sveltejs/adapter-cloudflare';

export default {
  kit: {
    adapter: adapter({
      out: '.svelte-kit/cloudflare'
    })
  }
};
