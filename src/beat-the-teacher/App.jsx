import { useState, useRef } from "react";
import { createSpeaker } from "../shared/tts.js";
import { TTS_CLIPS } from "./tts-manifest.js";
import {
  CHAPTERS, WORDS, ALL_RADICALS,
  TEACHER_STAGES, HIT_EFFECTS, MISS_EFFECTS, MAX_HINTS,
  getWordsForChapter, buildBlankQuestion,
} from "./data.js";

const { speak } = createSpeaker(TTS_CLIPS, { lang: "zh" });

// ── Sub-components ────────────────────────────────────────────────────────────

function TeacherSprite({ stage, isHit, isMiss, shake }) {
  const sprites = {
    smug:        { body:"#3a2a6a", face:"😤", hat:"🎓", aura:"" },
    rattled:     { body:"#2a3a6a", face:"😰", hat:"🎓", aura:"💦" },
    dishevelled: { body:"#1a4a3a", face:"😵", hat:"🧢", aura:"⚡" },
    defeated:    { body:"#4a1a1a", face:"😭", hat:"",   aura:"💀" },
    obliterated: { body:"#0a0a1a", face:"☠️", hat:"",   aura:"💥" },
  };
  const s = sprites[stage] || sprites.smug;
  return (
    <div style={{
      width:"76px", height:"90px", position:"relative", display:"inline-block",
      transform: shake ? "translateX(4px)" : isHit ? "scale(0.93)" : "scale(1)",
      transition: "transform 0.15s",
    }}>
      <div style={{ position:"absolute", top:0, left:"50%", transform:"translateX(-50%)", fontSize:"18px" }}>
        {s.hat}
      </div>
      <div style={{
        position:"absolute", top:"22px", left:"50%", transform:"translateX(-50%)",
        width:"52px", height:"56px", background:s.body,
        borderRadius:"10px 10px 14px 14px",
        border: isHit ? "2px solid #facc15" : isMiss ? "2px solid #ef4444" : "2px solid #4a4a8a",
        display:"flex", alignItems:"center", justifyContent:"center",
        fontSize:"28px",
        boxShadow: isHit ? "0 0 18px #facc1555" : isMiss ? "0 0 18px #ef444455" : "none",
      }}>
        {s.face}
      </div>
      {s.aura && (
        <div style={{ position:"absolute", top:"10px", right:"-6px", fontSize:"16px", animation:"floatUp 1s infinite" }}>
          {s.aura}
        </div>
      )}
      <div style={{
        position:"absolute", bottom:0, left:"50%", transform:"translateX(-50%)",
        display:"flex", gap:"4px",
      }}>
        {["#3a3a7a","#3a3a7a"].map((c,i) => (
          <div key={i} style={{ width:"14px", height:"18px", background:c, borderRadius:"0 0 5px 5px", border:"1px solid #5a5aaa" }} />
        ))}
      </div>
    </div>
  );
}

function HPBar({ hp }) {
  const color = hp > 50 ? "#4ade80" : hp > 25 ? "#fb923c" : "#ef4444";
  return (
    <div style={{ height:"12px", background:"#0a0a1a", borderRadius:"6px", border:"1px solid #2a2a4a", overflow:"hidden" }}>
      <div style={{
        height:"100%", width:`${hp}%`, background:color,
        borderRadius:"6px", transition:"width 0.4s ease",
        boxShadow:`0 0 8px ${color}88`,
      }} />
    </div>
  );
}

function FloatingText({ texts }) {
  return (
    <>
      {texts.map(t => (
        <div key={t.id} style={{
          position:"absolute", left:`${t.x}%`, top:`${t.y}%`,
          fontFamily:"'Bangers',cursive", fontSize:"16px", fontWeight:"bold",
          color: t.hit ? "#facc15" : "#ef4444",
          textShadow: t.hit ? "1px 1px 0 #7a2200" : "1px 1px 0 #4a0000",
          letterSpacing:"2px", pointerEvents:"none",
          animation:"floatUp 1.2s ease forwards", zIndex:10,
        }}>
          {t.text}
        </div>
      ))}
    </>
  );
}

// ── Main App ──────────────────────────────────────────────────────────────────

export default function App() {
  const [phase, setPhase]           = useState("menu");
  const [chapterId, setChapterId]   = useState(null);
  const [gameMode, setGameMode]     = useState(null);
  const [currentWord, setCurrentWord] = useState(null);
  const [options, setOptions]       = useState([]);
  const [teacherHP, setTeacherHP]   = useState(100);
  const [score, setScore]           = useState(0);
  const [streak, setStreak]         = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [lastResult, setLastResult] = useState(null);
  const [shake, setShake]           = useState(false);
  const [floatingTexts, setFloatingTexts] = useState([]);
  const [teacherTaunt, setTeacherTaunt]   = useState(TEACHER_STAGES[0].taunt);
  const [usedWords, setUsedWords]   = useState([]);
  const [hintsLeft, setHintsLeft]   = useState(MAX_HINTS);
  const [audioHintsLeft, setAudioHintsLeft] = useState(MAX_HINTS);
  const [showHint, setShowHint]     = useState(false);
  const [blankPrompt, setBlankPrompt]     = useState(null);
  const [blankCorrects, setBlankCorrects] = useState([]);
  const [nightmareRevealed, setNightmareRevealed] = useState(false);
  const [lastPickedOption, setLastPickedOption]   = useState(null);
  const [chosenOption, setChosenOption]           = useState(null);
  const floatId = useRef(0);

  const isBlank     = gameMode === "blank" || gameMode === "nightmare";
  const isNightmare = gameMode === "nightmare";

  const chapterInfo = CHAPTERS.find(c => c.id === chapterId) || CHAPTERS[0];

  const getStage = hp => {
    if (hp > 75) return TEACHER_STAGES[0];
    if (hp > 50) return TEACHER_STAGES[1];
    if (hp > 25) return TEACHER_STAGES[2];
    if (hp > 0)  return TEACHER_STAGES[3];
    return TEACHER_STAGES[4];
  };
  const currentStage = getStage(teacherHP);

  function spawnFloat(text, hit) {
    const id = floatId.current++;
    setFloatingTexts(prev => [...prev, { id, text, hit, x: 18 + Math.random()*60, y: 8 + Math.random()*40 }]);
    setTimeout(() => setFloatingTexts(prev => prev.filter(t => t.id !== id)), 1200);
  }

  function getPools(mode, chapId) {
    const chWords = getWordsForChapter(chapId);
    const allWords = WORDS;
    const RADICAL_WORDS = chWords.filter(w => w.radical);
    const BLANK_WORDS   = chWords.filter(w => w.chinese.length >= 2);
    const firstCharCounts = BLANK_WORDS.reduce((acc, w) => {
      acc[w.chinese[0]] = (acc[w.chinese[0]] || 0) + 1; return acc;
    }, {});
    let NIGHTMARE_WORDS = BLANK_WORDS.filter(w => firstCharCounts[w.chinese[0]] >= 2);
    if (NIGHTMARE_WORDS.length < 4) {
      const allBlank = allWords.filter(w => w.chinese.length >= 2);
      const allCounts = allBlank.reduce((acc, w) => { acc[w.chinese[0]] = (acc[w.chinese[0]] || 0) + 1; return acc; }, {});
      NIGHTMARE_WORDS = allBlank.filter(w => allCounts[w.chinese[0]] >= 2);
    }
    return { chWords, RADICAL_WORDS, BLANK_WORDS, NIGHTMARE_WORDS };
  }

  function pickNewWord(used, mode, chapId) {
    const m = mode || gameMode;
    const c = chapId !== undefined ? chapId : chapterId;
    const { chWords, RADICAL_WORDS, BLANK_WORDS, NIGHTMARE_WORDS } = getPools(m, c);

    let pool;
    if (m === "radical")    pool = RADICAL_WORDS;
    else if (m === "nightmare") pool = NIGHTMARE_WORDS;
    else if (m === "blank") pool = BLANK_WORDS;
    else pool = chWords;

    const remaining = pool.filter(w => !used.includes(w.chinese));
    if (remaining.length === 0) { setPhase("win"); return null; }
    const word = remaining[Math.floor(Math.random() * remaining.length)];

    if (m === "radical") {
      const wrongRadicals = ALL_RADICALS.filter(r => r.radical !== word.radical).sort(() => Math.random() - 0.5).slice(0, 3);
      const correctOpt = { radical: word.radical, radicalName: word.radicalName, radicalChinese: word.radicalChinese };
      setOptions([...wrongRadicals, correctOpt].sort(() => Math.random() - 0.5));
    } else if (m === "blank" || m === "nightmare") {
      const siblingPool = m === "nightmare" ? WORDS.filter(w => w.chinese.length >= 2) : BLANK_WORDS;
      const { prompt, correctAnswers, options: opts } = buildBlankQuestion(word, siblingPool, m === "nightmare");
      setBlankPrompt(prompt);
      setBlankCorrects(correctAnswers);
      setOptions(opts);
      setNightmareRevealed(false);
      setLastPickedOption(null);
      setChosenOption(null);
    } else {
      const wrongs = chWords.filter(w => w.chinese !== word.chinese).sort(() => Math.random()-.5).slice(0,3);
      const padded = wrongs.length < 3
        ? [...wrongs, ...WORDS.filter(w => w.chinese !== word.chinese && !wrongs.find(x => x.chinese === w.chinese)).sort(() => Math.random()-.5).slice(0, 3 - wrongs.length)]
        : wrongs;
      setOptions([...padded.slice(0,3), word].sort(() => Math.random()-.5));
    }

    setCurrentWord(word);
    setShowHint(false);
    return word;
  }

  function startGame(mode, chapId) {
    const c = chapId !== undefined ? chapId : chapterId;
    setGameMode(mode);
    setChapterId(c);
    setTeacherHP(100);
    setScore(0);
    setStreak(0);
    setUsedWords([]);
    setLastResult(null);
    setShowAnswer(false);
    setHintsLeft(MAX_HINTS);
    setAudioHintsLeft(MAX_HINTS);
    setShowHint(false);
    setTeacherTaunt(TEACHER_STAGES[0].taunt);
    setNightmareRevealed(false);
    setLastPickedOption(null);
    setChosenOption(null);
    setPhase("playing");
    pickNewWord([], mode, c);
  }

  function handleAnswer(opt) {
    if (!currentWord) return;
    let correct;

    if (gameMode === "radical") {
      correct = opt.radical === currentWord.radical;
    } else if (isBlank) {
      correct = blankCorrects.includes(opt);
      if (isNightmare) {
        setLastPickedOption(opt);
        setNightmareRevealed(true);
        if (correct) setChosenOption(opt);
        setTimeout(() => {
          setNightmareRevealed(false);
          setLastPickedOption(null);
          setChosenOption(null);
          if (correct) {
            const dmg = 10 + streak * 2;
            const newHP = Math.max(0, teacherHP - dmg);
            setTeacherHP(newHP);
            setScore(s => s + 10 + streak * 5);
            setStreak(s => s + 1);
            setLastResult("hit");
            setShake(true);
            setTimeout(() => setShake(false), 300);
            spawnFloat(HIT_EFFECTS[Math.floor(Math.random()*HIT_EFFECTS.length)], true);
            if (streak >= 2) spawnFloat(`${streak+1}x COMBO!`, true);
            setTeacherTaunt(getStage(newHP).taunt);
            const newUsed = [...usedWords, currentWord.chinese];
            setUsedWords(newUsed);
            if (newHP <= 0) setTimeout(() => setPhase("win"), 700);
            else setTimeout(() => { setLastResult(null); pickNewWord(newUsed); }, 500);
          } else {
            const healHP = Math.min(100, teacherHP + 8);
            setTeacherHP(healHP);
            setStreak(0);
            setLastResult("miss");
            setShowAnswer(true);
            spawnFloat(MISS_EFFECTS[Math.floor(Math.random()*MISS_EFFECTS.length)], false);
            setTeacherTaunt("HA! Teacher heals! Study harder!");
          }
        }, 1400);
        return;
      }
    } else {
      correct = opt.chinese === currentWord.chinese;
    }

    if (correct) {
      if (isBlank) setChosenOption(typeof opt === "string" ? opt : null);
      const dmg   = 10 + streak * 2;
      const newHP = Math.max(0, teacherHP - dmg);
      setTeacherHP(newHP);
      setScore(s => s + 10 + streak * 5);
      setStreak(s => s + 1);
      setLastResult("hit");
      setShake(true);
      setTimeout(() => setShake(false), 300);
      spawnFloat(HIT_EFFECTS[Math.floor(Math.random()*HIT_EFFECTS.length)], true);
      if (streak >= 2) spawnFloat(`${streak+1}x COMBO!`, true);
      setTeacherTaunt(getStage(newHP).taunt);
      const newUsed = [...usedWords, currentWord.chinese];
      setUsedWords(newUsed);
      if (newHP <= 0) setTimeout(() => setPhase("win"), 700);
      else setTimeout(() => { setLastResult(null); pickNewWord(newUsed); }, 500);
    } else {
      const healHP = Math.min(100, teacherHP + 8);
      setTeacherHP(healHP);
      setStreak(0);
      setLastResult("miss");
      setShowAnswer(true);
      spawnFloat(MISS_EFFECTS[Math.floor(Math.random()*MISS_EFFECTS.length)], false);
      setTeacherTaunt("HA! Wrong answer — teacher heals! 老师回血了！");
    }
  }

  function blankOptStyle(opt) {
    if (!nightmareRevealed) return {};
    if (blankCorrects.includes(opt)) return { borderColor:"#4ade80", background:"#0a2a1a" };
    if (opt === lastPickedOption) return { borderColor:"#ef4444", background:"#2a0a0a" };
    return { opacity: 0.4 };
  }

  const btnBase = {
    fontFamily:"'Bangers', cursive", letterSpacing:"2px",
    border:"none", borderRadius:"10px", cursor:"pointer",
    transition:"all 0.15s", color:"white",
  };

  const { chWords, RADICAL_WORDS, BLANK_WORDS, NIGHTMARE_WORDS } = chapterId
    ? getPools(gameMode, chapterId)
    : { chWords: WORDS, RADICAL_WORDS: WORDS.filter(w=>w.radical), BLANK_WORDS: WORDS.filter(w=>w.chinese.length>=2), NIGHTMARE_WORDS: [] };

  const totalWords = gameMode === "radical" ? RADICAL_WORDS.length
    : gameMode === "nightmare" ? NIGHTMARE_WORDS.length
    : isBlank ? BLANK_WORDS.length : chWords.length;

  const accentColor = chapterId ? (CHAPTERS.find(c=>c.id===chapterId)?.color || "#facc15") : "#facc15";

  const MODES = [
    { id:"english",   label:"ENGLISH MODE",    sub:"汉字 → ?",        desc:"See Chinese, pick English.", emoji:"🇬🇧", cls:"mode-card" },
    { id:"chinese",   label:"CHINESE MODE",    sub:"English → 汉字?", desc:"See English, pick Chinese.", emoji:"🇨🇳", cls:"mode-card" },
    { id:"radical",   label:"RADICAL MODE",    sub:"偏旁部首",         desc:"Find the radical.",          emoji:"🏯", cls:"mode-card-radical" },
    { id:"blank",     label:"FILL THE BLANK",  sub:"总（＿）",         desc:"One correct answer.",        emoji:"✏️", cls:"mode-card-blank" },
    { id:"nightmare", label:"NIGHTMARE MODE",  sub:"噩梦 — 多答案",    desc:"Multiple correct answers.",  emoji:"💀", cls:"mode-card-nightmare", span:true },
  ];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bangers&family=Noto+Sans+SC:wght@400;700&family=Space+Mono&display=swap');
        * { box-sizing:border-box; margin:0; padding:0; }
        body { background:#0d0d1a; }
        @keyframes floatUp    { 0%{opacity:1;transform:translateY(0) scale(1)} 100%{opacity:0;transform:translateY(-80px) scale(1.4)} }
        @keyframes pulse      { 0%,100%{transform:scale(1)} 50%{transform:scale(1.05)} }
        @keyframes slideIn    { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
        @keyframes flash      { 0%,100%{opacity:1} 50%{opacity:0.3} }
        @keyframes hintPop    { from{opacity:0;transform:scale(0.8)} to{opacity:1;transform:scale(1)} }
        @keyframes blankPulse { 0%,100%{transform:scale(1)} 50%{transform:scale(1.08)} }
        .opt-btn          { background:#12122a; border:2px solid #2a2a4a; color:#e0e0ff; font-family:'Noto Sans SC',sans-serif; padding:12px 10px; border-radius:8px; cursor:pointer; transition:all 0.15s; text-align:center; animation:slideIn 0.3s ease both; }
        .opt-btn:hover    { background:#1e1e4a; border-color:#6060cc; transform:translateY(-2px); box-shadow:0 4px 16px rgba(96,96,200,0.3); }
        .opt-btn:active   { transform:translateY(0); }
        .opt-btn-radical  { background:#12102a; border:2px solid #2a1a4a; color:#d4c0ff; font-family:'Noto Sans SC',sans-serif; padding:14px 10px; border-radius:8px; cursor:pointer; transition:all 0.15s; text-align:center; animation:slideIn 0.3s ease both; }
        .opt-btn-radical:hover { background:#1e1040; border-color:#9060cc; transform:translateY(-2px); box-shadow:0 4px 16px rgba(144,96,200,0.35); }
        .opt-btn-blank    { background:#0a1a14; border:2px solid #1a3a2a; color:#6effc0; font-family:'Noto Sans SC',sans-serif; padding:12px 10px; border-radius:8px; cursor:pointer; transition:all 0.15s; text-align:center; animation:slideIn 0.3s ease both; }
        .opt-btn-blank:hover { background:#102a1e; border-color:#34d399; transform:translateY(-2px); }
        .opt-btn-nightmare{ background:#1a0a10; border:2px solid #4a1a2a; color:#ffb0c0; font-family:'Noto Sans SC',sans-serif; padding:12px 10px; border-radius:8px; cursor:pointer; transition:all 0.15s; text-align:center; animation:slideIn 0.3s ease both; }
        .opt-btn-nightmare:hover { background:#2a1018; border-color:#fb7185; transform:translateY(-2px); }
        .hint-btn { background:transparent; border:1px solid #2a2a5a; color:#5050aa; font-family:'Space Mono',monospace; font-size:11px; padding:5px 12px; border-radius:6px; cursor:pointer; transition:all 0.15s; }
        .hint-btn:hover:not(:disabled) { border-color:#7070cc; color:#9090cc; }
        .hint-btn:disabled { opacity:0.3; cursor:default; }
        .ch-card { background:#0e0e22; border:2px solid #2a2a4a; border-radius:14px; padding:16px 14px; cursor:pointer; transition:all 0.2s; text-align:center; color:white; }
        .ch-card:hover { transform:translateY(-3px); }
        .mode-card          { background:#0e0e22; border:2px solid #2a2a4a; border-radius:12px; padding:14px 12px; cursor:pointer; transition:all 0.2s; text-align:center; color:white; }
        .mode-card:hover    { border-color:#facc15; transform:translateY(-3px); }
        .mode-card-radical  { background:#0e0a22; border:2px solid #3a2a5a; border-radius:12px; padding:14px 12px; cursor:pointer; transition:all 0.2s; text-align:center; color:white; }
        .mode-card-radical:hover { border-color:#a78bfa; transform:translateY(-3px); }
        .mode-card-blank    { background:#081a12; border:2px solid #1a4a2a; border-radius:12px; padding:14px 12px; cursor:pointer; transition:all 0.2s; text-align:center; color:white; }
        .mode-card-blank:hover { border-color:#34d399; transform:translateY(-3px); }
        .mode-card-nightmare{ background:#1a080e; border:2px solid #4a1a28; border-radius:12px; padding:14px 12px; cursor:pointer; transition:all 0.2s; text-align:center; color:white; }
        .mode-card-nightmare:hover { border-color:#fb7185; transform:translateY(-3px); }
      `}</style>

      <div style={{ minHeight:"100vh", background:"radial-gradient(ellipse at top, #1a0a2e 0%, #0d0d1a 60%)", display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"'Space Mono', monospace", padding:"20px" }}>

        {/* ── CHAPTER SELECT ── */}
        {phase === "menu" && (
          <div style={{ textAlign:"center", color:"white", maxWidth:520, width:"100%", animation:"slideIn 0.5s ease" }}>
            <div style={{ fontSize:"52px", marginBottom:"6px" }}>🥊</div>
            <h1 style={{ fontFamily:"'Bangers',cursive", fontSize:"clamp(32px,7vw,54px)", letterSpacing:"3px", color:"#facc15", textShadow:"3px 3px 0 #7a2200, 5px 5px 0 #3a0a00", lineHeight:1.1, marginBottom:"4px" }}>
              BEAT THE TEACHER
            </h1>
            <div style={{ fontFamily:"'Noto Sans SC'", fontSize:"14px", color:"#7070aa", marginBottom:"20px" }}>中文学习格斗游戏</div>
            <div style={{ color:"#555", fontSize:"10px", letterSpacing:"2px", marginBottom:"12px", textTransform:"uppercase" }}>Select a chapter</div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"10px", marginBottom:"14px" }}>
              {CHAPTERS.map(ch => (
                <div key={ch.id} className="ch-card"
                  style={{ borderColor: ch.color + "55", gridColumn: ch.id === "all" ? "span 2" : undefined }}
                  onClick={() => { setChapterId(ch.id); setPhase("modeselect"); }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = ch.color}
                  onMouseLeave={e => e.currentTarget.style.borderColor = ch.color + "55"}
                >
                  <div style={{ fontFamily:"'Bangers',cursive", fontSize:"16px", color: ch.color, letterSpacing:"1px", marginBottom:"3px" }}>
                    {ch.id === "all" ? "⭐ ALL CHAPTERS" : `Ch ${ch.id.replace("ch","")}`}
                  </div>
                  <div style={{ fontFamily:"'Noto Sans SC'", fontSize:"13px", color:"#aaa" }}>{ch.label}</div>
                  <div style={{ fontSize:"10px", color:"#555", marginTop:"3px" }}>
                    {getWordsForChapter(ch.id).length} words
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── MODE SELECT ── */}
        {phase === "modeselect" && (
          <div style={{ textAlign:"center", color:"white", maxWidth:520, width:"100%", animation:"slideIn 0.4s ease" }}>
            <button onClick={() => setPhase("menu")} style={{ ...btnBase, fontSize:"12px", padding:"6px 14px", background:"#1a1a2e", marginBottom:"14px" }}>← Chapters</button>
            <div style={{ fontFamily:"'Noto Sans SC'", fontSize:"18px", color: accentColor, marginBottom:"4px" }}>{chapterInfo.label}</div>
            <div style={{ color:"#555", fontSize:"10px", letterSpacing:"2px", marginBottom:"14px", textTransform:"uppercase" }}>Choose a mode</div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"10px" }}>
              {MODES.map(m => (
                <div key={m.id} className={m.cls} style={{ gridColumn: m.span ? "span 2" : undefined }} onClick={() => startGame(m.id, chapterId)}>
                  <div style={{ fontSize:"24px", marginBottom:"5px" }}>{m.emoji}</div>
                  <div style={{ fontFamily:"'Bangers',cursive", fontSize:"16px", letterSpacing:"1px",
                    color: m.id==="radical"?"#a78bfa":m.id==="blank"?"#34d399":m.id==="nightmare"?"#fb7185":"#facc15",
                    marginBottom:"3px" }}>{m.label}</div>
                  <div style={{ fontFamily:"'Noto Sans SC'", fontSize:"13px", color:"#666", marginBottom:"3px" }}>{m.sub}</div>
                  <div style={{ fontSize:"10px", color:"#444" }}>{m.desc}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── WIN ── */}
        {phase === "win" && (
          <div style={{ textAlign:"center", color:"white", maxWidth:440, animation:"slideIn 0.5s ease" }}>
            <div style={{ fontSize:"70px" }}>💀</div>
            <h2 style={{ fontFamily:"'Bangers'", fontSize:"44px", color:"#4ade80", letterSpacing:"2px", textShadow:"3px 3px 0 #0a4a1a" }}>TEACHER: OBLITERATED</h2>
            <p style={{ color:"#86efac", margin:"10px 0 4px", fontSize:"14px" }}>你的中文很好！Your Chinese is... acceptable.</p>
            <p style={{ color:"#333", fontSize:"11px", marginBottom:"14px" }}>(Back Monday with more homework.)</p>
            <div style={{ background:"rgba(255,255,255,0.04)", borderRadius:"10px", padding:"14px", margin:"14px 0", border:"1px solid #1a4a1a" }}>
              <div style={{ color:"#facc15", fontFamily:"'Bangers'", fontSize:"28px" }}>Final Score: {score}</div>
              <div style={{ color:"#4ade80", fontSize:"12px", marginTop:"4px" }}>{chapterInfo.label}</div>
            </div>
            <div style={{ display:"flex", gap:"10px", justifyContent:"center" }}>
              <button onClick={() => startGame(gameMode, chapterId)} style={{ ...btnBase, fontSize:"18px", padding:"10px 24px", background:"linear-gradient(135deg,#16a34a,#0a4a1a)", boxShadow:"0 4px 0 #052a0a" }}
                onMouseEnter={e=>e.currentTarget.style.transform="translateY(-2px)"} onMouseLeave={e=>e.currentTarget.style.transform="none"}>
                AGAIN 再玩!
              </button>
              <button onClick={() => setPhase("modeselect")} style={{ ...btnBase, fontSize:"14px", padding:"10px 18px", background:"linear-gradient(135deg,#222,#111)", boxShadow:"0 4px 0 #050505" }}
                onMouseEnter={e=>e.currentTarget.style.transform="translateY(-2px)"} onMouseLeave={e=>e.currentTarget.style.transform="none"}>
                MODES
              </button>
              <button onClick={() => setPhase("menu")} style={{ ...btnBase, fontSize:"14px", padding:"10px 18px", background:"linear-gradient(135deg,#222,#111)", boxShadow:"0 4px 0 #050505" }}
                onMouseEnter={e=>e.currentTarget.style.transform="translateY(-2px)"} onMouseLeave={e=>e.currentTarget.style.transform="none"}>
                CHAPTERS
              </button>
            </div>
          </div>
        )}

        {/* ── PLAYING ── */}
        {phase === "playing" && currentWord && (
          <div style={{ width:"100%", maxWidth:540, animation:"slideIn 0.3s ease" }}>

            {/* HUD */}
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"8px" }}>
              <div style={{ display:"flex", gap:"8px", alignItems:"center" }}>
                <button onClick={() => setPhase("modeselect")} style={{ ...btnBase, fontSize:"10px", padding:"4px 10px", background:"#1a1a2e", letterSpacing:"1px" }}>← Exit</button>
                <span style={{ fontFamily:"'Noto Sans SC'", fontSize:"11px", color:"#444" }}>{chapterInfo.label}</span>
              </div>
              <div style={{ fontFamily:"'Bangers'", fontSize:"18px", letterSpacing:"1px", color: accentColor }}>
                {score}
              </div>
              {streak > 1 && (
                <div style={{ color:"#fb923c", fontFamily:"'Bangers'", fontSize:"15px", animation:"pulse 0.5s infinite" }}>
                  🔥 {streak}x
                </div>
              )}
            </div>

            {/* ARENA */}
            <div style={{
              background: gameMode==="radical" ? "linear-gradient(180deg,#0a0820,#100a2a)"
                : isNightmare ? "linear-gradient(180deg,#1a0508,#120008)"
                : isBlank ? "linear-gradient(180deg,#040e08,#081408)"
                : "linear-gradient(180deg,#0a0a20,#12122a)",
              border: `2px solid ${accentColor}22`,
              borderRadius:"16px", padding:"16px", marginBottom:"10px",
              position:"relative", overflow:"hidden", minHeight:"148px"
            }}>
              {[0,1,2,3,4].map(i => <div key={i} style={{ position:"absolute", bottom:0, left:`${i*25}%`, width:"1px", height:"100%", background:"rgba(255,255,255,0.025)" }} />)}
              <FloatingText texts={floatingTexts} />
              <div style={{ display:"flex", alignItems:"flex-start", gap:"14px" }}>
                <div style={{ textAlign:"center", minWidth:"80px" }}>
                  <TeacherSprite stage={currentStage.status} isHit={lastResult==="hit"} isMiss={lastResult==="miss"} shake={shake} />
                  <div style={{ fontFamily:"'Bangers'", fontSize:"10px", color:"#4a4a88", letterSpacing:"1px", marginTop:"2px", textTransform:"uppercase" }}>{currentStage.status}</div>
                </div>
                <div style={{ flex:1 }}>
                  <div style={{ display:"flex", justifyContent:"space-between", marginBottom:"5px" }}>
                    <span style={{ color:"#555", fontSize:"9px", fontFamily:"'Bangers'", letterSpacing:"1px" }}>TEACHER HP</span>
                    <span style={{ color:"#888", fontSize:"9px" }}>{teacherHP}/100</span>
                  </div>
                  <HPBar hp={teacherHP} />
                  <div style={{ marginTop:"8px", background:"rgba(255,255,255,0.025)", border:"1px solid #222244", borderRadius:"8px", padding:"7px 10px", fontSize:"11px", color:"#8080aa", fontStyle:"italic", lineHeight:1.5 }}>
                    <span style={{ color:"#4a4a88", marginRight:"5px" }}>💬</span>{teacherTaunt}
                  </div>
                </div>
              </div>
              {lastResult==="hit"  && <div style={{ position:"absolute", inset:0, background:"rgba(250,204,21,0.07)", borderRadius:"14px", pointerEvents:"none", animation:"flash 0.3s ease" }} />}
              {lastResult==="miss" && <div style={{ position:"absolute", inset:0, background:"rgba(239,68,68,0.07)",  borderRadius:"14px", pointerEvents:"none", animation:"flash 0.3s ease" }} />}
            </div>

            {/* QUESTION CARD */}
            <div style={{
              background: gameMode==="radical" ? "rgba(167,139,250,0.04)" : isNightmare ? "rgba(251,113,133,0.04)" : isBlank ? "rgba(52,211,153,0.04)" : "rgba(255,255,255,0.025)",
              border: `1px solid ${accentColor}22`,
              borderRadius:"12px", padding:"14px 16px", marginBottom:"10px", textAlign:"center"
            }}>
              {gameMode === "english" && (
                <>
                  <div style={{ color:"#333", fontSize:"9px", letterSpacing:"2px", marginBottom:"8px", textTransform:"uppercase" }}>What does this mean?</div>
                  <div style={{ fontFamily:"'Noto Sans SC',sans-serif", fontSize:"52px", fontWeight:"700", color:"#facc15", lineHeight:1.1, marginBottom:"10px" }}>{currentWord.chinese}</div>
                </>
              )}
              {gameMode === "chinese" && (
                <>
                  <div style={{ color:"#333", fontSize:"9px", letterSpacing:"2px", marginBottom:"6px", textTransform:"uppercase" }}>Which character means…</div>
                  <div style={{ fontSize:"32px", marginBottom:"5px" }}>{currentWord.emoji}</div>
                  <div style={{ fontFamily:"'Noto Sans SC',sans-serif", fontSize:"22px", fontWeight:"700", color:"#facc15", marginBottom:"8px" }}>{currentWord.english}</div>
                </>
              )}
              {gameMode === "radical" && (
                <>
                  <div style={{ color:"#5a4a88", fontSize:"9px", letterSpacing:"2px", marginBottom:"6px", textTransform:"uppercase" }}>What is the radical (偏旁部首)?</div>
                  <div style={{ fontFamily:"'Noto Sans SC',sans-serif", fontSize:"72px", fontWeight:"700", color:"#a78bfa", lineHeight:1.1, marginBottom:"4px" }}>{currentWord.chinese[0]}</div>
                  <div style={{ fontFamily:"'Noto Sans SC',sans-serif", fontSize:"12px", color:"#5a4a88", marginBottom:"8px" }}>{currentWord.english}</div>
                </>
              )}
              {isBlank && blankPrompt && (
                <>
                  <div style={{ color: isNightmare ? "#7a2a3a" : "#1a5a3a", fontSize:"9px", letterSpacing:"2px", marginBottom:"8px", textTransform:"uppercase" }}>
                    {isNightmare ? "⚠️ Multiple answers may be correct" : "Complete the word:"}
                  </div>
                  <div style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:"8px", marginBottom:"6px" }}>
                    <span style={{ fontFamily:"'Noto Sans SC',sans-serif", fontSize:"62px", fontWeight:"700", color: isNightmare ? "#fb7185" : "#34d399", lineHeight:1 }}>{blankPrompt}</span>
                    {chosenOption ? (
                      <span style={{ fontFamily:"'Noto Sans SC',sans-serif", fontSize:"62px", fontWeight:"700", color: isNightmare ? "#fb7185" : "#34d399", lineHeight:1, animation:"hintPop 0.2s ease" }}>{chosenOption}</span>
                    ) : (
                      <span style={{ fontFamily:"'Noto Sans SC',sans-serif", fontSize:"52px", color: isNightmare ? "#4a1020" : "#0a3a1a", animation:"blankPulse 1.2s ease infinite", display:"inline-block" }}>（＿）</span>
                    )}
                  </div>
                  {!isNightmare && <div style={{ fontFamily:"'Noto Sans SC',sans-serif", fontSize:"12px", color:"#1a5a3a" }}>{currentWord.english}</div>}
                  {isNightmare && nightmareRevealed && (
                    <div style={{ marginTop:"6px", fontSize:"11px", color:"#888", fontStyle:"italic", animation:"hintPop 0.2s ease" }}>
                      All correct: {blankCorrects.map(c => blankPrompt + c).join(" / ")}
                    </div>
                  )}
                </>
              )}

              {/* CORRECT ANSWER REVEAL */}
              {showAnswer && (
                <div style={{ margin:"8px 0 2px", padding:"10px 14px", borderRadius:"8px", background:"rgba(239,68,68,0.12)", border:"1px solid #ef4444", animation:"hintPop 0.2s ease" }}>
                  <div style={{ color:"#ef4444", fontSize:"9px", letterSpacing:"2px", marginBottom:"6px", textTransform:"uppercase" }}>✗ Correct answer was:</div>
                  {gameMode === "english" && <div style={{ fontFamily:"'Noto Sans SC',sans-serif", fontSize:"18px", fontWeight:"700", color:"#fca5a5", marginBottom:"8px" }}>{currentWord.chinese} — {currentWord.english}</div>}
                  {gameMode === "chinese" && <div style={{ fontFamily:"'Noto Sans SC',sans-serif", fontSize:"22px", fontWeight:"700", color:"#fca5a5", marginBottom:"8px" }}>{currentWord.chinese}</div>}
                  {gameMode === "radical" && <div style={{ fontFamily:"'Noto Sans SC',sans-serif", fontSize:"20px", fontWeight:"700", color:"#fca5a5", marginBottom:"8px" }}>{currentWord.radical} · {currentWord.radicalChinese} · {currentWord.radicalName}</div>}
                  {isBlank && blankPrompt && <div style={{ fontFamily:"'Noto Sans SC',sans-serif", fontSize:"22px", fontWeight:"700", color:"#fca5a5", marginBottom:"8px" }}>{isNightmare ? blankCorrects.map(c => blankPrompt+c).join(" / ") : blankPrompt + currentWord.chinese.slice(1)}</div>}
                  <button onClick={() => { setShowAnswer(false); setLastResult(null); pickNewWord(usedWords); }}
                    style={{ fontFamily:"'Bangers',cursive", letterSpacing:"1px", fontSize:"15px", background:"#ef4444", color:"white", border:"none", borderRadius:"8px", padding:"7px 22px", cursor:"pointer", width:"100%" }}>
                    Got it — next word 👉
                  </button>
                </div>
              )}

              {/* HINT ROW */}
              <div style={{ minHeight:"28px", display:"flex", alignItems:"center", justifyContent:"center", gap:"8px", marginTop:"6px" }}>
                {showHint ? (
                  <div style={{ color: gameMode==="radical" ? "#8060cc" : isNightmare ? "#fb7185" : isBlank ? "#34d399" : "#6868bb", fontSize:"14px", fontStyle:"italic", animation:"hintPop 0.2s ease" }}>
                    {gameMode === "radical" ? currentWord.pinyin.split(" ")[0] : currentWord.pinyin}
                  </div>
                ) : (
                  <button className="hint-btn" disabled={hintsLeft===0} onClick={() => { if (hintsLeft>0) { setHintsLeft(h=>h-1); setShowHint(true); } }}>
                    {hintsLeft > 0 ? `💡 Pinyin (${hintsLeft} left)` : "No hints left"}
                  </button>
                )}
                {isNightmare ? (
                  <button className="hint-btn" disabled={audioHintsLeft===0} onClick={() => {
                    if (audioHintsLeft===0) return;
                    setAudioHintsLeft(h=>h-1);
                    speak(currentWord.chinese);
                  }}>
                    {audioHintsLeft > 0 ? `🔊 Hear answer (${audioHintsLeft} left)` : "No audio hints"}
                  </button>
                ) : (
                  <button className="hint-btn" onClick={() => {
                    const toSpeak = gameMode==="radical" ? currentWord.chinese[0] : isBlank ? blankPrompt : currentWord.chinese;
                    speak(toSpeak);
                  }}>🔊 Listen</button>
                )}
              </div>
            </div>

            {/* OPTIONS */}
            {!showAnswer && (gameMode === "radical" ? (
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"9px" }}>
                {options.map((opt, i) => (
                  <button key={i} className="opt-btn-radical" onClick={() => handleAnswer(opt)} style={{ animationDelay:`${i*0.06}s` }}>
                    <span style={{ fontFamily:"'Noto Sans SC',sans-serif", fontSize:"36px", fontWeight:"700", display:"block", color:"#c4a0ff", lineHeight:1.1, marginBottom:"4px" }}>{opt.radical}</span>
                    <span style={{ fontSize:"13px", color:"#9070cc", display:"block", fontFamily:"'Noto Sans SC',sans-serif", fontWeight:"700", marginBottom:"2px" }}>{opt.radicalChinese}</span>
                    <span style={{ fontSize:"10px", color:"#4a3a6a", display:"block" }}>{opt.radicalName}</span>
                  </button>
                ))}
              </div>
            ) : isBlank ? (
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"9px" }}>
                {options.map((opt, i) => (
                  <button key={i} className={isNightmare ? "opt-btn-nightmare" : "opt-btn-blank"}
                    onClick={() => !nightmareRevealed && handleAnswer(opt)}
                    style={{ animationDelay:`${i*0.06}s`, ...blankOptStyle(opt), cursor: nightmareRevealed ? "default" : "pointer" }}>
                    <span style={{ fontFamily:"'Noto Sans SC',sans-serif", fontSize:"28px", fontWeight:"700", display:"block", lineHeight:1.1, marginBottom:"2px" }}>{blankPrompt}{opt}</span>
                    <span style={{ fontSize:"10px", display:"block", opacity:0.5 }}>{opt}</span>
                  </button>
                ))}
              </div>
            ) : (
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"9px" }}>
                {options.map((opt, i) => (
                  <button key={i} className="opt-btn" onClick={() => handleAnswer(opt)} style={{ animationDelay:`${i*0.06}s` }}>
                    {gameMode === "english" ? (
                      <>
                        <span style={{ fontSize:"18px", display:"block", marginBottom:"4px" }}>{opt.emoji}</span>
                        <span style={{ fontSize:"13px", fontWeight:"700", display:"block" }}>{opt.english}</span>
                      </>
                    ) : (
                      <span style={{ fontFamily:"'Noto Sans SC',sans-serif", fontSize:"26px", fontWeight:"700", display:"block", color:"#facc15", padding:"4px 0" }}>{opt.chinese}</span>
                    )}
                  </button>
                ))}
              </div>
            ))}

            <div style={{ textAlign:"center", marginTop:"8px", color:"#252540", fontSize:"10px", letterSpacing:"1px" }}>
              {totalWords - usedWords.length} words remaining
            </div>
          </div>
        )}

      </div>
    </>
  );
}
