import { randomStep } from './patients';
import type { StorageLocation } from './game';
import type { StoryArticleId } from './story-content';

export type Publication = 'kurier' | 'glos';

/** Physical copies retain their publication date and content independently of the editorial pool. */
export interface NewspaperCopy {
  id?: string;
  publication?: Publication;
  issueNumber?: number;
  storyArticleIds?: StoryArticleId[];
  storyClassifiedIds?: ('C-AD')[];
  day: number;
  articleIds: PressArticleId[];
  classifiedIds: ClassifiedId[];
  location: StorageLocation;
}

export const publicationId = (copy: Pick<NewspaperCopy, 'day' | 'publication'>): string => `${copy.publication ?? 'kurier'}:${copy.day}`;
export const matchesPublication = (copy: NewspaperCopy, day: number, publication: Publication = 'kurier'): boolean => copy.day === day && (copy.publication ?? 'kurier') === publication;

export const newspaperCopy = (state: Pick<NewspaperState, 'articleIds' | 'classifiedIds'>, day: number): NewspaperCopy =>
  ({ day, articleIds: [...state.articleIds], classifiedIds: [...state.classifiedIds], location: 'desk' });

/** Stable fictional local numbers; dialing stays entirely inside the game. */
export const CLASSIFIEDS = [
  { id: 'sewing-machine', phone: '46-28-15' },
  { id: 'sideboard', phone: '32-71-08' },
  { id: 'pram', phone: '58-14-26' },
  { id: 'radio-repair', phone: '27-63-40' },
  { id: 'piano-lessons', phone: '41-85-32' },
  { id: 'garage', phone: '63-20-74' },
  { id: 'typewriter', phone: '35-49-18' },
  { id: 'bicycle-parts', phone: '52-16-83' },
  { id: 'books', phone: null },
  { id: 'jars', phone: null },
  { id: 'lost-keys', phone: null },
  { id: 'allotment', phone: null },
  { id: 'knitting-help', phone: null },
  { id: 'room', phone: null },
  { id: 'records', phone: null },
  { id: 'clock-repair', phone: null },
  { id: 'coal-scuttle', phone: null },
  { id: 'curtain-rods', phone: null },
  { id: 'children-skates', phone: null },
  { id: 'violin-case', phone: null },
  { id: 'sofa-bed', phone: '48-21-36' },
  { id: 'jam-pots', phone: null },
  { id: 'music-stand', phone: null },
  { id: 'wool-remnants', phone: null },
  { id: 'pram-wheels', phone: null },
  { id: 'piano-tuning', phone: '36-72-19' },
  { id: 'chess-set', phone: null },
  { id: 'travel-trunk', phone: null },
  { id: 'plant-pots', phone: null },
  { id: 'school-atlas', phone: null },
  { id: 'handcart', phone: '57-34-20' },
  { id: 'spare-buttons', phone: null },
  { id: 'found-mittens', phone: null },
  { id: 'bookends', phone: null },
  { id: 'coat-alteration', phone: null },
  { id: 'mandolin', phone: '24-69-53' },
  { id: 'photo-albums', phone: null },
  { id: 'folding-stool', phone: null },
  { id: 'wood-offcuts', phone: null },
  { id: 'travel-chess', phone: null },
  { id: 'electric-iron', phone: '62-18-45' },
  { id: 'baking-tins', phone: null },
  { id: 'sewing-patterns', phone: null },
  { id: 'record-sleeves', phone: null },
  { id: 'allotment-bench', phone: null },
  { id: 'accordion-sale', phone: '43-56-27' },
  { id: 'curtain-sewing', phone: null },
  { id: 'bicycle-basket', phone: null },
  { id: 'reading-lamp', phone: null },
  { id: 'schoolbag-sale', phone: null },
  { id: 'wardrobe-mirror', phone: '51-83-24' },
  { id: 'knitting-needles', phone: null },
  { id: 'old-magazines', phone: null },
  { id: 'garden-rake', phone: null },
  { id: 'found-scarf', phone: null },
  { id: 'reel-recorder', phone: '29-47-61' },
  { id: 'copper-kettle', phone: null },
  { id: 'embroidered-cloth', phone: null },
  { id: 'baby-clothes', phone: null },
  { id: 'photo-enlarger', phone: null },
  { id: 'furniture-moving', phone: '38-65-12' },
  { id: 'wooden-sled', phone: null },
  { id: 'cookbooks', phone: null },
  { id: 'plant-stand', phone: null },
  { id: 'chess-opponent', phone: null },
  { id: 'violin-lessons', phone: '65-23-48' },
  { id: 'suitcase-straps', phone: null },
  { id: 'radio-cabinet', phone: null },
  { id: 'children-books', phone: null },
  { id: 'wall-map', phone: null },
  { id: 'clock-sale', phone: '47-19-62' },
  { id: 'wooden-hangers', phone: null },
  { id: 'garden-chair', phone: null },
  { id: 'ink-bottles', phone: null },
  { id: 'knitting-books', phone: null },
  { id: 'car-seat-covers', phone: '33-82-56' },
  { id: 'found-notebook', phone: null },
  { id: 'chair-caning', phone: null },
  { id: 'postcard-exchange', phone: null },
  { id: 'coffee-grinder', phone: null },
  { id: 'portable-radio', phone: '56-31-79' },
  { id: 'table-leaf', phone: null },
  { id: 'glass-vases', phone: null },
  { id: 'children-costumes', phone: null },
  { id: 'fishing-float', phone: null },
  { id: 'sewing-table', phone: '28-54-63' },
  { id: 'coat-lining', phone: null },
  { id: 'record-brush', phone: null },
  { id: 'seed-boxes', phone: null },
  { id: 'found-pencilcase', phone: null },
  { id: 'armchair-pair', phone: '44-78-23' },
  { id: 'theatre-programmes', phone: null },
  { id: 'travelling-chest', phone: null },
  { id: 'wicker-basket', phone: null },
  { id: 'needlework-frame', phone: null },
  { id: 'room-painting', phone: '61-42-85' },
  { id: 'old-spectacle-case', phone: null },
  { id: 'book-binding', phone: null },
  { id: 'school-uniform', phone: null },
  { id: 'photo-trays', phone: null },
  { id: 'folding-bike', phone: '37-26-54' },
  { id: 'watercolour-box', phone: null },
  { id: 'chess-books', phone: null },
  { id: 'curtain-hooks', phone: null },
  { id: 'school-compass', phone: null },
  { id: 'typing-service', phone: '53-64-18' },
  { id: 'allotment-watercan', phone: null },
  { id: 'small-rug', phone: null },
  { id: 'bottle-crates', phone: null },
  { id: 'language-practice', phone: null },
  { id: 'car-roof-rack', phone: '26-91-43' },
  { id: 'portrait-drawing', phone: null },
  { id: 'children-gloves', phone: null },
  { id: 'tapes-for-records', phone: null },
  { id: 'wooden-toys', phone: null },
  { id: 'desk-sale', phone: '49-35-72' },
  { id: 'reading-help', phone: null },
  { id: 'chess-clock-ad', phone: null },
  { id: 'kitchen-stool', phone: null },
  { id: 'found-sheet-music', phone: null },
  { id: 'carpet-weaving', phone: '34-57-82' },
  { id: 'model-paint', phone: null },
  { id: 'old-city-photos', phone: null },
  { id: 'hat-box', phone: null },
  { id: 'mending-basket', phone: null },
  { id: 'double-bed', phone: '58-46-13' },
  { id: 'curtain-remnants', phone: null },
  { id: 'walking-companion', phone: null },
  { id: 'plant-identification', phone: null },
  { id: 'folding-screen', phone: null },
  { id: 'camera-sale', phone: '42-68-35' },
  { id: 'book-jackets', phone: null },
  { id: 'found-shopping-bag', phone: null },
  { id: 'thread-spools', phone: null },
  { id: 'picture-glass', phone: null },
  { id: 'room-to-let', phone: '64-29-57' },
  { id: 'poetry-copying', phone: null },
  { id: 'found-brooch', phone: null },
  { id: 'school-desk-ad', phone: null },
  { id: 'empty-tins', phone: null },
  { id: 'sheet-music-copy', phone: null },
  { id: 'picture-hook', phone: null },
  { id: 'borrowed-ladder', phone: null },
  { id: 'wooden-puzzle', phone: null },
  { id: 'sewing-foot', phone: null },
  { id: 'family-album-help', phone: null },
  { id: 'chess-pieces', phone: null },
  { id: 'found-keyring', phone: null },
  { id: 'carpentry-help', phone: null },
  { id: 'potted-geranium', phone: null },
  { id: 'choir-singers', phone: null },
  { id: 'wooden-cradle', phone: null },
  { id: 'found-beret', phone: null },
  { id: 'recipe-swap', phone: null },
  { id: 'old-calendar', phone: null },
  { id: 'portrait-frame', phone: null },
  { id: 'fabric-samples', phone: null },
  { id: 'window-box', phone: null },
  { id: 'borrowed-book', phone: null },
  { id: 'umbrella-handle', phone: null },
  { id: 'lesson-notes', phone: null },
  { id: 'clothes-pegs', phone: null },
  { id: 'found-wristwatch', phone: null },
  { id: 'model-cardboard', phone: null },
  { id: 'weaving-shuttle', phone: null },
  { id: 'walking-maps', phone: null },
] as const;
export type ClassifiedId = typeof CLASSIFIEDS[number]['id'];
export const classifiedPhone = (id: ClassifiedId): string | null => CLASSIFIEDS.find(ad => ad.id === id)?.phone ?? null;
export const CLASSIFIED_CALL_RESULTS = ['classified-expired', 'classified-no-answer', 'classified-busy', 'classified-wrong-number', 'classified-call-later', 'classified-disconnected'] as const;
export type ClassifiedCallResult = typeof CLASSIFIED_CALL_RESULTS[number];

/** Append stable IDs; copy lives in both dictionaries, never in saves. */
export const PRESS_ARTICLES = [
  { id: 'reading-circle', topic: 'culture', reusable: false },
  { id: 'choir', topic: 'culture', reusable: false },
  { id: 'film-club', topic: 'culture', reusable: false },
  { id: 'theatre', topic: 'craft', reusable: false },
  { id: 'chess', topic: 'sport', reusable: false },
  { id: 'table-tennis', topic: 'sport', reusable: false },
  { id: 'stamps', topic: 'hobby', reusable: true },
  { id: 'cassette', topic: 'technology', reusable: true },
  { id: 'knitting', topic: 'household', reusable: true },
  { id: 'darning', topic: 'craft', reusable: true },
  { id: 'plants', topic: 'home', reusable: true },
  { id: 'bread', topic: 'kitchen', reusable: true },
  { id: 'station-clock', topic: 'transport', reusable: true },
  { id: 'lost-scarf', topic: 'everyday', reusable: false },
  { id: 'handwriting', topic: 'education', reusable: false },
  { id: 'aquarium', topic: 'hobby', reusable: false },
  { id: 'bookbinding', topic: 'craft', reusable: true },
  { id: 'starlight', topic: 'science', reusable: true },
  { id: 'noticeboard', topic: 'community', reusable: false },
  { id: 'bicycle', topic: 'technology', reusable: true },
  { id: 'prompter', topic: 'culture', reusable: true },
  { id: 'cinema-booth', topic: 'culture', reusable: true },
  { id: 'score-library', topic: 'culture', reusable: true },
  { id: 'poster-lettering', topic: 'culture', reusable: true },
  { id: 'puppet-tour', topic: 'culture', reusable: false },
  { id: 'accordion-duet', topic: 'culture', reusable: false },
  { id: 'matinee-survey', topic: 'culture', reusable: false },
  { id: 'dance-shoes', topic: 'culture', reusable: false },
  { id: 'recitation-finals', topic: 'culture', reusable: false },
  { id: 'folk-recording', topic: 'culture', reusable: false },
  { id: 'reading-room', topic: 'culture', reusable: true },
  { id: 'portrait-studio', topic: 'culture', reusable: true },
  { id: 'museum-labels', topic: 'culture', reusable: true },
  { id: 'book-cart', topic: 'culture', reusable: true },
  { id: 'photo-exhibition', topic: 'culture', reusable: false },
  { id: 'poetry-evening', topic: 'culture', reusable: false },
  { id: 'museum-donation', topic: 'culture', reusable: false },
  { id: 'radio-play', topic: 'culture', reusable: false },
  { id: 'poster-collection', topic: 'culture', reusable: false },
  { id: 'book-display', topic: 'culture', reusable: false },
  { id: 'umbrella-ribs', topic: 'craft', reusable: true },
  { id: 'shoe-lasts', topic: 'craft', reusable: true },
  { id: 'brush-maker', topic: 'craft', reusable: true },
  { id: 'frame-shop', topic: 'craft', reusable: true },
  { id: 'upholstery-course', topic: 'craft', reusable: false },
  { id: 'engraver-cup', topic: 'craft', reusable: false },
  { id: 'ceramic-glaze', topic: 'craft', reusable: false },
  { id: 'joinery-drawer', topic: 'craft', reusable: false },
  { id: 'weaving-sample', topic: 'craft', reusable: false },
  { id: 'locksmith-apprentice', topic: 'craft', reusable: false },
  { id: 'book-gilding', topic: 'craft', reusable: true },
  { id: 'scissors-grinder', topic: 'craft', reusable: true },
  { id: 'basket-work', topic: 'craft', reusable: true },
  { id: 'watch-parts', topic: 'craft', reusable: true },
  { id: 'leather-satchel', topic: 'craft', reusable: false },
  { id: 'plaster-mould', topic: 'craft', reusable: false },
  { id: 'hat-block', topic: 'craft', reusable: false },
  { id: 'metal-signs', topic: 'craft', reusable: false },
  { id: 'pottery-jug', topic: 'craft', reusable: false },
  { id: 'carving-letters', topic: 'craft', reusable: false },
  { id: 'club-kit', topic: 'sport', reusable: true },
  { id: 'referee-notebook', topic: 'sport', reusable: true },
  { id: 'pool-lanes', topic: 'sport', reusable: true },
  { id: 'running-log', topic: 'sport', reusable: true },
  { id: 'volleyball-shift', topic: 'sport', reusable: false },
  { id: 'cross-country', topic: 'sport', reusable: false },
  { id: 'boxing-score', topic: 'sport', reusable: false },
  { id: 'handball-goalkeeper', topic: 'sport', reusable: false },
  { id: 'relay-baton', topic: 'sport', reusable: false },
  { id: 'chess-clock', topic: 'sport', reusable: false },
  { id: 'model-railway', topic: 'hobby', reusable: true },
  { id: 'coin-cabinet', topic: 'hobby', reusable: true },
  { id: 'postcard-box', topic: 'hobby', reusable: true },
  { id: 'amateur-radio', topic: 'hobby', reusable: true },
  { id: 'model-boat', topic: 'hobby', reusable: false },
  { id: 'philately-swap', topic: 'hobby', reusable: false },
  { id: 'fish-show', topic: 'hobby', reusable: false },
  { id: 'photo-darkroom', topic: 'hobby', reusable: false },
  { id: 'boardgame-evening', topic: 'hobby', reusable: false },
  { id: 'mineral-display', topic: 'hobby', reusable: false },
  { id: 'radio-aerial', topic: 'technology', reusable: true },
  { id: 'typewriter-ribbon', topic: 'technology', reusable: true },
  { id: 'tape-index', topic: 'technology', reusable: true },
  { id: 'bicycle-dynamo', topic: 'technology', reusable: true },
  { id: 'slide-projector', topic: 'technology', reusable: false },
  { id: 'workshop-meter', topic: 'technology', reusable: false },
  { id: 'sewing-maintenance', topic: 'technology', reusable: false },
  { id: 'telephone-display', topic: 'technology', reusable: false },
  { id: 'record-speed', topic: 'technology', reusable: false },
  { id: 'drafting-tools', topic: 'technology', reusable: false },
  { id: 'button-tin', topic: 'household', reusable: true },
  { id: 'sheet-hems', topic: 'household', reusable: true },
  { id: 'shopping-bag', topic: 'household', reusable: true },
  { id: 'leftover-yarn', topic: 'household', reusable: true },
  { id: 'repair-evening', topic: 'household', reusable: false },
  { id: 'linen-swap', topic: 'household', reusable: false },
  { id: 'recipe-index', topic: 'household', reusable: false },
  { id: 'curtain-measure', topic: 'household', reusable: false },
  { id: 'patchwork-cover', topic: 'household', reusable: false },
  { id: 'shopping-notes', topic: 'household', reusable: false },
  { id: 'shared-landing', topic: 'home', reusable: true },
  { id: 'folding-table', topic: 'home', reusable: true },
  { id: 'window-sill', topic: 'home', reusable: true },
  { id: 'family-bookshelf', topic: 'home', reusable: true },
  { id: 'room-divider', topic: 'home', reusable: false },
  { id: 'stairwell-curtains', topic: 'home', reusable: false },
  { id: 'furniture-plan', topic: 'home', reusable: false },
  { id: 'plant-cuttings', topic: 'home', reusable: false },
  { id: 'child-desk', topic: 'home', reusable: false },
  { id: 'coat-hooks', topic: 'home', reusable: false },
  { id: 'soup-ladle', topic: 'kitchen', reusable: true },
  { id: 'market-scales', topic: 'kitchen', reusable: true },
  { id: 'canteen-tray', topic: 'kitchen', reusable: true },
  { id: 'family-dumplings', topic: 'kitchen', reusable: true },
  { id: 'bakery-visitors', topic: 'kitchen', reusable: false },
  { id: 'recipe-contest', topic: 'kitchen', reusable: false },
  { id: 'school-sandwiches', topic: 'kitchen', reusable: false },
  { id: 'market-baskets', topic: 'kitchen', reusable: false },
  { id: 'tea-service', topic: 'kitchen', reusable: false },
  { id: 'potato-varieties', topic: 'kitchen', reusable: false },
  { id: 'tram-terminus', topic: 'transport', reusable: true },
  { id: 'luggage-label', topic: 'transport', reusable: true },
  { id: 'railway-porter', topic: 'transport', reusable: true },
  { id: 'bus-ticket-book', topic: 'transport', reusable: true },
  { id: 'route-map', topic: 'transport', reusable: false },
  { id: 'commuter-survey', topic: 'transport', reusable: false },
  { id: 'bicycle-rack', topic: 'transport', reusable: false },
  { id: 'station-signs', topic: 'transport', reusable: false },
  { id: 'walking-club', topic: 'transport', reusable: false },
  { id: 'tram-model', topic: 'transport', reusable: false },
  { id: 'cloakroom-tokens', topic: 'everyday', reusable: true },
  { id: 'letter-carrier', topic: 'everyday', reusable: true },
  { id: 'barber-mirror', topic: 'everyday', reusable: true },
  { id: 'porter-ledger', topic: 'everyday', reusable: true },
  { id: 'lost-glasses', topic: 'everyday', reusable: false },
  { id: 'queue-seats', topic: 'everyday', reusable: false },
  { id: 'family-photo-names', topic: 'everyday', reusable: false },
  { id: 'returning-umbrella', topic: 'everyday', reusable: false },
  { id: 'market-bench', topic: 'everyday', reusable: false },
  { id: 'address-correction', topic: 'everyday', reusable: false },
  { id: 'chalk-board', topic: 'education', reusable: true },
  { id: 'exercise-book', topic: 'education', reusable: true },
  { id: 'school-map', topic: 'education', reusable: true },
  { id: 'evening-students', topic: 'education', reusable: true },
  { id: 'spelling-contest', topic: 'education', reusable: false },
  { id: 'school-garden-plan', topic: 'education', reusable: false },
  { id: 'reading-pairs', topic: 'education', reusable: false },
  { id: 'geometry-models', topic: 'education', reusable: false },
  { id: 'school-newspaper', topic: 'education', reusable: false },
  { id: 'workshop-aprons', topic: 'education', reusable: false },
  { id: 'weather-notebook', topic: 'science', reusable: true },
  { id: 'shadow-dial', topic: 'science', reusable: true },
  { id: 'leaf-collection', topic: 'science', reusable: true },
  { id: 'magnifier-table', topic: 'science', reusable: true },
  { id: 'star-chart', topic: 'science', reusable: false },
  { id: 'water-level', topic: 'science', reusable: false },
  { id: 'seed-observation', topic: 'science', reusable: false },
  { id: 'sound-string', topic: 'science', reusable: false },
  { id: 'soil-jars', topic: 'science', reusable: false },
  { id: 'bridge-paper', topic: 'science', reusable: false },
  { id: 'common-key', topic: 'community', reusable: true },
  { id: 'allotment-path', topic: 'community', reusable: true },
  { id: 'neighbour-tools', topic: 'community', reusable: true },
  { id: 'noticeboard-space', topic: 'community', reusable: true },
  { id: 'laundry-roster', topic: 'community', reusable: false },
  { id: 'club-bookcase', topic: 'community', reusable: false },
  { id: 'bench-painting', topic: 'community', reusable: false },
  { id: 'allotment-library', topic: 'community', reusable: false },
  { id: 'shared-room-hours', topic: 'community', reusable: false },
  { id: 'courtyard-chronicle', topic: 'community', reusable: false },
] as const;
export type PressArticleId = typeof PRESS_ARTICLES[number]['id'];
export type PressTopic = typeof PRESS_ARTICLES[number]['topic'];
export interface NewspaperState {
  articleIds: PressArticleId[];
  classifiedIds: ClassifiedId[];
  usedArticleIds: PressArticleId[];
  /** Independent stream: reading and editorial choices cannot reroll patients. */
  rngState: number;
}

/** Priority articles reserve slots for future story copy, including a whole issue.
 * Fresh background copy always precedes repeats. Never duplicate an article in
 * one issue; prefer different topics and avoid yesterday's repeats where possible.
 */
export function nextNewspaper(seed: number, previous?: NewspaperState, priorityIds: readonly PressArticleId[] = []): NewspaperState {
  if (priorityIds.length > 4 || new Set(priorityIds).size !== priorityIds.length
    || priorityIds.some(id => !PRESS_ARTICLES.some(article => article.id === id))) throw new RangeError('Invalid editorial selection');
  let rngState = seed >>> 0;
  const draw = () => { const next = randomStep(rngState); rngState = next.seed; return next.value; };
  const count = Math.max(priorityIds.length, 3 + Math.floor(draw() * 2));
  const articleIds = [...priorityIds];
  const used = new Set(previous?.usedArticleIds ?? []);
  const topic = (id: PressArticleId): PressTopic => PRESS_ARTICLES.find(article => article.id === id)!.topic;
  while (articleIds.length < count) {
    const available = PRESS_ARTICLES.filter(article => !articleIds.includes(article.id));
    const fresh = available.filter(article => !used.has(article.id));
    let pool = fresh.length ? fresh : available.filter(article => article.reusable);
    if (!fresh.length) {
      const notYesterday = pool.filter(article => !previous?.articleIds.includes(article.id));
      if (notYesterday.length) pool = notYesterday;
    }
    const topics = new Set(articleIds.map(topic));
    const diverse = pool.filter(article => !topics.has(article.topic));
    if (diverse.length) pool = diverse;
    if (!pool.length) throw new RangeError('Insufficient newspaper material');
    articleIds.push(pool[Math.floor(draw() * pool.length)]!.id);
  }
  const classifiedIds: ClassifiedId[] = [];
  if (draw() < 0.75) {
    const adCount = 3 + Math.floor(draw() * 2);
    while (classifiedIds.length < adCount) {
      // Uniform sampling from the catalog: telephone contacts are optional.
      const pool = CLASSIFIEDS.filter(ad => !classifiedIds.includes(ad.id));
      classifiedIds.push(pool[Math.floor(draw() * pool.length)]!.id);
    }
    // Shuffle the printed order independently of catalog order.
    for (let i = classifiedIds.length - 1; i > 0; i--) {
      const j = Math.floor(draw() * (i + 1));
      [classifiedIds[i], classifiedIds[j]] = [classifiedIds[j]!, classifiedIds[i]!];
    }
  }
  return { articleIds, classifiedIds, usedArticleIds: [...new Set([...used, ...articleIds])], rngState };
}

export function createNewspaper(seed: number): NewspaperState {
  return nextNewspaper((seed ^ 0x4b555249) >>> 0);
}
