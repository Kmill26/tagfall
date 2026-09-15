import { checkedAt, discount, escapeHtml, money, placeholder } from './layout.mjs';

export const card = (deal, categories) => {
  const pct = discount(deal);
  const category = categories.find((item) => item.slug === deal.category);
  return `<article class="deal-card" data-title="${escapeHtml(deal.title.toLowerCase())}" data-discount="${pct || 0}" data-price="${deal.price}" data-rank="${deal.pickRank}"><a class="card-link" href="/deals/${escapeHtml(deal.slug)}/"><div class="card-image">${deal.image ? `<img src="${escapeHtml(deal.image)}" alt="" width="560" height="560" loading="lazy">` : placeholder(deal.category, deal.title)}${pct >= 20 ? `<span class="price-tag">${pct}% off</span>` : ''}</div><div class="card-content"><p class="eyebrow">${escapeHtml(category.name)}</p><h3>${escapeHtml(deal.title)}</h3><div class="price-block"><strong>${money(deal.price)}</strong>${deal.listPrice ? `<s>${money(deal.listPrice)}</s><span>${pct}% off</span>` : '<span>Everyday price</span>'}</div><p class="checked">Checked ${checkedAt(deal.verifiedAt)}</p></div></a></article>`;
};
