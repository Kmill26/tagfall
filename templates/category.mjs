import { card } from './card.mjs';
import { dealPageUrl, escapeHtml, jsonLdScript, SITE_URL } from './layout.mjs';

export const categoryJsonLd = (category, deals) => jsonLdScript({
  '@context': 'https://schema.org',
  '@type': 'ItemList',
  name: category.h1 || `${category.name} deals`,
  url: `${SITE_URL}/c/${category.slug}/`,
  numberOfItems: deals.length,
  itemListElement: deals.map((deal, index) => ({
    '@type': 'ListItem',
    position: index + 1,
    name: deal.title,
    url: dealPageUrl(deal.slug),
  })),
});

export const category = ({ category, deals, categories }) => {
  const intro = `<section class="shell page-intro"><p class="eyebrow">Tagfall / ${escapeHtml(category.name)}</p><h1>${escapeHtml(category.h1 || `${category.name} deals`)}</h1><p>${escapeHtml(category.intro || `${deals.length} live ${deals.length === 1 ? 'deal' : 'deals'}, checked by hand.`)}</p></section>`;
  if (!deals.length) {
    return `${intro}<section class="shell section section--tight"><p class="empty-state">${escapeHtml(category.empty || `No live ${category.name.toLowerCase()} deals right now — check back.`)}</p></section>`;
  }
  return `${intro}<section class="shell section section--tight"><div class="sort-bar"><label for="sort-deals">Sort</label><select id="sort-deals"><option value="rank">Top picks</option><option value="discount">Biggest discount</option><option value="price">Lowest price</option></select></div><div class="deal-grid" id="deal-grid">${deals.map((deal) => card(deal, categories)).join('')}</div></section>`;
};
