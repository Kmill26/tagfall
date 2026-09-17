import { card } from './card.mjs';
import { dealPageUrl, discount, escapeHtml, jsonLdScript, SITE_URL } from './layout.mjs';

const byDiscountThenPick = (a, b) => {
  const diff = (discount(b) || 0) - (discount(a) || 0);
  if (diff) return diff;
  return (a.pickRank ?? 99) - (b.pickRank ?? 99);
};

export const selectBestDeals = (liveDeals) => {
  const curated = liveDeals.filter((deal) => deal.best50 === true);
  if (curated.length) {
    return curated
      .sort((a, b) => {
        const ar = Number.isFinite(a.bestRank) ? a.bestRank : Number.POSITIVE_INFINITY;
        const br = Number.isFinite(b.bestRank) ? b.bestRank : Number.POSITIVE_INFINITY;
        if (ar !== br) return ar - br;
        return byDiscountThenPick(a, b);
      })
      .slice(0, 50);
  }
  return liveDeals
    .filter((deal) => deal.listPrice)
    .sort(byDiscountThenPick)
    .slice(0, 50);
};

export const bestJsonLd = (deals) => jsonLdScript({
  '@context': 'https://schema.org',
  '@type': 'ItemList',
  name: '50 Best Deals',
  url: `${SITE_URL}/best/`,
  numberOfItems: deals.length,
  itemListElement: deals.map((deal, index) => ({
    '@type': 'ListItem',
    position: index + 1,
    name: deal.title,
    url: dealPageUrl(deal.slug),
  })),
});

export const best = ({ deals, categories, curated = false }) => {
  const count = deals.length;
  const intro = curated
    ? `A hand-checked ranking of the ${count} best live deals on Tagfall. Rank is editorial; prices are the verified PDP figures we already published — we do not invent prices.`
    : `No editorial Top 50 list yet. This page ranks the ${count} deepest live list-price cuts on Tagfall, then pick order. Prices are verified PDP figures — we do not invent deals.`;
  const grid = count
    ? `<div class="deal-grid deal-grid--ranked">${deals.map((deal, index) => card(deal, categories, index + 1)).join('')}</div>`
    : '<p class="empty-state">Best-deal rankings coming — check back.</p>';
  return `<section class="shell page-intro"><p class="eyebrow">Tagfall / Best</p><h1>50 Best Deals</h1><p>${escapeHtml(intro)}</p></section><section class="shell section section--tight">${grid}</section>`;
};
