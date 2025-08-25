// src/utils/classify.js
const RAW_TABLE = {
  war: [ 'war','attack','missile','shelling','airstrike','drone','bomb','frontline','troop','mobilization','palestinians','palestine',
    'military','battle','casualties','hostilities','explosion','artillery','conflict','raid','ceasefire','fighter jet','invasion',
    'occupation','combat','guerrilla','armor','weaponry','human shield','militant','terrorist','insurgency','resistance',
    'weapon stockpile','minefield','nuclear strike','force deployment','ammunition','sniper','detonation','hostage crisis','clash',
    'skirmish','crossfire','gunfire','air defense','naval strike','submarine','drone strike','missile launch','battleground',
    'massacre','proxy war','casualty count','wounded soldiers','strategic target','bombardment','chemical weapons','biological weapons',
    'military drills','mobilized army','armed forces','border clash','infiltration'
  ],
  politics: [ 'election','vote','parliament','government','prime minister','president','minister','policy','bill','act','senate','congress',
    'campaign','coalition','cabinet','supreme court','judiciary','political','diplomatic','sanction','treaty','referendum','ballot','lawmaker',
    'legislation','constitution','executive order','judicial review','lobbying','opposition leader','parliamentary debate','governing body',
    'head of state','state visit','assembly','council','politburo','monarchy','foreign relations','embassy','summit','un resolution',
    'trade agreement','budget proposal','tax policy','legislative reform','party convention','impeachment','opposition party','ruling party',
    'shadow cabinet','political corruption','campaign trail','fundraising','rally','candidate','left-wing','right-wing','populism',
    'authoritarian','secession','federal','dissolution','republic','democracy','dictatorship'
  ],
  culture: [ 'festival','art','museum','heritage','music','film','cinema','dance','literature','theatre','cultural','painting','exhibition',
    'tradition','language','religion','temple','cathedral','monument','craft','creative','orchestra','jazz','concert','performance','actor',
    'director','screenplay','opera','poetry','folk','archaeology','mythology','folklore','ritual','custom','sculpture','calligraphy','cuisine',
    'photography','portrait','landscape painting','costume','ceramics','handicraft','fashion show','cultural heritage','cultural festival',
    'ballet','classical music','storytelling','literary award','film premiere','box office','indigenous','tribal','heritage site'
  ],
  society: [ 'community','social','society','demographic','population','migration','urbanization','rural','education','healthcare','welfare',
    'inequality','poverty','employment','unemployment','labor rights','racial discrimination','minority rights','human rights','gender equality',
    'lgbtq','disabled','justice system','public health','mental health','family','marriage','childcare','housing','urban development',
    'smart cities','census','birth rate','death rate','aging population','social security','strike','protest','demonstration','student protests',
    'workers union','women empowerment','violence','crime rate','domestic abuse','rehabilitation','drug abuse','community center','neighborhood',
    'homelessness','migrant','refugee','inequity'
  ],
  demise: [ 'death','obituary','funeral','memorial','passing','loss','grief','mourning','tribute','legacy','remembrance','commemoration',
    'bereavement','tragic end','died','killed','fatal','last rites','condolence','eulogy','candlelight vigil','grave','cemetery','coffin',
    'cremation','hearse','mourner','succumbed','tributes','condolence message','paying respects','burial','mourning period'
  ],
  climate: [ 'climate','environment','pollution','sustainability','conservation','biodiversity','deforestation','climate change',
    'global warming','carbon emissions','renewable energy','greenhouse gases','fossil fuels','eco-friendly','recycling','waste management',
    'ocean plastic','ice melt','sea level rise','drought','heatwave','wildfire','flood','cyclone','hurricane','storm surge','mudslide',
    'paris agreement','environmentalist','carbon footprint','ecology','habitat loss','ozone layer','smog','carbon tax','green energy',
    'reforestation','extinction','natural disaster','sustainable farming','eco-system','wetlands','deforestation ban','solar power',
    'wind power','nuclear energy','climate summit'
  ],
  peace: [ 'peace','ceasefire','truce','negotiation','diplomacy','reconciliation','dialogue','settlement','armistice','peace talks',
    'conflict resolution','peacekeeping','accord','treaty','disarmament','conciliation','resolution','international mediation',
    'peace initiative','partnership','humanitarian corridor','bridge-building','stop violence','peace framework','rapprochement'
  ],
  economy: [ 'economy','inflation','recession','economic growth','gdp','stock market','finance','investment','trade','tariff','budget',
    'monetary policy','fiscal policy','employment rate','interest rate','central bank','currency','exchange rate','debt','bond market',
    'equity market','bankruptcy','stimulus','foreign investment','ppp','venture capital','private equity','subsidy','unemployment benefits',
    'retail sales','import/export','commodity prices','gold market','oil prices','manufacturing','industrial output','banking sector'
  ],
};

// lowercased lookup
const TABLE = Object.fromEntries(
  Object.entries(RAW_TABLE).map(([cat, words]) => [cat, words.map(w => String(w).toLowerCase())])
);

export function classifyText(text='') {
  const t = (text || '').toLowerCase();
  for (const [cat, words] of Object.entries(TABLE)) {
    for (const w of words) if (t.includes(w)) return cat;
  }
  return 'others';
}

export function dominantCategory(items=[]) {
  const counts = {};
  for (const it of items) {
    const c = it.category || 'others';
    counts[c] = (counts[c] || 0) + 1;
  }
  if (!Object.keys(counts).length) return 'others';
  const tieBreak = ['war','politics','economy','society','culture','climate','peace','demise','others'];
  return Object.keys(counts).reduce((best, k) =>
    best == null || counts[k] > counts[best] || (counts[k] === counts[best] && tieBreak.indexOf(k) < tieBreak.indexOf(best))
      ? k : best, null) || 'others';
}
