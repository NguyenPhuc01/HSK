import { pinyin } from 'pinyin-pro'

const WIKT = 'https://en.wiktionary.org'
const TRANSLATE = 'https://api.mymemory.translated.net/get'
const PINYIN_IME = 'https://inputtools.google.com/request'
const EXT_CACHE_PREFIX = 'hsk1-ext-vocab:'

const HAS_HAN = /\p{Script=Han}/u
const PINYIN_QUERY = /^[a-zA-ZüÜvVāáǎàēéěèīíǐìōóǒòūúǔùǖǘǚǜ\s0-9']+$/u

/** Cache trong phiên — tránh gọi lại cùng từ / cùng query. */
const memoryCache = new Map()

function cacheGet(key) {
  return memoryCache.has(key) ? memoryCache.get(key) : undefined
}

function cacheSet(key, value) {
  if (memoryCache.size > 200) {
    const first = memoryCache.keys().next().value
    memoryCache.delete(first)
  }
  memoryCache.set(key, value)
  return value
}

function stripHtml(html = '') {
  return html
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/\s+/g, ' ')
    .trim()
}

function stripPinyinTones(input) {
  return input
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/ü/gi, 'v')
    .replace(/Ü/g, 'V')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim()
}

function looksLikePinyin(query) {
  if (HAS_HAN.test(query)) return false
  if (!PINYIN_QUERY.test(query)) return false
  const bare = stripPinyinTones(query).replace(/[0-9']/g, '').trim()
  if (!bare || !/^[a-zv]+(\s+[a-zv]+)*$/i.test(bare)) return false
  const syllables = bare.split(/\s+/).filter(Boolean)
  if (syllables.length >= 2) return true
  return syllables.length === 1 && syllables[0].length >= 2 && syllables[0].length <= 24
}

function hanziLen(s) {
  return [...s].filter((ch) => HAS_HAN.test(ch)).length
}

function toPinyin(hanzi) {
  return pinyin(hanzi, { toneType: 'symbol', type: 'string', nonZh: 'consecutive' }).trim()
}

async function fetchJson(url, signal) {
  const res = await fetch(url, { signal, headers: { Accept: 'application/json' } })
  if (res.status === 404) return null
  if (!res.ok) {
    const err = new Error(`HTTP ${res.status}`)
    err.status = res.status
    throw err
  }
  return res.json()
}

/** Âm tiết pinyin phổ biến (không dấu), dài → ngắn để greedy match. */
const PINYIN_SYLLABLES = [
  'zhuang','chuang','shuang','zhuai','chuai','shuai','zhuan','chuan','shuan',
  'xiang','qiang','jiang','xiong','qiong','jiong',
  'zhang','chang','shang','zhong','chong','zheng','cheng','sheng',
  'guang','kuang','huang','wang','yang','ying','weng','yong',
  'zhua','chua','shua','zhui','chui','shui','zhuo','chuo','shuo','zhou','chou','shou',
  'zhao','chao','shao','zhei','shei','zhen','chen','shen','zhun','chun','shun',
  'bang','pang','mang','fang','dang','tang','nang','lang','gang','kang','hang','cang','sang','zang','rang',
  'dong','tong','nong','long','gong','kong','hong','cong','song','rong','zong',
  'bing','ping','ming','ding','ting','ning','ling','jing','qing','xing',
  'beng','peng','meng','feng','deng','teng','neng','leng','geng','keng','heng','ceng','seng','reng','zeng',
  'biao','piao','miao','diao','tiao','niao','liao','jiao','qiao','xiao',
  'bian','pian','mian','dian','tian','nian','lian','jian','qian','xian',
  'pie','mie','die','tie','nie','lie','jie','qie','xie',
  'dui','tui','gui','kui','hui','cui','sui','rui','zui',
  'duo','tuo','nuo','luo','guo','kuo','huo','cuo','suo','ruo','zuo',
  'dou','tou','nou','lou','gou','kou','hou','cou','sou','rou','zou',
  'dao','tao','nao','lao','gao','kao','hao','cao','sao','rao','zao',
  'dei','tei','nei','lei','gei','kei','hei','cei','sei','zei',
  'den','nen','gen','ken','hen','cen','sen','ren','zen',
  'dun','tun','nun','lun','gun','kun','hun','cun','sun','run','zun',
  'ang','eng','ing','ong','er',
  'ai','ei','ao','ou','an','en','ia','iao','ian','iang','ie','iu','in','iong','ua','uai','uan','uang','ue','ui','uo','un','ve','van','vn',
  'ba','pa','ma','fa','da','ta','na','la','ga','ka','ha','za','ca','sa','ra','ya','wa',
  'bo','po','mo','fo','lo','yo',
  'bi','pi','mi','di','ti','ni','li','ji','qi','xi','yi',
  'bu','pu','mu','fu','du','tu','nu','lu','gu','ku','hu','zu','cu','su','ru','wu','yu','nv','lv',
  'de','te','ne','le','ge','ke','he','ze','ce','se','re','me',
  'a','o','e','i','u','v',
].sort((a, b) => b.length - a.length)

const SYLLABLE_SET = new Set(PINYIN_SYLLABLES)

/** Tách pinyin dính: wanghong → wang hong */
function segmentPinyin(compact) {
  const s = compact.replace(/ü/g, 'v').replace(/[^a-zv]/g, '')
  if (!s) return []
  const parts = []
  let i = 0
  while (i < s.length) {
    let matched = ''
    for (const syl of PINYIN_SYLLABLES) {
      if (s.startsWith(syl, i) && SYLLABLE_SET.has(syl)) {
        matched = syl
        break
      }
    }
    if (!matched) return [s]
    parts.push(matched === 'v' ? 'ü' : matched.replace(/v/g, 'ü'))
    i += matched.length
  }
  return parts
}

async function imeCandidates(text, signal) {
  const data = await fetchJson(
    `${PINYIN_IME}?${new URLSearchParams({
      text,
      itc: 'zh-t-i0-pinyin',
      num: '8',
      cp: '0',
      cs: '1',
      ie: 'utf-8',
      oe: 'utf-8',
    })}`,
    signal,
  )
  if (!data) return []
  const row = data?.[1]?.[0]
  const list = row?.[1]
  const matched = row?.[3]?.matched_length
  if (!Array.isArray(list)) return []
  const fullLen = text.length
  return list
    .map((hanzi, i) => ({
      hanzi,
      match: Array.isArray(matched) ? matched[i] ?? 0 : 0,
      chars: typeof hanzi === 'string' ? hanziLen(hanzi) : 0,
      source: 'ime',
    }))
    .filter((x) => typeof x.hanzi === 'string' && HAS_HAN.test(x.hanzi))
    .map((x) => ({ ...x, full: x.match >= fullLen }))
}

/** Tra pinyin không dấu trên Wiktionary (vd. wanghong → 网红). */
async function wiktionaryPinyinSearch(compactAscii, signal) {
  const data = await fetchJson(
    `${WIKT}/w/api.php?${new URLSearchParams({
      action: 'query',
      list: 'search',
      srsearch: compactAscii,
      srlimit: '8',
      format: 'json',
      origin: '*',
    })}`,
    signal,
  )
  if (!data) return []

  const found = []
  for (const hit of data?.query?.search ?? []) {
    const plain = stripHtml(hit.snippet || '')
    // Wiktionary hay viết 繁 / 简 — ưu tiên giản thể sau dấu /
    const pair = plain.match(/(\p{Script=Han}+)\s*\/\s*(\p{Script=Han}+)/u)
    if (pair) {
      found.push(pair[2], pair[1])
    }
    const titleHans = hit.title.match(/\p{Script=Han}+/gu) ?? []
    const snippetHans = plain.match(/\p{Script=Han}+/gu) ?? []
    for (const h of [...titleHans, ...snippetHans]) {
      if (hanziLen(h) >= 1) found.push(h)
    }
  }
  return found
}

/** Pinyin (có/không dấu, có/không cách) → ứng viên chữ Hán. */
async function pinyinToHanziCandidates(query, signal) {
  const toneless = stripPinyinTones(query) // ü → v
  const compact = toneless.replace(/\s+/g, '')
  if (!compact) return []

  const cacheKey = `py:${compact}`
  const cached = cacheGet(cacheKey)
  if (cached) return cached

  try {
    const syllables = toneless.includes(' ')
      ? toneless.split(/\s+/).filter(Boolean)
      : segmentPinyin(compact)

    const spaced = syllables.map((s) => s.replace(/v/g, 'ü')).join(' ')
    const expectedChars = Math.max(1, syllables.length)

    const [imeRaw, wiktRaw] = await Promise.all([
      imeCandidates(spaced || compact.replace(/v/g, 'ü'), signal).catch(() => []),
      wiktionaryPinyinSearch(compact, signal).catch(() => []),
    ])

    const scored = []

    for (const hanzi of wiktRaw) {
      const chars = hanziLen(hanzi)
      if (chars < (expectedChars >= 2 ? 2 : 1)) continue
      const py = stripPinyinTones(toPinyin(hanzi)).replace(/\s+/g, '')
      const exactPy = py === compact ? 60 : 0
      scored.push({
        hanzi,
        score: 100 + chars * 3 + (chars === expectedChars ? 50 : 0) + exactPy,
      })
    }

    for (const item of imeRaw) {
      if (item.chars < (expectedChars >= 2 ? 2 : 1)) continue
      const py = stripPinyinTones(toPinyin(item.hanzi)).replace(/\s+/g, '')
      const exactPy = py === compact ? 40 : 0
      scored.push({
        hanzi: item.hanzi,
        score:
          (item.full ? 50 : 0) +
          item.match +
          item.chars * 2 +
          (item.chars === expectedChars ? 20 : 0) +
          exactPy,
      })
    }

    scored.sort((a, b) => b.score - a.score)
    const out = []
    const seen = new Set()
    const seenPinyin = new Set()
    for (const item of scored) {
      if (seen.has(item.hanzi)) continue
      const pyKey = stripPinyinTones(toPinyin(item.hanzi)).replace(/\s+/g, '')
      if (pyKey && seenPinyin.has(pyKey)) continue
      seen.add(item.hanzi)
      if (pyKey) seenPinyin.add(pyKey)
      out.push(item.hanzi)
      // Khớp đúng pinyin → một kết quả là đủ
      if (pyKey === compact || out.length >= 2) break
    }
    return cacheSet(cacheKey, out)
  } catch (err) {
    if (err?.name === 'AbortError') throw err
    return cacheSet(cacheKey, [])
  }
}


async function translateText(text, langpair, signal) {
  const clipped = text.slice(0, 180).trim()
  if (!clipped) return null
  const cacheKey = `tr:${langpair}:${clipped}`
  const cached = cacheGet(cacheKey)
  if (cached !== undefined) return cached

  try {
    const data = await fetchJson(
      `${TRANSLATE}?${new URLSearchParams({ q: clipped, langpair })}`,
      signal,
    )
    const out = data?.responseData?.translatedText?.trim()
    if (!out || out.toLowerCase() === clipped.toLowerCase()) return cacheSet(cacheKey, null)
    return cacheSet(cacheKey, out)
  } catch {
    return cacheSet(cacheKey, null)
  }
}

function extractEnglishGlosses(definitionPayload) {
  const zh = definitionPayload?.zh
  if (!Array.isArray(zh)) return []

  const glosses = []
  for (const entry of zh) {
    for (const def of entry.definitions ?? []) {
      const text = stripHtml(def.definition || '')
      if (text) glosses.push(text)
    }
  }
  return [...new Set(glosses)].slice(0, 3)
}

function pickBestEnglishGloss(glosses) {
  for (const g of glosses) {
    const part = g
      .split(/[;,/]/)[0]
      .replace(/\([^)]*\)/g, '')
      .replace(/\[[^\]]*]/g, '')
      .replace(/^to\s+/i, '')
      .trim()
    if (part && part.length >= 2 && part.length <= 60 && !/[?]/.test(part)) return part
  }
  return glosses[0] || ''
}

async function englishToVietnamese(englishPhrase, signal) {
  const cleaned = pickBestEnglishGloss([englishPhrase]) || englishPhrase.trim()
  if (!cleaned) return null
  const translated = await translateText(cleaned, 'en|vi', signal)
  if (!translated) return null
  if (/ngôi thứ|chia ở|conjugated|\?$/i.test(translated)) return null
  return translated.replace(/\?+$/, '').trim()
}

/** Một (tối đa hai) request Wiktionary — không parse từng chữ. */
async function fetchWiktionaryZh(hanzi, signal) {
  const cacheKey = `wikt:${hanzi}`
  const cached = cacheGet(cacheKey)
  if (cached !== undefined) return cached

  try {
    let data = await fetchJson(
      `${WIKT}/api/rest_v1/page/definition/${encodeURIComponent(hanzi)}`,
      signal,
    )
    if (data?.zh) return cacheSet(cacheKey, { title: hanzi, definition: data })

    // Soft redirect zh-see: chỉ 1 lần parse khi definition miss
    const parsed = await fetchJson(
      `${WIKT}/w/api.php?${new URLSearchParams({
        action: 'parse',
        page: hanzi,
        prop: 'wikitext',
        redirects: '1',
        format: 'json',
        origin: '*',
      })}`,
      signal,
    )
    const wikitext = parsed?.parse?.wikitext?.['*'] ?? ''
    const see = wikitext.match(/\{\{zh-see\|([^}|]+)/)
    const title = see?.[1]?.trim()
    if (!title || title === hanzi) return cacheSet(cacheKey, null)

    data = await fetchJson(
      `${WIKT}/api/rest_v1/page/definition/${encodeURIComponent(title)}`,
      signal,
    )
    if (data?.zh) return cacheSet(cacheKey, { title, definition: data })
    return cacheSet(cacheKey, null)
  } catch (err) {
    if (err?.name === 'AbortError') throw err
    return cacheSet(cacheKey, null)
  }
}

/**
 * Tra một chữ/cụm Hán — tối thiểu request.
 */
export async function lookupExternalHanzi(hanzi, signal) {
  const word = hanzi.trim()
  if (!word || !HAS_HAN.test(word)) return null

  const cacheKey = `word:${word}`
  const cached = cacheGet(cacheKey)
  if (cached !== undefined) return cached

  const resolved = await fetchWiktionaryZh(word, signal)
  const glosses = extractEnglishGlosses(resolved?.definition)
  if (!glosses.length) return cacheSet(cacheKey, null)

  const enMeaning = glosses.slice(0, 2).join('; ')
  const viMeaning = await englishToVietnamese(glosses[0], signal)

  return cacheSet(cacheKey, {
    hanzi: word,
    pinyin: toPinyin(word),
    meaningVi: viMeaning || pickBestEnglishGloss(glosses) || enMeaning,
    meaningLang: viMeaning ? 'vi' : 'en',
    source: 'wiktionary',
    canonical: resolved?.title && resolved.title !== word ? resolved.title : undefined,
  })
}

/**
 * Search ngoài: Hán / pinyin / VI|EN → tối đa 2 kết quả.
 */
export async function searchExternalVocab(query, signal) {
  const raw = query.trim()
  if (!raw) return { items: [], status: 'empty' }

  const searchKey = `search:${raw.toLowerCase()}`
  const cachedSearch = cacheGet(searchKey)
  if (cachedSearch !== undefined) return cachedSearch

  try {
    const candidates = []

    const hanMatches = raw.match(/\p{Script=Han}+/gu) ?? []
    if (hanMatches.length) {
      candidates.push(hanMatches[0])
    } else if (looksLikePinyin(raw)) {
      candidates.push(...(await pinyinToHanziCandidates(raw, signal)))
    } else {
      const fromVi = await translateText(raw, 'vi|zh-CN', signal)
      if (fromVi && HAS_HAN.test(fromVi)) {
        const hans = fromVi.match(/\p{Script=Han}+/gu) ?? []
        if (hans[0]) candidates.push(hans[0])
      } else {
        const fromEn = await translateText(raw, 'en|zh-CN', signal)
        const hans = fromEn?.match(/\p{Script=Han}+/gu) ?? []
        if (hans[0]) candidates.push(hans[0])
      }
      if (!candidates.length && /^[a-zv\s]+$/i.test(stripPinyinTones(raw))) {
        candidates.push(...(await pinyinToHanziCandidates(raw, signal)))
      }
    }

    const items = []
    const seen = new Set()
    for (const candidate of candidates.slice(0, 2)) {
      if (seen.has(candidate)) continue
      seen.add(candidate)
      try {
        const entry = await lookupExternalHanzi(candidate, signal)
        if (entry) items.push(entry)
      } catch (err) {
        if (err?.name === 'AbortError') throw err
      }
      if (items.length >= 2) break
    }

    const result = { items, status: items.length ? 'ok' : 'empty' }
    return cacheSet(searchKey, result)
  } catch (err) {
    if (err?.name === 'AbortError') throw err
    return { items: [], status: 'error', error: err?.message || 'Lỗi mạng' }
  }
}

export function saveExternalWord(word) {
  try {
    sessionStorage.setItem(EXT_CACHE_PREFIX + word.hanzi, JSON.stringify(word))
  } catch {
    /* ignore */
  }
  cacheSet(`word:${word.hanzi}`, word)
}

export function loadExternalWord(hanzi) {
  const mem = cacheGet(`word:${hanzi}`)
  if (mem) return mem
  try {
    const raw = sessionStorage.getItem(EXT_CACHE_PREFIX + hanzi)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export function externalVocabHref(hanzi, { q = '', g = 'all', t = '' } = {}) {
  const params = new URLSearchParams()
  params.set('ext', '1')
  if (g && g !== 'all') params.set('g', g)
  if (g === 'practical' && t) params.set('t', t)
  if (q.trim()) params.set('q', q.trim())
  return `/vocab/${encodeURIComponent(hanzi)}?${params.toString()}`
}
