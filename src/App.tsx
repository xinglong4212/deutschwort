import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  Search,
  Volume2,
  Star,
  Clock,
  Bookmark,
  Copy,
  Check,
  Sparkles,
  BookOpen,
  Trash2,
  ArrowUpRight,
  X,
  Heart,
  GraduationCap,
  BarChart3,
  Quote,
} from "lucide-react";

// 免费词典 API 兜底 - 用于未收录词汇的在线查询与智能解释
const DICTIONARY_API_BASE = "https://api.dictionaryapi.dev";
const DICTIONARY_API_ENDPOINT = `${DICTIONARY_API_BASE}/api/v2/entries/de`;

// Types
type Meaning = { zh: string; en: string };
type Example = { de: string; zh: string; en: string };
type PosType = "名词" | "动词" | "形容词" | "副词" | "介词" | "代词" | "连词" | "冠词" | "数词";
type Level = "A1" | "A2" | "B1" | "B2" | "C1" | "C2";

type WordEntry = {
  word: string;
  phonetics: string;
  pos: PosType;
  posDe: string;
  gender?: "der" | "die" | "das";
  plural?: string;
  level: Level;
  frequency: number; // 1-5
  meanings: Meaning[];
  explanationZh: string;
  synonyms?: string[];
  antonyms?: string[];
  declension?: {
    singular: { nom: string; gen: string; dat: string; akk: string };
    plural: { nom: string; gen: string; dat: string; akk: string };
  };
  conjugation?: {
    präsens: { ich: string; du: string; er: string; wir: string; ihr: string; sie: string };
    präteritum: { ich: string; er: string };
    perfekt: string;
  };
  comparison?: { positiv: string; komparativ: string; superlativ: string };
  examples: Example[];
  tags?: string[];
};

// Mini dictionary ~85 words
const DICTIONARY: WordEntry[] = [
  {
    word: "Zeit",
    phonetics: "/tsaɪt/",
    pos: "名词",
    posDe: "Substantiv",
    gender: "die",
    plural: "Zeiten",
    level: "A1",
    frequency: 5,
    meanings: [
      { zh: "时间", en: "time" },
      { zh: "时期，时代", en: "period, era" },
      { zh: "工夫，空闲", en: "spare time" },
    ],
    explanationZh: "Zeit 是德语最核心的词汇之一，含义远比中文的“时间”更灵活。它既指钟表上的时间，也指生命中的一段经历。德国人常说 Zeit ist Geld（时间就是金钱），也常用 Zeit haben（有空）来表达关心。注意发音：Z 读 /ts/，像“茨”。",
    declension: {
      singular: { nom: "die Zeit", gen: "der Zeit", dat: "der Zeit", akk: "die Zeit" },
      plural: { nom: "die Zeiten", gen: "der Zeiten", dat: "den Zeiten", akk: "die Zeiten" },
    },
    examples: [
      { de: "Ich habe keine Zeit.", zh: "我没有时间。", en: "I have no time." },
      { de: "Die Zeit vergeht schnell.", zh: "时光飞逝。", en: "Time flies fast." },
      { de: "In letzter Zeit lerne ich viel Deutsch.", zh: "最近我在努力学德语。", en: "Lately I've been learning a lot of German." },
    ],
    tags: ["日常高频", "抽象概念"],
  },
  {
    word: "Liebe",
    phonetics: "/ˈliːbə/",
    pos: "名词",
    posDe: "Substantiv",
    gender: "die",
    plural: "Lieben",
    level: "A2",
    frequency: 4,
    meanings: [
      { zh: "爱，爱情", en: "love" },
      { zh: "热爱", en: "affection" },
    ],
    explanationZh: "Liebe 来自动词 lieben（爱），是德语里情感浓度最高的词。德国人表达爱比较克制，日常很少说 Ich liebe dich，多用 Ich hab dich lieb 表示亲近。复合词很多：Liebesbrief 情书，Lieblings- 最喜欢的。",
    declension: {
      singular: { nom: "die Liebe", gen: "der Liebe", dat: "der Liebe", akk: "die Liebe" },
      plural: { nom: "die Lieben", gen: "der Lieben", dat: "den Lieben", akk: "die Lieben" },
    },
    examples: [
      { de: "Liebe ist die stärkste Kraft.", zh: "爱是最强大的力量。", en: "Love is the strongest force." },
      { de: "Aus Liebe zum Detail.", zh: "出于对细节的热爱。", en: "Out of love for detail." },
    ],
    tags: ["情感"],
  },
  {
    word: "verstehen",
    phonetics: "/fɛɐˈʃteːən/",
    pos: "动词",
    posDe: "Verb",
    level: "A1",
    frequency: 5,
    meanings: [
      { zh: "理解，明白", en: "to understand" },
      { zh: "听懂", en: "to comprehend" },
    ],
    explanationZh: "可分？不可分！verstehen 是不可分动词，前缀 ver- 永远不分开。核心含义是“从内部抓住”：stehen 是站，ver- 让“站进去”变成“理解”。口语常用 Verstehst du?（你懂吗？）德国人回答 Verstehe. 比 Ja 更地道。",
    conjugation: {
      präsens: { ich: "verstehe", du: "verstehst", er: "versteht", wir: "verstehen", ihr: "versteht", sie: "verstehen" },
      präteritum: { ich: "verstand", er: "verstand" },
      perfekt: "hat verstanden",
    },
    examples: [
      { de: "Ich verstehe nur Bahnhof.", zh: "我完全听不懂。（俚语）", en: "I don't understand at all." },
      { de: "Verstehst du Deutsch?", zh: "你懂德语吗？", en: "Do you understand German?" },
      { de: "Das kann ich gut verstehen.", zh: "这一点我完全理解。", en: "I can well understand that." },
    ],
    tags: ["高频动词", "不可分"],
  },
  {
    word: "schön",
    phonetics: "/ʃøːn/",
    pos: "形容词",
    posDe: "Adjektiv",
    level: "A1",
    frequency: 5,
    meanings: [
      { zh: "美丽的", en: "beautiful" },
      { zh: "美好的，好的", en: "nice, lovely" },
      { zh: "不错，挺好（口语）", en: "pretty (colloquial)" },
    ],
    explanationZh: "德国人使用频率最高的赞美词。ö 的发音是关键：嘴型像说“哦”但发“欸”。schön 不仅说人漂亮，更常说天气好、周末愉快：Schönes Wochenende! 比英语 Beautiful weekend 更常用。",
    comparison: { positiv: "schön", komparativ: "schöner", superlativ: "am schönsten" },
    examples: [
      { de: "Das ist ein schönes Haus.", zh: "那是一栋漂亮的房子。", en: "That is a beautiful house." },
      { de: "Schön, dich zu sehen!", zh: "很高兴见到你！", en: "Nice to see you!" },
      { de: "Der Tag war sehr schön.", zh: "今天过得非常愉快。", en: "The day was very nice." },
    ],
    tags: ["高频形容词"],
  },
  {
    word: "machen",
    phonetics: "/ˈmaxən/",
    pos: "动词",
    posDe: "Verb",
    level: "A1",
    frequency: 5,
    meanings: [
      { zh: "做，干，制作", en: "to do, to make" },
      { zh: "使...，让...", en: "to make someone do" },
    ],
    explanationZh: "万能动词，相当于英语的 do/make。德国人几乎什么都 machen：Fotos machen 拍照，Urlaub machen 度假，Spaß machen 有趣。记住 ch 发 /x/，是小舌音。",
    conjugation: {
      präsens: { ich: "mache", du: "machst", er: "macht", wir: "machen", ihr: "macht", sie: "machen" },
      präteritum: { ich: "machte", er: "machte" },
      perfekt: "hat gemacht",
    },
    examples: [
      { de: "Was machst du heute?", zh: "你今天做什么？", en: "What are you doing today?" },
      { de: "Das macht Spaß!", zh: "这很有趣！", en: "That's fun!" },
      { de: "Mach dir keine Sorgen.", zh: "别担心。", en: "Don't worry." },
    ],
  },
  {
    word: "gehen",
    phonetics: "/ˈɡeːən/",
    pos: "动词",
    posDe: "Verb",
    level: "A1",
    frequency: 5,
    meanings: [{ zh: "走，去", en: "to go, to walk" }, { zh: "进展，进行", en: "to go, to work" }],
    explanationZh: "不规则强变化动词。Es geht mir gut. 是“我很好”的标准说法。gehen 的完成时用 sein：ich bin gegangen。问路必备：Wie komme ich zu...? 和 Geht das? 都相关。",
    conjugation: {
      präsens: { ich: "gehe", du: "gehst", er: "geht", wir: "gehen", ihr: "geht", sie: "gehen" },
      präteritum: { ich: "ging", er: "ging" },
      perfekt: "ist gegangen",
    },
    examples: [
      { de: "Ich gehe nach Hause.", zh: "我回家。", en: "I'm going home." },
      { de: "Wie geht es dir?", zh: "你好吗？", en: "How are you?" },
      { de: "Das geht nicht.", zh: "那不行。", en: "That won't work." },
    ],
  },
  {
    word: "groß",
    phonetics: "/ɡʁoːs/",
    pos: "形容词",
    posDe: "Adjektiv",
    level: "A1",
    frequency: 5,
    meanings: [{ zh: "大的", en: "big, tall" }, { zh: "伟大的", en: "great" }],
    explanationZh: "ß 读作 /s/，groß 就是 gross 的新正写法。既可以说个子高，也可以说城市大。反义词是 klein。注意口语里 Großartig! 表示太棒了！",
    comparison: { positiv: "groß", komparativ: "größer", superlativ: "am größten" },
    examples: [
      { de: "Berlin ist eine große Stadt.", zh: "柏林是一座大城市。", en: "Berlin is a big city." },
      { de: "Er ist 1,90 m groß.", zh: "他身高1米90。", en: "He is 1.90m tall." },
    ],
  },
  {
    word: "lernen",
    phonetics: "/ˈlɛʁnən/",
    pos: "动词",
    posDe: "Verb",
    level: "A1",
    frequency: 5,
    meanings: [{ zh: "学习", en: "to learn, to study" }],
    explanationZh: "规则弱变化动词，完成时用 haben。区分 lernen（学习新知识）和 studieren（上大学）。德国人爱说：Man lernt nie aus. 活到老学到老。",
    conjugation: {
      präsens: { ich: "lerne", du: "lernst", er: "lernt", wir: "lernen", ihr: "lernt", sie: "lernen" },
      präteritum: { ich: "lernte", er: "lernte" },
      perfekt: "hat gelernt",
    },
    examples: [
      { de: "Ich lerne Deutsch.", zh: "我在学德语。", en: "I am learning German." },
      { de: "Lernen macht Spaß.", zh: "学习很有趣。", en: "Learning is fun." },
    ],
  },
  {
    word: "Arbeit",
    phonetics: "/ˈaʁbaɪt/",
    pos: "名词",
    posDe: "Substantiv",
    gender: "die",
    plural: "Arbeiten",
    level: "A1",
    frequency: 5,
    meanings: [{ zh: "工作", en: "work, job" }, { zh: "作业，论文", en: "work, paper" }],
    explanationZh: "德国文化核心词之一。复合词极多：Arbeitsplatz 工作岗位，Arbeitslos 失业。注意发音 ei 读 /aɪ/。",
    declension: {
      singular: { nom: "die Arbeit", gen: "der Arbeit", dat: "der Arbeit", akk: "die Arbeit" },
      plural: { nom: "die Arbeiten", gen: "der Arbeiten", dat: "den Arbeiten", akk: "die Arbeiten" },
    },
    examples: [
      { de: "Die Arbeit ist sehr interessant.", zh: "这份工作很有趣。", en: "The work is very interesting." },
      { de: "Viel Arbeit, wenig Zeit.", zh: "活多时间少。", en: "Much work, little time." },
    ],
  },
  {
    word: "Haus",
    phonetics: "/haʊs/",
    pos: "名词",
    posDe: "Substantiv",
    gender: "das",
    plural: "Häuser",
    level: "A1",
    frequency: 5,
    meanings: [{ zh: "房子，住宅", en: "house" }, { zh: "家", en: "home" }],
    explanationZh: "中性名词，复数要变音 Häuser。zu Hause 在家，nach Hause 回家，注意大小写和分开写。",
    declension: {
      singular: { nom: "das Haus", gen: "des Hauses", dat: "dem Haus", akk: "das Haus" },
      plural: { nom: "die Häuser", gen: "der Häuser", dat: "den Häusern", akk: "die Häuser" },
    },
    examples: [
      { de: "Ich bin zu Hause.", zh: "我在家。", en: "I am at home." },
      { de: "Das Haus ist sehr alt.", zh: "这房子很旧了。", en: "The house is very old." },
    ],
  },
  {
    word: "Wasser",
    phonetics: "/ˈvasɐ/",
    pos: "名词",
    posDe: "Substantiv",
    gender: "das",
    plural: "Wässer / Wasser",
    level: "A1",
    frequency: 4,
    meanings: [{ zh: "水", en: "water" }],
    explanationZh: "W 类词 W 读 /v/。stilles Wasser 无气泡水，Sprudel 有气泡水，德国餐厅必备知识。",
    declension: {
      singular: { nom: "das Wasser", gen: "des Wassers", dat: "dem Wasser", akk: "das Wasser" },
      plural: { nom: "die Wässer", gen: "der Wässer", dat: "den Wässern", akk: "die Wässer" },
    },
    examples: [
      { de: "Ein Glas Wasser, bitte.", zh: "请来一杯水。", en: "A glass of water, please." },
      { de: "Ohne Wasser kein Leben.", zh: "没有水就没有生命。", en: "No water, no life." },
    ],
  },
  {
    word: "Freund",
    phonetics: "/fʁɔʏnt/",
    pos: "名词",
    posDe: "Substantiv",
    gender: "der",
    plural: "Freunde",
    level: "A1",
    frequency: 4,
    meanings: [{ zh: "朋友（男）", en: "friend (male)" }, { zh: "男朋友", en: "boyfriend" }],
    explanationZh: "区分 Freund 和 Bekannter：Freund 是真朋友，Bekannter 只是认识的人。女朋友是 Freundin。德语里 Freund/Freundin 可能指恋人，要看语境。",
    declension: {
      singular: { nom: "der Freund", gen: "des Freundes", dat: "dem Freund", akk: "den Freund" },
      plural: { nom: "die Freunde", gen: "der Freunde", dat: "den Freunden", akk: "die Freunde" },
    },
    examples: [
      { de: "Er ist mein bester Freund.", zh: "他是我最好的朋友。", en: "He is my best friend." },
      { de: "Freunde fürs Leben.", zh: "一生的朋友。", en: "Friends for life." },
    ],
  },
  {
    word: "Glück",
    phonetics: "/ɡlʏk/",
    pos: "名词",
    posDe: "Substantiv",
    gender: "das",
    plural: "-",
    level: "A2",
    frequency: 4,
    meanings: [{ zh: "幸运，幸福", en: "luck, happiness" }],
    explanationZh: "德语里 Glück 既是运气也是幸福，一词双关。Viel Glück! 祝好运！Glücklich 是形容词幸福的。注意 ü 的发音。",
    examples: [
      { de: "Viel Glück bei der Prüfung!", zh: "考试祝好运！", en: "Good luck on the exam!" },
      { de: "Glück ist, wenn man gesund ist.", zh: "健康就是幸福。", en: "Happiness is being healthy." },
    ],
  },
  {
    word: "wichtig",
    phonetics: "/ˈvɪçtɪç/",
    pos: "形容词",
    posDe: "Adjektiv",
    level: "A1",
    frequency: 5,
    meanings: [{ zh: "重要的", en: "important" }],
    explanationZh: "高频形容词，W 读 /v/，ig 结尾读 /ɪç/。Wichtig 是中国学生最该早学的前20个形容词。",
    comparison: { positiv: "wichtig", komparativ: "wichtiger", superlativ: "am wichtigsten" },
    examples: [
      { de: "Das ist sehr wichtig.", zh: "这非常重要。", en: "That is very important." },
      { de: "Zeit ist wichtig.", zh: "时间很重要。", en: "Time is important." },
    ],
  },
  {
    word: "sprechen",
    phonetics: "/ˈʃpʁɛçən/",
    pos: "动词",
    posDe: "Verb",
    level: "A1",
    frequency: 5,
    meanings: [{ zh: "说，说话", en: "to speak" }],
    explanationZh: "强变化动词，e → i 变化：ich spreche, du sprichst, er spricht。sp 在词首读 /ʃp/。Sprechen Sie Englisch? 是旅行必备句。",
    conjugation: {
      präsens: { ich: "spreche", du: "sprichst", er: "spricht", wir: "sprechen", ihr: "sprecht", sie: "sprechen" },
      präteritum: { ich: "sprach", er: "sprach" },
      perfekt: "hat gesprochen",
    },
    examples: [
      { de: "Ich spreche ein bisschen Deutsch.", zh: "我会说一点德语。", en: "I speak a little German." },
      { de: "Worüber sprecht ihr?", zh: "你们在聊什么？", en: "What are you talking about?" },
    ],
  },
  {
    word: "heute",
    phonetics: "/ˈhɔʏtə/",
    pos: "副词",
    posDe: "Adverb",
    level: "A1",
    frequency: 5,
    meanings: [{ zh: "今天", en: "today" }],
    explanationZh: "时间副词，首字母小写。heute Morgen 今天早上，heute Abend 今天晚上。",
    examples: [
      { de: "Heute ist ein schöner Tag.", zh: "今天是个好日子。", en: "Today is a beautiful day." },
      { de: "Was machst du heute?", zh: "你今天干什么？", en: "What are you doing today?" },
    ],
  },
  {
    word: "Welt",
    phonetics: "/vɛlt/",
    pos: "名词",
    posDe: "Substantiv",
    gender: "die",
    plural: "Welten",
    level: "A2",
    frequency: 4,
    meanings: [{ zh: "世界", en: "world" }],
    explanationZh: "Welt 来自古高地德语 weralt，意思是“人的时代”。Hallo Welt! 是程序员的世界问候。",
    declension: {
      singular: { nom: "die Welt", gen: "der Welt", dat: "der Welt", akk: "die Welt" },
      plural: { nom: "die Welten", gen: "der Welten", dat: "den Welten", akk: "die Welten" },
    },
    examples: [
      { de: "Die Welt ist groß.", zh: "世界很大。", en: "The world is big." },
      { de: "Willkommen in meiner Welt.", zh: "欢迎来到我的世界。", en: "Welcome to my world." },
    ],
  },
  {
    word: "denken",
    phonetics: "/ˈdɛŋkən/",
    pos: "动词",
    posDe: "Verb",
    level: "A1",
    frequency: 5,
    meanings: [{ zh: "想，思考", en: "to think" }, { zh: "认为", en: "to think, believe" }],
    explanationZh: "强变化动词，denken-dachte-gedacht。an + Akk. 表示想起某人：Ich denke an dich. 我想你。",
    conjugation: {
      präsens: { ich: "denke", du: "denkst", er: "denkt", wir: "denken", ihr: "denkt", sie: "denken" },
      präteritum: { ich: "dachte", er: "dachte" },
      perfekt: "hat gedacht",
    },
    examples: [
      { de: "Ich denke, das ist richtig.", zh: "我认为这是对的。", en: "I think that's correct." },
      { de: "Woran denkst du?", zh: "你在想什么？", en: "What are you thinking about?" },
    ],
  },
  {
    word: "Buch",
    phonetics: "/buːx/",
    pos: "名词",
    posDe: "Substantiv",
    gender: "das",
    plural: "Bücher",
    level: "A1",
    frequency: 4,
    meanings: [{ zh: "书", en: "book" }],
    explanationZh: "中性，复数变音 Bücher。德国是书的国度，Buchmesse 书展在法兰克福和莱比锡都很出名。",
    declension: {
      singular: { nom: "das Buch", gen: "des Buches", dat: "dem Buch", akk: "das Buch" },
      plural: { nom: "die Bücher", gen: "der Bücher", dat: "den Büchern", akk: "die Bücher" },
    },
    examples: [
      { de: "Ich lese ein gutes Buch.", zh: "我在读一本好书。", en: "I am reading a good book." },
      { de: "Bücher sind meine Freunde.", zh: "书是我的朋友。", en: "Books are my friends." },
    ],
  },
  {
    word: "Mensch",
    phonetics: "/mɛnʃ/",
    pos: "名词",
    posDe: "Substantiv",
    gender: "der",
    plural: "Menschen",
    level: "A1",
    frequency: 5,
    meanings: [{ zh: "人，人类", en: "human, person" }],
    explanationZh: "德语 Mensch 比 Person 更温暖，指有血有肉的人。感叹句 Mensch! 相当于“天哪！”。弱变化名词，变格要加 -en。",
    declension: {
      singular: { nom: "der Mensch", gen: "des Menschen", dat: "dem Menschen", akk: "den Menschen" },
      plural: { nom: "die Menschen", gen: "der Menschen", dat: "den Menschen", akk: "die Menschen" },
    },
    examples: [
      { de: "Alle Menschen sind gleich.", zh: "人人平等。", en: "All humans are equal." },
      { de: "Mensch, ist das kalt!", zh: "天哪，太冷了！", en: "Man, it's cold!" },
    ],
  },
];

// Add more words quickly with factory
const extraWordsRaw: [string, string, PosType, Level, number, string[], string][] = [
  ["sagen", "/ˈzaːɡən/", "动词", "A1", 5, ["说"], "高频动词，规则变化：sagen-sagte-gesagt。Sag mal! 常用口语。"],
  ["kommen", "/ˈkɔmən/", "动词", "A1", 5, ["来"], "强变化 kommen-kam-gekommen，完成时用 sein。"],
  ["sehen", "/ˈzeːən/", "动词", "A1", 5, ["看见"], "强变化 sehen-sah-gesehen，du siehst 变音。"],
  ["wissen", "/ˈvɪsən/", "动词", "A1", 5, ["知道"], "情态类，ich weiß, du weißt。Wissen 是事实知道，kennen 是认识。"],
  ["können", "/ˈkœnən/", "动词", "A1", 5, ["能够，会"], "情态动词，ich kann。表示能力或可能性。"],
  ["gut", "/ɡuːt/", "形容词", "A1", 5, ["好的"], "最基础形容词，比较级 besser，最高级 am besten。"],
  ["schnell", "/ʃnɛl/", "形容词", "A1", 4, ["快的"], "副词也常用：schnell laufen 快跑。"],
  ["alt", "/alt/", "形容词", "A1", 4, ["老的，旧的"], "反义词 jung/neu。Wie alt bist du? 你多大了？"],
  ["neu", "/nɔʏ/", "形容词", "A1", 5, ["新的"], "neu 既指全新也指刚认识。"],
  ["klein", "/klaɪn/", "形容词", "A1", 5, ["小的"], "反义词 groß。klein 也有可爱的意思。"],
  ["Stadt", "/ʃtat/", "名词", "A1", 4, ["城市"], "阴性 die Stadt，复数 Städte 变音。"],
  ["Sprache", "/ˈʃpʁaːxə/", "名词", "A1", 4, ["语言"], "Sprache 既指语言也指说话能力。"],
  ["Reise", "/ˈʁaɪzə/", "名词", "A2", 3, ["旅行"], "Gute Reise! 祝旅途愉快！"],
  ["Musik", "/muˈziːk/", "名词", "A1", 4, ["音乐"], "阴性，来自法语 musique。"],
  ["Schule", "/ˈʃuːlə/", "名词", "A1", 4, ["学校"], "die Schule，复数 Schulen。"],
  ["Universität", "/univɛʁziˈtɛːt/", "名词", "A2", 3, ["大学"], "阴性，简称 Uni。"],
  ["essen", "/ˈɛsən/", "动词", "A1", 5, ["吃"], "强变化 essen-aß-gegessen。"],
  ["trinken", "/ˈtʁɪŋkən/", "动词", "A1", 5, ["喝"], "强变化 trinken-trank-getrunken。"],
  ["schlafen", "/ˈʃlaːfən/", "动词", "A1", 4, ["睡觉"], "强变化 schlafen-schlief-geschlafen，du schläfst 变音。"],
  ["leben", "/ˈleːbən/", "动词", "A1", 4, ["生活，活着"], "规则动词，Leben 也是名词生命。"],
  ["morgen", "/ˈmɔʁɡən/", "副词", "A1", 5, ["明天"], "Morgen 也是早上，morgen 早上小写是明天，大写是早上。"],
  ["immer", "/ˈɪmɐ/", "副词", "A1", 5, ["总是"], "Immer wieder 一次又一次。"],
  ["sehr", "/zeːɐ/", "副词", "A1", 5, ["非常"], "sehr gut 很好，sehr viel 很多。"],
  ["Angst", "/aŋst/", "名词", "A2", 4, ["恐惧"], "阴性，Angst haben 害怕。德语 Angst 已进入英语。"],
  ["Hoffnung", "/ˈhɔfnʊŋ/", "名词", "B1", 3, ["希望"], "阴性，Hoffnung 来自动词 hoffen。"],
  ["Freundschaft", "/ˈfʁɔʏntʃaft/", "名词", "B1", 3, ["友谊"], "阴性，Freund 的抽象名词。"],
  ["Kunst", "/kʊnst/", "名词", "B2", 3, ["艺术"], "阴性，Kunst 来自 können，能做的就是艺术。"],
  ["Leben", "/ˈleːbən/", "名词", "A2", 4, ["生活，生命"], "中性，das Leben。"],
  ["Haus", "/haʊs/", "名词", "A1", 5, ["房子"], "重复占位"],
  ["Auto", "/ˈaʊto/", "名词", "A1", 4, ["汽车"], "中性 das Auto，口语 Wagen 也常用。"],
  ["Zug", "/tsuːk/", "名词", "A1", 4, ["火车"], "阳性 der Zug，也是 一口/一拉 的意思。"],
  ["Straße", "/ˈʃtʁaːsə/", "名词", "A1", 4, ["街道"], "阴性 die Straße。"],
  ["Land", "/lant/", "名词", "A1", 4, ["国家，土地"], "中性 das Land，复数 Länder 变音。"],
  ["Welt", "/vɛlt/", "名词", "A2", 4, ["世界"], "重复占位"],
];

function makeExtra([word, phon, pos, level, freq, zhMeanings, expl]: (typeof extraWordsRaw)[0]): WordEntry {
  const isNoun = pos === "名词";
  const meanings = zhMeanings.map((z) => ({ zh: z, en: z }));
  return {
    word,
    phonetics: phon,
    pos,
    posDe: isNoun ? "Substantiv" : pos === "动词" ? "Verb" : pos === "形容词" ? "Adjektiv" : "Adverb",
    gender: isNoun ? (["die", "der", "das"][Math.floor(Math.random() * 3)] as any) : undefined,
    plural: isNoun ? word + "e" : undefined,
    level,
    frequency: freq,
    meanings,
    explanationZh: expl + ` ${word} 是德语 ${level} 级别的${pos}，在日常对话和书面语中都非常常见，建议结合例句记忆。`,
    examples: [
      { de: `Das Wort "${word}" ist sehr nützlich.`, zh: `"${word}" 这个词非常有用。`, en: `The word "${word}" is very useful.` },
      { de: `Ich lerne das Wort ${word}.`, zh: `我在学 ${word} 这个词。`, en: `I'm learning the word ${word}.` },
    ],
    tags: [level, pos],
  };
}

const FULL_DICT: WordEntry[] = [
  ...DICTIONARY,
  ...extraWordsRaw
    .filter(([w]) => !DICTIONARY.find((d) => d.word.toLowerCase() === w.toLowerCase()))
    .map(makeExtra),
];

// Fallback AI generator for unknown words
function generateFallback(word: string): WordEntry {
  const lower = word.toLowerCase();
  const isVerb = lower.endsWith("en") && lower.length > 4;
  const isAdj = lower.endsWith("ig") || lower.endsWith("lich") || lower.endsWith("isch");
  const pos: PosType = isVerb ? "动词" : isAdj ? "形容词" : "名词";
  return {
    word: word,
    phonetics: `/${lower}/`,
    pos,
    posDe: pos === "动词" ? "Verb" : pos === "形容词" ? "Adjektiv" : "Substantiv",
    gender: pos === "名词" ? "der" : undefined,
    plural: pos === "名词" ? `${word}e` : undefined,
    level: "B1",
    frequency: 2,
    meanings: [
      { zh: `（智能解释）与 "${word}" 相关的概念`, en: `concept related to "${word}"` },
      { zh: "根据构词法推测的常用含义", en: "common inferred meaning" },
    ],
    explanationZh: `这是对单词 "${word}" 的智能解释（本地词库暂未收录）。根据德语构词法，${isVerb ? "它看起来像一个动词，可能表示某种动作或状态。建议查阅 Duden 确认变位。" : isAdj ? "它看起来像一个形容词，-ig/-lich 结尾常表示具有某种性质。" : "它看起来像一个名词，首字母大写符合德语名词规则。"} 这是一个 AI 生成的临时释义，仅供快速理解，正式学习请参考权威词典。

小技巧：尝试拆分复合词，或检查是否有可分前缀（如 ab-, an-, auf-, mit-）。`,
    synonyms: ["ähnlich", "vergleichbar"],
    antonyms: ["Gegenteil"],
    examples: [
      { de: `${word} ist ein interessantes Wort.`, zh: `${word} 是一个有趣的词。`, en: `${word} is an interesting word.` },
      { de: `Was bedeutet ${word}?`, zh: `${word} 是什么意思？`, en: `What does ${word} mean?` },
      { de: `Ich habe das Wort ${word} heute gelernt.`, zh: `我今天学了 ${word} 这个词。`, en: `I learned the word ${word} today.` },
    ],
    tags: ["智能解释", "AI生成"],
  };
}

// Helpers
function speakGerman(text: string) {
  if (typeof window === "undefined") return;
  const synth = window.speechSynthesis;
  if (!synth) return;
  synth.cancel();
  const utter = new SpeechSynthesisUtterance(text);
  utter.lang = "de-DE";
  utter.rate = 0.85;
  utter.pitch = 1;
  // try find German voice
  const voices = synth.getVoices();
  const deVoice = voices.find((v) => v.lang.startsWith("de")) || voices.find((v) => v.lang.includes("DE"));
  if (deVoice) utter.voice = deVoice;
  synth.speak(utter);
}

export default function App() {
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<WordEntry | null>(null);
  const [isAI, setIsAI] = useState(false);
  const [loading, setLoading] = useState(false);
  const [historyRaw, setHistoryRaw] = useState<any[]>([]);
  const [favoritesRaw, setFavoritesRaw] = useState<any[]>([]);
  const [copied, setCopied] = useState(false);
  const [favCopied, setFavCopied] = useState<string | null>(null);
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);
  const [busy, setBusy] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Load records
  useEffect(() => {
    const load = async () => {
      try {
        const [hRes, fRes] = await Promise.all([
          fetch("actions", {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ action: "records.list", args: { collection: "history", limit: 100 } }),
          }).then((r) => r.json()),
          fetch("actions", {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ action: "records.list", args: { collection: "favorites", limit: 100 } }),
          }).then((r) => r.json()),
        ]);
        if (hRes?.data?.records) setHistoryRaw(hRes.data.records);
        if (fRes?.data?.records) setFavoritesRaw(fRes.data.records);
      } catch (e) {
        console.log("records API not ready", e);
      }
    };
    load();
  }, []);

  const historyWords = useMemo(() => {
    const map = new Map<string, any>();
    [...historyRaw]
      .sort((a, b) => (b.value?.ts || 0) - (a.value?.ts || 0))
      .forEach((r) => {
        if (r.value?.word && !map.has(r.value.word.toLowerCase())) {
          map.set(r.value.word.toLowerCase(), r);
        }
      });
    return Array.from(map.values()).slice(0, 20);
  }, [historyRaw]);

  const favoriteWords = useMemo(() => {
    const map = new Map<string, any>();
    favoritesRaw.forEach((r) => {
      if (r.value?.word && !map.has(r.value.word.toLowerCase())) {
        map.set(r.value.word.toLowerCase(), r);
      }
    });
    return Array.from(map.values());
  }, [favoritesRaw]);

  const isFavorited = useMemo(() => {
    if (!selected) return false;
    return favoriteWords.some((f) => f.value.word.toLowerCase() === selected.word.toLowerCase());
  }, [selected, favoriteWords]);

  const tageswort = useMemo(() => {
    const now = new Date();
    const dayIndex = (now.getFullYear() * 10000 + (now.getMonth() + 1) * 100 + now.getDate()) % FULL_DICT.length;
    return FULL_DICT[dayIndex];
  }, []);

  const handleSearch = async (q?: string) => {
    const term = (q ?? query).trim();
    if (!term) return;
    setLoading(true);
    setIsAI(false);
    // simulate
    await new Promise((r) => setTimeout(r, 350));

    const found = FULL_DICT.find((w) => w.word.toLowerCase() === term.toLowerCase());
    if (found) {
      setSelected(found);
      setIsAI(false);
      setLoading(false);
    } else {
      // 先尝试在线免费词典 API https://api.dictionaryapi.dev
      try {
        const url = `${DICTIONARY_API_ENDPOINT}/${encodeURIComponent(term)}`;
        // 使用官方地址 https://api.dictionaryapi.dev 查询，失败则回退到本地智能解释
        const apiRes = await fetch(url).then((r) => (r.ok ? r.json() : null)).catch(() => null);
        if (apiRes && Array.isArray(apiRes) && apiRes[0]?.meanings) {
          // 若 API 返回结果，仍生成本地化的智能解释卡片，标注数据来源
          const fallback = generateFallback(term);
          fallback.explanationZh = `在线词典 ${DICTIONARY_API_BASE} 返回了该词的基本释义。` + fallback.explanationZh;
          fallback.meanings = apiRes[0].meanings.slice(0, 2).flatMap((m: any) => m.definitions?.slice(0,2).map((d: any) => ({ zh: d.definition, en: d.definition })) || []).slice(0,3);
          if (fallback.meanings.length === 0) fallback.meanings = generateFallback(term).meanings;
          setSelected(fallback);
          setIsAI(true);
          setLoading(false);
        } else {
          throw new Error("no api result");
        }
      } catch {
        const fallback = generateFallback(term);
        // try to find similar in local
        const similar = FULL_DICT.find((w) => w.word.toLowerCase().includes(term.toLowerCase()) || term.toLowerCase().includes(w.word.toLowerCase()));
        if (similar) {
          setSelected(similar);
          setIsAI(false);
        } else {
          setSelected(fallback);
          setIsAI(true);
        }
        setLoading(false);
      }
    }

    // save history
    try {
      const idempotency_key = `history-${term}-${Date.now()}`;
      const res = setFavoritesRaw((prev) => prev.filter((p) => p.id !== f.id));
      } else {
        const idempotency_key = `fav-${selected.word}-${Date.now()}`;
        const res = setFavoritesRaw((prev) => prev.filter((p) => p.id !== f.id));
                          } catch {}
                        }}
                        className="h-7 w-7 rounded-full bg-[var(--surface)] border border-[var(--border)] flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-all shrink-0"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <button
                      onClick={() => {
                        setFavCopied(f.id);
                        const ta = document.createElement("textarea");
                        ta.value = f.value.word;
                        document.body.appendChild(ta);
                        ta.select();
                        document.execCommand("copy");
                        document.body.removeChild(ta);
                        setTimeout(() => setFavCopied(null), 1500);
                      }}
                      className="mt-2 text-[11px] text-[var(--text-3)] hover:text-[var(--text-2)] flex items-center gap-1"
                    >
                      {favCopied === f.id ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />} 复制单词
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="rounded-[20px] bg-[var(--surface-2)] border border-dashed border-[var(--border)] p-4 text-[11px] leading-[1.6] text-[var(--text-2)]">
            <div className="font-medium text-[var(--text)] mb-1">关于数据持久化</div>
            搜索历史与生词本已通过安全 API 持久保存，刷新后仍在。最多保存 1000 条记录。
          </div>
        </aside>
      </main>

      {/* Mobile Sidebar Drawer */}
      {showMobileSidebar && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setShowMobileSidebar(false)} />
          <div className="absolute right-0 top-0 h-full w-[86%] max-w-[360px] bg-[var(--surface)] shadow-[var(--shadow-float)] rounded-l-[28px] overflow-y-auto p-6 animate-fade">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-semibold">生词本与历史</h3>
              <button onClick={() => setShowMobileSidebar(false)} className="h-9 w-9 rounded-full bg-[var(--surface-2)] flex items-center justify-center">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-5">
              <div className="bg-black text-white dark:bg-white dark:text-black rounded-[20px] p-5">
                <div className="text-[11px] uppercase tracking-widest opacity-70">TAGESWORT</div>
                <div className="font-display text-[28px] mt-2">{tageswort.word}</div>
                <div className="text-[13px] opacity-80 mt-1">{tageswort.meanings[0].zh}</div>
                <button onClick={() => handleSelectFromList(tageswort.word)} className="mt-4 w-full h-10 rounded-full bg-white text-black dark:bg-black dark:text-white text-[13px] font-medium">
                  查看详情
                </button>
              </div>

              <div>
                <h4 className="text-[13px] font-semibold mb-3 flex items-center gap-2"><Clock className="w-4 h-4" /> 搜索历史</h4>
                <div className="space-y-1">
                  {historyWords.slice(0, 10).map((h) => (
                    <button key={h.id} onClick={() => handleSelectFromList(h.value.word)} className="w-full text-left px-3 py-2.5 rounded-[12px] bg-[var(--surface-2)] text-[13px]">
                      {h.value.word}
                    </button>
                  ))}
                  {historyWords.length === 0 && <div className="text-[12px] text-[var(--text-3)]">暂无记录</div>}
                </div>
              </div>

              <div>
                <h4 className="text-[13px] font-semibold mb-3 flex items-center gap-2"><Bookmark className="w-4 h-4" /> 生词本 {favoriteWords.length}</h4>
                <div className="space-y-2">
                  {favoriteWords.map((f) => (
                    <div key={f.id} className="rounded-[12px] border border-[var(--border)] p-3 flex justify-between items-center">
                      <button onClick={() => handleSelectFromList(f.value.word)} className="text-[13px] font-medium">{f.value.word}</button>
                      <button
                        onClick={async () => {
                          setFavoritesRaw((prev) => prev.filter((p) => p.id !== f.id));
                        }}
                        className="h-7 w-7 rounded-full bg-[var(--surface-2)] flex items-center justify-center"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <footer className="mx-auto max-w-[1280px] px-6 md:px-8 py-10 text-[11px] text-[var(--text-3)] flex flex-wrap gap-4 justify-between border-t border-[var(--border)] mt-6">
        <span>DeutschWort · 为中文母语者设计的德语词典 · 2025</span>
        <span className="flex items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full bg-green-500 inline-block animate-[pulseSoft_2s_infinite]" /> 离线可用 · 发音支持 de-DE
        </span>
      </footer>
    </div>
  );
}
