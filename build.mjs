import { cp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { layout, SITE_URL } from './templates/layout.mjs';
import { home } from './templates/home.mjs';
import { category as categoryPage } from './templates/category.mjs';
import { deal as dealPage } from './templates/deal.mjs';

export const AFFILIATE_TAG = 'millerdealdes-20';
const root = process.cwd();
const out = path.join(root, 'dist');
const readJson = async (file) => JSON.parse(await readFile(path.join(root, file), 'utf8'));
const write = async (file, content) => { const target = path.join(out, file); await mkdir(path.dirname(target), { recursive: true }); await writeFile(target, content); };
const copy = async (source, target) => cp(path.join(root, source), path.join(out, target), { recursive: true });

const deals = await readJson('data/deals.json');
const categories = await readJson('data/categories.json');
await rm(out, { recursive: true, force: true });
await mkdir(out, { recursive: true });
await copy('assets', 'assets');

await write('index.html', layout({ title: 'Tagfall — Price drops, checked by hand.', description: 'Hand-checked price drops with the tradeoffs that matter.', body: home({ deals, categories, affiliateTag: AFFILIATE_TAG }) }));
for (const category of categories) {
  const categoryDeals = deals.filter((deal) => deal.category === category.slug && deal.status === 'live').sort((a, b) => a.pickRank - b.pickRank);
  await write(`c/${category.slug}/index.html`, layout({ title: category.title || `${category.name} deals — Tagfall`, description: category.description || `Hand-checked ${category.name.toLowerCase()} deals and clear buying tradeoffs.`, path: `/c/${category.slug}/`, body: categoryPage({ category, deals: categoryDeals, categories }) }));
}
for (const deal of deals) {
  const category = categories.find((item) => item.slug === deal.category);
  const related = deals.filter((item) => item.category === deal.category && item.slug !== deal.slug && item.status === 'live').sort((a, b) => a.pickRank - b.pickRank).slice(0, 4);
  const page = dealPage({ deal, category, related, categories, affiliateTag: AFFILIATE_TAG });
  await write(`deals/${deal.slug}/index.html`, layout({ title: `${deal.title} — Tagfall`, description: deal.summary, path: `/deals/${deal.slug}/`, body: page.body, jsonLd: page.jsonLd, noindex: deal.status !== 'live' }));
}
const about = `<section class="shell page-intro prose"><p class="eyebrow">About Tagfall</p><h1>Price drops, checked by hand.</h1><p>Tagfall is operated by Kenny in the Houston metro. It exists to publish clear, all-in deal writeups for home and everyday products — what is worth buying, what to skip, and why.</p><p>We research prices across retail and marketplace options and explain tradeoffs in plain English. When we link to a retailer, we may earn a commission. That never changes our recommendation process.</p></section>`;
const disclosure = `<section class="shell page-intro prose"><p class="eyebrow">Disclosure</p><h1>Affiliate disclosure</h1><p><strong>As an Amazon Associate I earn from qualifying purchases.</strong></p><p>Tagfall is a participant in the Amazon Services LLC Associates Program, an affiliate advertising program designed to provide a means for sites to earn advertising fees by advertising and linking to Amazon.com and affiliated sites.</p><p>We may also participate in other affiliate or partner programs. If you click a link on this site and buy something, we may earn a commission at no extra cost to you.</p><p>We aim for honest recommendations. Commissions do not determine whether we recommend a product; price, usefulness, and tradeoffs do.</p><p>Amazon and the Amazon logo are trademarks of Amazon.com, Inc. or its affiliates.</p></section>`;
await write('about/index.html', layout({ title: 'About — Tagfall', description: 'Why Tagfall checks price drops and tradeoffs by hand.', path: '/about/', body: about }));
await write('disclosure/index.html', layout({ title: 'Affiliate disclosure — Tagfall', description: 'Tagfall affiliate disclosure.', path: '/disclosure/', body: disclosure }));
const liveDeals = deals.filter((deal) => deal.status === 'live');
const lastmod = (value) => {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.toISOString().slice(0, 10);
};
const latestLastmod = (...values) => values.map(lastmod).filter(Boolean).sort().at(-1) || lastmod(new Date().toISOString());
const sitemapUrl = (loc, iso) => {
  const date = lastmod(iso);
  return date ? `<url><loc>${SITE_URL}${loc}</loc><lastmod>${date}</lastmod></url>` : `<url><loc>${SITE_URL}${loc}</loc></url>`;
};
const sitemapUrls = [
  sitemapUrl('/', latestLastmod(...liveDeals.map((deal) => deal.verifiedAt))),
  sitemapUrl('/about/', latestLastmod(...liveDeals.map((deal) => deal.verifiedAt))),
  sitemapUrl('/disclosure/', latestLastmod(...liveDeals.map((deal) => deal.verifiedAt))),
  ...categories.map((category) => sitemapUrl(`/c/${category.slug}/`, latestLastmod(...liveDeals.filter((deal) => deal.category === category.slug).map((deal) => deal.verifiedAt)))),
  ...liveDeals.map((deal) => sitemapUrl(`/deals/${deal.slug}/`, deal.verifiedAt)),
];
await write('sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${sitemapUrls.join('\n')}\n</urlset>\n`);
await write('robots.txt', `User-agent: *\nAllow: /\nSitemap: ${SITE_URL}/sitemap.xml\n`);
