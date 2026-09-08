import { readFileSync, readdirSync } from 'fs';
const root = '/home/user/siaara/';
const files = [
  ...readdirSync(root).filter((f) => f.endsWith('.html')).map((f) => root + f),
  ...readdirSync(root + 'js').filter((f) => f.endsWith('.js')).map((f) => root + 'js/' + f),
];
const all = files.map((f) => readFileSync(f, 'utf8')).join('\n');
const keys = new Set();
for (const m of all.matchAll(/data-i18n(?:-aria|-ph)="([^"]+)"/g)) keys.add(m[1]);
for (const m of all.matchAll(/\bt\('([^']+)'\)/g)) keys.add(m[1]);
const i18n = readFileSync(root + 'js/i18n.js', 'utf8');
const enBlock = i18n.split('en: {')[1].split('\n  },\n  hi: {')[0];
const dict = new Set([...enBlock.matchAll(/'([^']+)':/g)].map((m) => m[1]));
const missing = [...keys].filter((k) => !dict.has(k));
console.log('static keys used:', keys.size, '| dict keys:', dict.size);
console.log('MISSING from dict:', missing);
const need = [
  'col.red', 'col.pink', 'col.pink.desc', 'col.orange', 'col.orange.desc', 'col.purple',
  'col.purple.desc', 'col.yellow', 'col.yellow.desc', 'col.green', 'col.blue', 'col.black', 'col.neutrals',
  'shade.red', 'shade.red.desc', 'shade.green', 'shade.green.desc', 'shade.yellow', 'shade.yellow.desc',
  'shade.blue', 'shade.blue.desc', 'shade.pink', 'shade.pink.desc', 'shade.purple', 'shade.purple.desc',
  'shade.neutrals', 'shade.neutrals.desc',
  'bs.yellow.desc', 'bs.purple.desc', 'bs.pink.desc', 'bs.green.desc', 'bs.black.desc',
  'or.hoodies', 'or.hoodies.desc', 'or.sweats', 'or.sweats.desc', 'or.tees', 'or.tees.desc',
  'or.shirts', 'or.shirts.desc', 'or.jackets', 'or.jackets.desc',
];
console.log('dynamic missing:', need.filter((k) => !dict.has(k)));
