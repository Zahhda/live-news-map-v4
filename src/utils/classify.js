// src/utils/classify.js
export const CATEGORIES = ['war','politics','economy','society','culture','climate','peace','demise','others'];

const SIGNALS = {
  war: [
    'war', 'attack', 'missile', 'shelling', 'airstrike', 'drone', 'bomb', 'frontline', 'troop', 'ceasefire', 
    'fighter jet', 'invasion', 'artillery', 'clash', 'strike', 'battle', 'combat', 'military', 'soldier', 
    'weapon', 'gunfire', 'explosion', 'casualty', 'wounded', 'killed', 'death', 'violence', 'conflict', 
    'hostile', 'enemy', 'defense', 'offensive', 'raid', 'ambush', 'siege', 'bombardment', 'retaliation',
    'terrorist', 'terrorism', 'bombing', 'shooting', 'massacre', 'genocide', 'ethnic cleansing', 'refugee',
    'displaced', 'evacuation', 'shelter', 'humanitarian', 'crisis', 'emergency', 'disaster', 'catastrophe'
  ],
  politics: [
    'election', 'parliament', 'senate', 'cabinet', 'minister', 'policy', 'vote', 'campaign', 'coalition', 
    'bill', 'mp', 'mla', 'president', 'pm', 'governor', 'assembly', 'government', 'administration', 'office',
    'democracy', 'republic', 'monarchy', 'dictatorship', 'authoritarian', 'regime', 'leadership', 'candidate',
    'polling', 'ballot', 'referendum', 'constitution', 'law', 'legislation', 'congress', 'senate', 'house',
    'party', 'political', 'politician', 'statesman', 'diplomat', 'ambassador', 'summit', 'meeting', 'conference',
    'treaty', 'agreement', 'negotiation', 'deal', 'accord', 'pact', 'alliance', 'partnership', 'cooperation'
  ],
  economy: [
    'inflation', 'gdp', 'market', 'stocks', 'unemployment', 'trade', 'imports', 'exports', 'budget', 'deficit',
    'currency', 'interest rate', 'economy', 'economic', 'financial', 'banking', 'investment', 'business',
    'corporate', 'company', 'industry', 'manufacturing', 'production', 'revenue', 'profit', 'loss', 'debt',
    'credit', 'loan', 'mortgage', 'tax', 'taxation', 'fiscal', 'monetary', 'policy', 'recession', 'depression',
    'boom', 'growth', 'development', 'infrastructure', 'construction', 'real estate', 'property', 'housing',
    'employment', 'job', 'workforce', 'labor', 'wage', 'salary', 'income', 'wealth', 'poverty', 'inequality'
  ],
  society: [
    'protest', 'education', 'healthcare', 'crime', 'community', 'social', 'welfare', 'migration', 'school',
    'university', 'hospital', 'poverty', 'homeless', 'unemployment', 'discrimination', 'racism', 'sexism',
    'equality', 'rights', 'freedom', 'justice', 'law', 'police', 'court', 'trial', 'prison', 'jail',
    'reform', 'change', 'movement', 'activism', 'activist', 'demonstration', 'rally', 'march', 'strike',
    'union', 'labor', 'worker', 'employee', 'employer', 'retirement', 'pension', 'benefit', 'insurance',
    'health', 'medical', 'doctor', 'nurse', 'patient', 'treatment', 'disease', 'illness', 'epidemic'
  ],
  culture: [
    'festival', 'music', 'film', 'art', 'literature', 'heritage', 'museum', 'theatre', 'sport', 'celebration',
    'cultural', 'tradition', 'custom', 'religion', 'faith', 'church', 'temple', 'mosque', 'synagogue',
    'spiritual', 'belief', 'worship', 'ceremony', 'ritual', 'holiday', 'festival', 'carnival', 'parade',
    'entertainment', 'show', 'performance', 'concert', 'exhibition', 'gallery', 'theater', 'cinema',
    'book', 'novel', 'poetry', 'writing', 'author', 'artist', 'musician', 'actor', 'actress', 'director',
    'sports', 'athlete', 'competition', 'tournament', 'championship', 'olympics', 'world cup', 'team'
  ],
  climate: [
    'climate', 'flood', 'heatwave', 'drought', 'cyclone', 'hurricane', 'storm', 'wildfire', 'rainfall',
    'monsoon', 'earthquake', 'tsunami', 'weather', 'temperature', 'global warming', 'greenhouse', 'emission',
    'carbon', 'pollution', 'environment', 'environmental', 'ecosystem', 'biodiversity', 'conservation',
    'renewable', 'solar', 'wind', 'energy', 'fossil fuel', 'oil', 'gas', 'coal', 'nuclear', 'sustainable',
    'green', 'eco-friendly', 'recycling', 'waste', 'garbage', 'trash', 'plastic', 'ocean', 'sea', 'river',
    'forest', 'deforestation', 'extinction', 'endangered', 'species', 'wildlife', 'animal', 'plant', 'tree'
  ],
  peace: [
    'ceasefire', 'peace talk', 'agreement', 'truce', 'deal', 'accord', 'peace', 'peaceful', 'harmony',
    'reconciliation', 'mediation', 'negotiation', 'diplomacy', 'dialogue', 'cooperation', 'collaboration',
    'unity', 'solidarity', 'brotherhood', 'sisterhood', 'friendship', 'love', 'compassion', 'forgiveness',
    'healing', 'recovery', 'reconstruction', 'rebuilding', 'development', 'progress', 'hope', 'optimism',
    'celebration', 'victory', 'success', 'achievement', 'accomplishment', 'milestone', 'breakthrough'
  ],
  demise: [
    'dies', 'death', 'passed away', 'obituary', 'killed', 'dead', 'fatal', 'mourns', 'condolence',
    'funeral', 'burial', 'memorial', 'tribute', 'legacy', 'remember', 'memory', 'grief', 'sorrow', 'sadness',
    'tragedy', 'accident', 'disaster', 'catastrophe', 'crisis', 'emergency', 'urgent', 'critical', 'serious',
    'injury', 'wounded', 'hurt', 'pain', 'suffering', 'agony', 'distress', 'anguish', 'despair', 'hopeless'
  ]
};

function score(text) {
  const t = (text || '').toLowerCase();
  const scores = Object.fromEntries(CATEGORIES.map(c => [c, 0]));
  for (const [cat, list] of Object.entries(SIGNALS)) {
    for (const w of list) if (t.includes(w)) scores[cat] += 1;
  }
  return scores;
}

export function classifyText(text) {
  const s = score(text);
  let best = 'others', bestVal = -1;
  for (const [k,v] of Object.entries(s)) if (v > bestVal) { best = k; bestVal = v; }
  return best;
}

export function dominantCategory(items = []) {
  const counts = Object.fromEntries(CATEGORIES.map(c => [c, 0]));
  for (const it of items) counts[classifyText(`${it.title} ${it.summary}`)]++;
  return Object.entries(counts).sort((a,b)=>b[1]-a[1])[0]?.[0] || 'others';
}