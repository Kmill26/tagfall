export const SITE_URL = (process.env.SITE_URL || 'https://tagfall.vercel.app').replace(/\/$/, '');
export const DEFAULT_SHARE_IMAGE = `${SITE_URL}/assets/favicon.svg`;

export const escapeHtml = (value = '') => String(value).replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);
export const jsonLdScript = (data) => `<script type="application/ld+json">${JSON.stringify(data).replace(/</g, '\\u003c')}</script>`;
export const dealPageUrl = (slug) => `${SITE_URL}/deals/${slug}/`;
export const firstLiveImage = (...groups) => {
  for (const group of groups) {
    const list = Array.isArray(group) ? group : group ? [group] : [];
    for (const deal of list) {
      if (deal?.status === 'live' && deal?.image) return deal.image;
    }
  }
  return '';
};
export const money = (value) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);
export const discount = (deal) => deal.listPrice ? Math.round((1 - deal.price / deal.listPrice) * 100) : null;
export const checkedAt = (value) => new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit', timeZone: 'America/Chicago', timeZoneName: 'short' }).format(new Date(value)).replace(',', '');

export const icon = (name) => ({
  sparkle: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m12 2 1.8 6.2L20 10l-6.2 1.8L12 18l-1.8-6.2L4 10l6.2-1.8L12 2Z"/></svg>',
  hammer: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m14 3 7 7-2.5 2.5-2-2L8.3 18.7 5.3 21l-2.3-2.3 2.3-3 8.2-8.2-2-2L14 3Z"/></svg>',
  pan: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 6h13a5 5 0 0 1 0 10H8A5 5 0 0 1 3 11V6Zm13 4h5v2h-5v-2Z"/></svg>',
  leaf: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 3C10 3 4 7 4 14c0 4 3 7 7 7 7 0 10-8 9-18Zm-8 15c-1.5-3.5-3.5-5.5-6-6 3 0 5.5 1.3 7.5 4L18 8l-6 10Z"/></svg>',
}[name] || '');

export const productImage = (deal, className = '') => deal?.image
  ? `<img src="${escapeHtml(deal.image)}" alt="${escapeHtml(deal.title || '')}" width="560" height="560" loading="lazy" class="product-photo${className ? ` ${escapeHtml(className)}` : ''}">`
  : placeholder(deal?.category || 'cleaning', deal?.title || '');

export const placeholder = (category, label = '') => `<div class="product-placeholder product-placeholder--${escapeHtml(category)}" aria-label="${escapeHtml(label)} product image placeholder" role="img">${icon(category === 'seasonal' ? 'leaf' : category === 'cleaning' ? 'sparkle' : category === 'tools' ? 'hammer' : 'pan')}</div>`;

export const layout = ({ title, description, path = '/', body, jsonLd = '', noindex = false, image = '' }) => {
  const canonical = `${SITE_URL}${path}`;
  const robots = noindex ? '<meta name="robots" content="noindex,follow">' : '';
  const shareImage = image || DEFAULT_SHARE_IMAGE;
  const twitterCard = image && !/\.svg(\?|$)/i.test(image) ? 'summary_large_image' : 'summary';
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="google-site-verification" content="5JwV867bjmqxM_t033AC-E7LLKbz3hAbIyQEWAaS2zI"><meta name="google-site-verification" content="BxSRdZc4D2Mo6QT62_JxJq3vcK3TdhPKzlBrTqwL6HQ"><title>${escapeHtml(title)}</title><meta name="description" content="${escapeHtml(description)}">${robots}<link rel="canonical" href="${canonical}"><meta property="og:type" content="website"><meta property="og:title" content="${escapeHtml(title)}"><meta property="og:description" content="${escapeHtml(description)}"><meta property="og:url" content="${canonical}"><meta property="og:image" content="${escapeHtml(shareImage)}"><meta name="twitter:card" content="${twitterCard}"><meta name="twitter:title" content="${escapeHtml(title)}"><meta name="twitter:description" content="${escapeHtml(description)}"><meta name="twitter:image" content="${escapeHtml(shareImage)}"><link rel="icon" type="image/svg+xml" href="/assets/favicon.svg"><link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link href="https://fonts.googleapis.com/css2?family=Figtree:wght@400;600;700&family=Newsreader:opsz,wght@6..72,600&display=swap" rel="stylesheet"><link rel="stylesheet" href="/assets/tokens.css"><link rel="stylesheet" href="/assets/style.css">${jsonLd}</head><body><header class="site-header"><div class="shell header-main"><a class="wordmark" href="/">Tagfall</a><nav aria-label="Categories"><a href="/c/cleaning/">Cleaning</a><a href="/c/tools/">Tools</a><a href="/c/kitchen/">Kitchen</a><a href="/c/seasonal/">Seasonal</a></nav><button class="search-toggle" aria-expanded="false" aria-controls="deal-search" aria-label="Search deals"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="6"></circle><path d="m16 16 5 5"></path></svg></button></div><div class="shell search-row"><label for="deal-search">Search deals</label><input id="deal-search" type="search" placeholder="Search Tagfall" autocomplete="off"></div></header><main>${body}</main><footer class="site-footer"><div class="shell"><a class="wordmark" href="/">Tagfall</a><p>Price drops, checked by hand.</p><p><a href="/about/">About</a><a href="/disclosure/">Disclosure</a></p><p>© ${new Date().getFullYear()} Tagfall</p></div></footer><script src="/assets/site.js" defer></script></body></html>`;
};
