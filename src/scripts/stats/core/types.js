// The shapes every /stats module passes around, as JSDoc only. Nothing here runs; it exists so
// an editor (and the next person) can see what a Day, a Range or a RangeView holds without
// reading the code that builds them. DESIGN.md §D is the source these follow.

/** @typedef {'bot'|'scanner'|'agent'|'stale'|'person'} Kind */
/** @typedef {{bot:number, scanner:number, agent:number, stale:number, person:number, total:number}} KindSums */
/** @typedef {{kind:'last', n:number} | {kind:'day', d:string}} Range */           // d = 'YYYY-MM-DD'
/** @typedef {'pages'|'files'} Unit */
/** @typedef {'top'|'machines'|'growing'|'read'|'where'|'when'|'speed'|'how'|'ask'} RouteCh */
/** @typedef {{ch:RouteCh, sub:string|null, item:string|null}} Route */
/** @typedef {{range:Range, unit:Unit, tz:'local'|'utc', route:Route}} State */
/** @typedef {{id:string, slug:string, title:string, date:string}} Post */          // listed posts only
/** @typedef {{posts:Post[], bySlug:Map<string,Post>, labels:Record<string,string>,
 *            courses:{href:string,title:string}[]}} Build */
/** @typedef {{key:string, n:number, partial?:boolean}} Row */

/**
 * A day of the contract after normalize(): every map defaults to {}, every list to [],
 * people.hours to 24 zeros, rum to null when absent, reads to [].
 * @typedef {{
 *   d:string,
 *   req:Record<string,number>, pages:Record<string,number>, bytes:Record<string,number>,
 *   bots:[string,string,string,number,number][], agents:[string,number][], stale:[string,number][],
 *   probes:[string,number][], probeStatus:Record<string,number>, probeCountries:Record<string,number>,
 *   botCountries:Record<string,number>,
 *   people:{countries:Record<string,number>, devices:Record<string,number>, browsers:Record<string,number>,
 *           os:Record<string,number>, hours:number[], paths:[string,number][]},
 *   rum:null|{loads:number, visits:number, paths:[string,number][], referrers:[string,number][],
 *             countries:Record<string,number>, devices:Record<string,number>},
 *   reads:[string,number][]
 * }} Day
 */

/**
 * @typedef {{ v:1, site:string, builtAt:string, through:string,
 *   coverage:{days:number, wanted:number, first:string|null, totalsFirst:string|null},
 *   run:{queries:number, lastError:null|{at:string, message:string}},
 *   vitals:null|{from:string, to:string, desktop?:{n:number,lcp:number,inp:number,cls:number}, mobile?:{n:number,lcp:number,inp:number,cls:number}},
 *   totals:{cols:string[], rows:any[][], col:(name:string)=>number},
 *   days:Day[], ageHours:number }} Snap
 */

/**
 * @typedef {{lo:number, hi:number, loRaw:number, hiRaw:number, swappedDays:number, rumMissingDays:number,
 *   perDay:{d:string, lo:number, hi:number}[]}} PeopleRange
 */

/**
 * @typedef {{name:string, owner:string, category:string, purpose:'ai'|'search'|'seo'|'preview'|'other',
 *   files:number, pages:number, daysSeen:number, show:boolean}} BotRow
 */

/**
 * @typedef {{path:string, n:number, partial:boolean, label:string, kind:'post'|'site'|'course'|'lesson'|'other',
 *   id?:string, slug?:string, href:string, date?:string}} PathRow
 */

/**
 * Mounted is what every chapter's mount() resolves to.
 * @typedef {{ update(state:State, prev:State):void, go?(route:Route):void|Promise<void>, onMode?():void, destroy():void }} Mounted
 */

/**
 * Palette: resolved CSS colours for canvas drawing (ctx.palette()).
 * @typedef {{ person:string, personGlow:string, bot:string, scanner:string, agent:string, stale:string,
 *   total:string, you:string, page:string, bg:string, tile:string, line:string, line2:string,
 *   quiet:string, soft:string, body:string, strong:string, head:string, accent:string, mode:'night'|'day' }} Palette
 */

export {};
