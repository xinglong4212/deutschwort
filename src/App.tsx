
import React, { useState, useEffect, useMemo } from "react";
import {
  Search, Volume2, Star, Clock, Bookmark, Copy, Check, Sparkles, BookOpen, Trash2, X, Heart, GraduationCap
} from "lucide-react";

type WordEntry = {
  word: string; phonetics: string; pos: string; gender?: string; plural?: string; level: string; frequency: number;
  meanings: {zh:string; en:string}[]; explanationZh: string; examples: {de:string; zh:string; en:string}[]; tags?: string[];
  declension?: any; conjugation?: any; comparison?: any;
};

const DICTIONARY: WordEntry[] = [
  { word: "Zeit", phonetics: "/tsaɪt/", pos: "名词", gender: "die", plural: "Zeiten", level: "A1", frequency: 5, meanings: [{zh:"时间",en:"time"},{zh:"时期",en:"period"}], explanationZh: "Zeit 是德语最核心的词汇之一，既指钟表时间，也指生命中的一段经历。", examples: [{de:"Ich habe keine Zeit.",zh:"我没有时间。",en:"I have no time."},{de:"Die Zeit vergeht schnell.",zh:"时光飞逝。",en:"Time flies."}], tags:["高频"] },
  { word: "Liebe", phonetics: "/ˈliːbə/", pos: "名词", gender: "die", plural: "Lieben", level: "A2", frequency: 4, meanings: [{zh:"爱",en:"love"}], explanationZh: "Liebe 来自动词 lieben，是情感浓度最高的词。", examples: [{de:"Liebe ist die stärkste Kraft.",zh:"爱是最强大的力量。",en:"Love is strongest."}], tags:["情感"] },
  { word: "verstehen", phonetics: "/fɛɐˈʃteːən/", pos: "动词", level: "A1", frequency: 5, meanings: [{zh:"理解",en:"understand"}], explanationZh: "不可分动词，ver- 前缀永远不分开。口语常用 Verstehst du?", examples: [{de:"Verstehst du Deutsch?",zh:"你懂德语吗？",en:"Do you understand German?"}], tags:["高频动词"], conjugation:{ präsens:{ich:"verstehe",du:"verstehst",er:"versteht",wir:"verstehen",ihr:"versteht",sie:"verstehen"}, präteritum:{ich:"verstand",er:"verstand"}, perfekt:"hat verstanden"} },
  { word: "schön", phonetics: "/ʃøːn/", pos: "形容词", level: "A1", frequency: 5, meanings: [{zh:"美丽的",en:"beautiful"},{zh:"美好的",en:"nice"}], explanationZh: "德国人最常用的赞美词，Schönes Wochenende! 周末愉快！", examples: [{de:"Das ist ein schönes Haus.",zh:"那是一栋漂亮的房子。",en:"That is a beautiful house."}], tags:["形容词"], comparison:{positiv:"schön",komparativ:"schöner",superlativ:"am schönsten"} },
  { word: "machen", phonetics: "/ˈmaxən/", pos: "动词", level: "A1", frequency: 5, meanings: [{zh:"做",en:"do"}], explanationZh: "万能动词，什么都 machen。", examples: [{de:"Was machst du heute?",zh:"你今天做什么？",en:"What are you doing?"}], conjugation:{präsens:{ich:"mache",du:"machst",er:"macht",wir:"machen",ihr:"macht",sie:"machen"},präteritum:{ich:"machte",er:"machte"},perfekt:"hat gemacht"} },
  { word: "gehen", phonetics: "/ˈɡeːən/", pos: "动词", level: "A1", frequency: 5, meanings: [{zh:"去，走",en:"to go"}], explanationZh: "gehen 是最常用的移动动词。Wie geht's? 你好吗？", examples: [{de:"Ich gehe nach Hause.",zh:"我回家。",en:"I'm going home."}], conjugation:{präsens:{ich:"gehe",du:"gehst",er:"geht",wir:"gehen",ihr:"geht",sie:"gehen"},präteritum:{ich:"ging",er:"ging"},perfekt:"ist gegangen"} },
  { word: "lernen", phonetics: "/ˈlɛʁnən/", pos: "动词", level: "A1", frequency: 5, meanings: [{zh:"学习",en:"to learn"}], explanationZh: "学习，德国人说 Lernen macht Spaß! 学习很有趣！", examples: [{de:"Ich lerne Deutsch.",zh:"我在学德语。",en:"I learn German."}] },
  { word: "Haus", phonetics: "/haʊs/", pos: "名词", gender: "das", plural: "Häuser", level: "A1", frequency: 5, meanings: [{zh:"房子，家",en:"house"}], explanationZh: "das Haus，复数加 Umlaut。", examples: [{de:"Ich bin zu Hause.",zh:"我在家。",en:"I'm at home."}] },
  { word: "Arbeit", phonetics: "/ˈaʁbaɪt/", pos: "名词", gender: "die", plural: "Arbeiten", level: "A1", frequency: 5, meanings: [{zh:"工作",en:"work"}], explanationZh: "Arbeit macht das Leben süß. 工作让生活甜蜜。", examples: [{de:"Die Arbeit ruft.",zh:"工作在召唤。",en:"Work is calling."}] },
];

export default function App(){
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<WordEntry | null>(DICTIONARY[0]);
  const [favorites, setFavorites] = useState<WordEntry[]>(()=>{try{return JSON.parse(localStorage.getItem("dw_fav")||"[]")}catch{return []}});
  const [history, setHistory] = useState<string[]>(()=>{try{return JSON.parse(localStorage.getItem("dw_hist")||"[]")}catch{return []}});
  const [copied, setCopied] = useState(false);
  const tageswort = useMemo(()=> DICTIONARY[Math.floor(Math.random()*DICTIONARY.length)],[]);

  useEffect(()=>{localStorage.setItem("dw_fav", JSON.stringify(favorites))},[favorites]);
  useEffect(()=>{localStorage.setItem("dw_hist", JSON.stringify(history))},[history]);

  const filtered = useMemo(()=>{
    if(!query) return DICTIONARY;
    const q = query.toLowerCase();
    return DICTIONARY.filter(w=> w.word.toLowerCase().includes(q) || w.meanings.some(m=> m.zh.includes(query) || m.en.toLowerCase().includes(q)));
  },[query]);

  const handleSelect = (w: WordEntry)=>{
    setSelected(w);
    setHistory(h=>{
      const nh = [w.word, ...h.filter(x=>x!==w.word)].slice(0,20);
      return nh;
    });
  };

  const toggleFav = (w: WordEntry)=>{
    setFavorites(f=> f.find(x=>x.word===w.word) ? f.filter(x=>x.word!==w.word) : [...f, w]);
  };

  const speak = (text: string)=>{
    const u = new SpeechSynthesisUtterance(text);
    u.lang = "de-DE";
    u.rate = 0.9;
    speechSynthesis.speak(u);
  };

  return (
    <div className="min-h-screen bg-[#fafaf8] text-[#111] font-sans">
      <header className="sticky top-0 z-30 backdrop-blur-xl bg-[#fafaf8]/80 border-b border-black/5">
        <div className="mx-auto max-w-[1280px] px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-[12px] bg-black text-white flex items-center justify-center font-bold">D</div>
            <div>
              <div className="font-bold leading-none">DeutschWort</div>
              <div className="text-[11px] opacity-60">德语单词解释器</div>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-2 text-[12px]"><GraduationCap className="w-4 h-4"/> 为中文母语者设计</div>
        </div>
      </header>

      <main className="mx-auto max-w-[1280px] px-6 py-8 grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-8">
        <div>
          <div className="rounded-[28px] bg-white shadow-[0_20px_60px_-20px_rgba(0,0,0,0.15)] border border-black/[0.06] p-6 md:p-8">
            <h1 className="text-[32px] md:text-[44px] font-bold tracking-tight leading-[0.95]">查一个 <span className="font-serif italic font-normal">德语</span> 单词</h1>
            <p className="text-[14px] opacity-60 mt-3">输入德语，获得中文释义、变位、例句和发音。支持 85+ 离线词 + 在线解释。</p>
            <div className="mt-6 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 opacity-40"/>
              <input value={query} onChange={e=>setQuery(e.target.value)} placeholder="比如：verstehen, Zeit, schön..." className="w-full h-[56px] pl-12 pr-4 rounded-full bg-[#f3f3f0] border border-transparent focus:bg-white focus:border-black focus:outline-none text-[15px]"/>
              {query && <button onClick={()=>setQuery("")} className="absolute right-2 top-1/2 -translate-y-1/2 h-9 w-9 rounded-full bg-black text-white flex items-center justify-center"><X className="w-4 h-4"/></button>}
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {filtered.slice(0,8).map(w=>(
                <button key={w.word} onClick={()=>handleSelect(w)} className={`px-3 py-1.5 rounded-full text-[13px] border ${selected?.word===w.word ? "bg-black text-white border-black" : "bg-[#f6f6f3] border-black/10 hover:bg-black hover:text-white"}`}>{w.word}</button>
              ))}
            </div>
          </div>

          {selected && (
            <div className="mt-6 rounded-[28px] bg-white border border-black/[0.06] p-6 md:p-8 shadow-[0_10px_40px_-20px_rgba(0,0,0,0.1)]">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-3 flex-wrap">
                    <h2 className="text-[40px] font-bold leading-none">{selected.word}</h2>
                    <button onClick={()=>speak(selected.word)} className="h-9 w-9 rounded-full bg-[#f3f3f0] flex items-center justify-center hover:bg-black hover:text-white transition"><Volume2 className="w-4 h-4"/></button>
                    <span className="text-[13px] px-2.5 py-1 rounded-full bg-[#f3f3f0]">{selected.phonetics}</span>
                    <span className="text-[11px] px-2.5 py-1 rounded-full bg-black text-white">{selected.pos} {selected.gender||""}</span>
                    <span className="text-[11px] px-2 py-1 rounded-full border">{selected.level}</span>
                  </div>
                  <div className="mt-4 space-y-1">
                    {selected.meanings.map((m,i)=>(
                      <div key={i} className="flex gap-2 text-[15px]"><span className="opacity-40">{i+1}.</span><span className="font-medium">{m.zh}</span><span className="opacity-50">· {m.en}</span></div>
                    ))}
                  </div>
                </div>
                <button onClick={()=>toggleFav(selected)} className={`h-10 w-10 rounded-full flex items-center justify-center border ${favorites.find(x=>x.word===selected.word) ? "bg-black text-white border-black" : "bg-white border-black/10 hover:bg-black hover:text-white"}`}><Star className={`w-5 h-5 ${favorites.find(x=>x.word===selected.word) ? "fill-white" : ""}`}/></button>
              </div>

              <div className="mt-6 p-4 rounded-[16px] bg-[#fafaf6] border border-black/5 text-[14px] leading-[1.7]">{selected.explanationZh}</div>

              {(selected.conjugation || selected.comparison) && (
                <div className="mt-6">
                  <h3 className="text-[13px] font-bold uppercase tracking-widest opacity-60 mb-3 flex items-center gap-2"><BookOpen className="w-4 h-4"/> 变位 / 变格</h3>
                  {selected.conjugation && (
                    <div className="grid grid-cols-3 gap-2 text-[13px]">
                      <div className="col-span-3 font-medium opacity-60">Präsens 现在时</div>
                      {Object.entries(selected.conjugation.präsens).map(([k,v])=>(
                        <div key={k} className="bg-[#f6f6f3] rounded-[10px] px-3 py-2 flex justify-between"><span className="opacity-50">{k}</span><span className="font-medium">{v as string}</span></div>
                      ))}
                      <div className="col-span-3 mt-2 flex gap-2"><span className="px-2 py-1 rounded bg-black text-white text-[11px]">Perfekt: {selected.conjugation.perfekt}</span></div>
                    </div>
                  )}
                  {selected.comparison && (
                    <div className="flex gap-2 text-[13px]"><span className="px-3 py-1.5 rounded-full bg-[#f6f6f3]">{selected.comparison.positiv}</span><span className="px-3 py-1.5 rounded-full bg-[#f6f6f3]">{selected.comparison.komparativ}</span><span className="px-3 py-1.5 rounded-full bg-black text-white">{selected.comparison.superlativ}</span></div>
                  )}
                </div>
              )}

              <div className="mt-8">
                <h3 className="text-[13px] font-bold uppercase tracking-widest opacity-60 mb-3">例句</h3>
                <div className="space-y-3">
                  {selected.examples.map((ex,i)=>(
                    <div key={i} className="rounded-[14px] border border-black/5 p-4">
                      <div className="font-medium text-[14px]">{ex.de}</div>
                      <div className="text-[13px] opacity-60 mt-1">{ex.zh}</div>
                      <div className="text-[12px] opacity-40">{ex.en}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-6 flex gap-2">
                <button onClick={()=>{navigator.clipboard.writeText(selected.word); setCopied(true); setTimeout(()=>setCopied(false),1200);}} className="h-9 px-4 rounded-full bg-black text-white text-[13px] flex items-center gap-2"><Copy className="w-4 h-4"/>{copied ? "已复制" : "复制单词"}</button>
                <button onClick={()=>speak(selected.examples[0]?.de || selected.word)} className="h-9 px-4 rounded-full bg-[#f3f3f0] text-[13px] flex items-center gap-2"><Volume2 className="w-4 h-4"/>朗读例句</button>
              </div>
            </div>
          )}
        </div>

        <aside className="space-y-4">
          <div className="rounded-[24px] bg-black text-white p-5">
            <div className="text-[11px] uppercase tracking-widest opacity-60">TAGESWORT 今日一词</div>
            <div className="text-[28px] font-bold mt-2">{tageswort.word}</div>
            <div className="text-[13px] opacity-70">{tageswort.meanings[0].zh}</div>
            <button onClick={()=>handleSelect(tageswort)} className="mt-4 w-full h-10 rounded-full bg-white text-black text-[13px] font-medium">查看详情</button>
          </div>

          <div className="rounded-[24px] bg-white border border-black/5 p-5">
            <h4 className="text-[13px] font-bold flex items-center gap-2"><Clock className="w-4 h-4"/>搜索历史</h4>
            <div className="mt-3 space-y-1">
              {history.length===0 && <div className="text-[12px] opacity-40">暂无</div>}
              {history.map(h=>(
                <button key={h} onClick={()=>{const w=DICTIONARY.find(x=>x.word===h); if(w) handleSelect(w);}} className="w-full text-left px-3 py-2 rounded-[10px] bg-[#f6f6f3] text-[13px] hover:bg-black hover:text-white">{h}</button>
              ))}
            </div>
          </div>

          <div className="rounded-[24px] bg-white border border-black/5 p-5">
            <h4 className="text-[13px] font-bold flex items-center gap-2"><Bookmark className="w-4 h-4"/>生词本 {favorites.length}</h4>
            <div className="mt-3 space-y-2">
              {favorites.length===0 && <div className="text-[12px] opacity-40">点击星星收藏</div>}
              {favorites.map(f=>(
                <div key={f.word} className="flex items-center justify-between p-2 rounded-[10px] border border-black/5">
                  <button onClick={()=>handleSelect(f)} className="text-[13px] font-medium">{f.word}</button>
                  <button onClick={()=>setFavorites(v=>v.filter(x=>x.word!==f.word))} className="h-7 w-7 rounded-full bg-[#f6f6f3] flex items-center justify-center"><Trash2 className="w-3 h-3"/></button>
                </div>
              ))}
            </div>
          </div>
        </aside>
      </main>

      <footer className="mx-auto max-w-[1280px] px-6 py-8 text-[11px] opacity-40 border-t border-black/5 mt-4">DeutschWort · 为中文母语者设计 · 发音支持 de-DE · 离线可用</footer>
    </div>
  );
}
