import "./styles.css";
import { createSpeaker } from "../shared/tts.js";
import { TTS_CLIPS } from "./tts-manifest.js";
import { WORD_DATA, ALL_WORDS, ANIMALS, MASCOTS, WORD_COLORS, genericPraise } from "./data.js";

const { speak, speakSeq } = createSpeaker(TTS_CLIPS, { lang: "en" });

// ===== PERSISTENCE =====
const LS_KEY = 'sightwords_flagged_v1';
const LS_ROUNDS_KEY = 'sightwords_rounds_v1';
function loadFlagged() { try { return new Set(JSON.parse(localStorage.getItem(LS_KEY))||[]); } catch { return new Set(); } }
function saveFlagged() { localStorage.setItem(LS_KEY, JSON.stringify([...flaggedWords])); }
function flagWord(w)   { flaggedWords.add(w);    saveFlagged(); updateFlagCount(); }
function unflagWord(w) { flaggedWords.delete(w); saveFlagged(); updateFlagCount(); }
function updateFlagCount() { document.getElementById('flagCount').textContent = flaggedWords.size; }

function loadRounds() { try { return JSON.parse(localStorage.getItem(LS_ROUNDS_KEY)) || []; } catch { return []; } }
function saveRound(roundObj) {
  const rounds = loadRounds();
  rounds.unshift(roundObj);
  if (rounds.length > 20) rounds.length = 20;
  localStorage.setItem(LS_ROUNDS_KEY, JSON.stringify(rounds));
}
function clearRounds() { localStorage.removeItem(LS_ROUNDS_KEY); }

// ===== STATE =====
let flaggedWords = loadFlagged();
let selectedAnimal = null;
let words = [], idx = 0, score = 0, lives = 3;
let answered = false, cardFlipped = false, rescuedCount = 0;
let streak = 0;
let roundResults = [];

// ===== WEIGHTED POOL =====
function buildWeightedPool() {
  const pool = [];
  for (const w of ALL_WORDS) {
    const n = flaggedWords.has(w) ? 3 : 1;
    for (let i = 0; i < n; i++) pool.push(w);
  }
  return pool;
}
function pickRound() {
  const pool = buildWeightedPool();
  const shuffled = shuffle(pool);
  const seen = new Set(); const result = [];
  for (const w of shuffled) { if (!seen.has(w)) { seen.add(w); result.push(w); } if (result.length===10) break; }
  if (result.length < 10) { for (const w of shuffle(ALL_WORDS)) { if (!seen.has(w)) { seen.add(w); result.push(w); } if (result.length===10) break; } }
  return result;
}

// ===== PICKER =====
function buildPicker() {
  const grid = document.getElementById('animalGrid');
  grid.innerHTML = '';
  ANIMALS.forEach((a) => {
    const card = document.createElement('div');
    card.className = 'animal-card';
    card.innerHTML = `<span class="animal-emoji">${a.emoji}</span><div class="animal-name">${a.name}</div>`;
    card.addEventListener('click', () => {
      document.querySelectorAll('.animal-card').forEach(c => c.classList.remove('selected'));
      card.classList.add('selected');
      selectedAnimal = a;
      const btn = document.getElementById('btnStart');
      btn.style.display = 'block';
      btn.textContent = `🚀 Save the ${a.name}!`;
      speak(`Let's save the ${a.name}!`);
    });
    grid.appendChild(card);
  });
}

function openParentPanel() {
  const panel = document.getElementById('parentPanel');
  panel.style.display = 'block';
  renderParentPanel();
}

document.getElementById('btnParentLink').addEventListener('click', openParentPanel);

document.getElementById('parentClose').addEventListener('click', () => {
  document.getElementById('parentPanel').style.display = 'none';
});

document.getElementById('btnGameParentLink').addEventListener('click', () => {
  const panel = document.getElementById('gameParentPanel');
  panel.style.display = 'block';
  renderGameParentPanel();
});
document.getElementById('gameParentClose').addEventListener('click', () => {
  document.getElementById('gameParentPanel').style.display = 'none';
});

function renderGameParentPanel() {
  const list = document.getElementById('gameFlaggedList');
  list.innerHTML = '';
  if (flaggedWords.size === 0) {
    list.innerHTML = '<div class="no-flagged">No practice words yet! Tap 🚩 Highlight on any word card to add it.</div>';
    return;
  }
  [...flaggedWords].sort().forEach(word => {
    const row = document.createElement('div'); row.className = 'flagged-row'; row.id = 'grow-'+word;
    row.innerHTML = `<div><div class="flagged-word">${word}</div><div class="flagged-meta">Extra practice word</div></div><button class="btn-unflag" data-word="${word}">Remove</button>`;
    row.querySelector('.btn-unflag').addEventListener('click', e => {
      unflagWord(e.target.dataset.word);
      if (words[idx] === e.target.dataset.word) {
        document.getElementById('cardScene').classList.remove('is-flagged');
        document.getElementById('wordCardFront').classList.remove('is-flagged');
        document.getElementById('flagBtn').textContent = '🚩 Highlight';
        document.getElementById('flagBtn').classList.remove('is-flagged');
      }
      setTimeout(() => renderGameParentPanel(), 200);
    });
    list.appendChild(row);
  });
}

function renderParentPanel() {
  const list = document.getElementById('flaggedList');
  list.innerHTML = '';
  if (flaggedWords.size === 0) {
    list.innerHTML = '<div class="no-flagged">No practice words yet! Tap 🚩 Highlight during the game to add words.</div>';
    return;
  }
  [...flaggedWords].sort().forEach(word => {
    const row = document.createElement('div'); row.className = 'flagged-row'; row.id = 'frow-'+word;
    row.innerHTML = `<div><div class="flagged-word">${word}</div><div class="flagged-meta">Extra practice word</div></div><button class="btn-unflag" data-word="${word}">Remove</button>`;
    row.querySelector('.btn-unflag').addEventListener('click', e => {
      unflagWord(e.target.dataset.word);
      setTimeout(() => renderParentPanel(), 200);
    });
    list.appendChild(row);
  });
}

document.getElementById('btnStart').addEventListener('click', () => {
  if (!selectedAnimal) return;
  document.getElementById('pickerScreen').style.display = 'none';
  document.getElementById('parentPanel').style.display = 'none';
  document.getElementById('gameScreen').style.display = 'flex';
  startGame();
});

// ===== GAME =====
function shuffle(arr) { return [...arr].sort(() => Math.random() - 0.5); }

function startGame() {
  words = pickRound();
  idx = 0; score = 0; lives = 3; rescuedCount = 0; answered = false; streak = 0; roundResults = [];
  document.getElementById('finish').style.display = 'none';
  document.getElementById('rescuePen').innerHTML = '<span class="rescue-empty">Answer correctly to rescue animals!</span>';
  document.getElementById('rescueLabel').textContent = `🌿 Rescued ${selectedAnimal.name}`;
  updateFlagCount();
  buildProgStrip(); buildBg(); showWord();
}

function buildBg() {
  const c = document.getElementById('bgShapes'); c.innerHTML = '';
  const cols = ['#FF6B6B','#4ECDC4','#FFD700','#a78bfa','#51CF66','#FCB69F'];
  for (let i = 0; i < 14; i++) {
    const s = document.createElement('div'); s.className = 'shape';
    const sz = 40 + Math.random()*80;
    s.style.cssText = `width:${sz}px;height:${sz}px;background:${cols[i%cols.length]};left:${Math.random()*100}%;animation-duration:${12+Math.random()*18}s;animation-delay:-${Math.random()*20}s;`;
    c.appendChild(s);
  }
}

function buildProgStrip() {
  const d = document.getElementById('progStrip'); d.innerHTML = '';
  words.forEach((_, i) => {
    const span = document.createElement('span');
    span.className = 'prog-dot' + (i === 0 ? ' cur' : '');
    span.id = 'pd' + i;
    span.textContent = selectedAnimal.emoji;
    d.appendChild(span);
  });
}
function setProg(i, cls) { const d = document.getElementById('pd'+i); if(d) d.className='prog-dot '+cls; }

function updateHUD() {
  document.getElementById('score').textContent = score;
  document.getElementById('lives').textContent = lives;
  document.getElementById('wnum').textContent = (idx+1)+'/'+words.length;
}

function showWord() {
  answered = false; cardFlipped = false;
  const w = words[idx];
  const data = WORD_DATA[w];
  const isFlagged = flaggedWords.has(w);

  document.getElementById('theWord').textContent = w;
  document.getElementById('theWord').style.color = WORD_COLORS[Math.floor(Math.random()*WORD_COLORS.length)];
  document.getElementById('wordNum').textContent = 'Word '+(idx+1)+' of '+words.length;

  const chunksEl = document.getElementById('phonicsChunks');
  chunksEl.innerHTML = '';
  data.chunks.forEach(ch => {
    const s = document.createElement('span'); s.className = 'phonics-chunk'; s.textContent = ch;
    chunksEl.appendChild(s);
  });
  document.getElementById('phonicsHintNote').textContent = data.hint;

  document.getElementById('cardFlipper').classList.remove('flipped');
  document.getElementById('hintBtn').textContent = '💡 Hint';

  const scene = document.getElementById('cardScene');
  const front = document.getElementById('wordCardFront');
  const flagBtn = document.getElementById('flagBtn');
  if (isFlagged) {
    scene.classList.add('is-flagged'); front.classList.add('is-flagged');
    flagBtn.textContent = '🚩 Highlighted'; flagBtn.classList.add('is-flagged');
  } else {
    scene.classList.remove('is-flagged'); front.classList.remove('is-flagged');
    flagBtn.textContent = '🚩 Highlight'; flagBtn.classList.remove('is-flagged');
  }

  document.getElementById('nextBtn').style.display = 'none';
  document.getElementById('flagBtn').style.display = 'inline-block';
  document.getElementById('hintBtn').style.display = 'inline-block';
  document.getElementById('resultBox').className = 'result-box';
  document.getElementById('resultBox').style.display = 'none';
  document.getElementById('char').textContent = MASCOTS[Math.floor(Math.random()*MASCOTS.length)];

  setProg(idx, 'cur');
  updateHUD();
  buildChoices(w);
}

function getDistractors(correct, count) {
  return shuffle(ALL_WORDS.filter(w => w !== correct)).slice(0, count);
}

function buildChoices(correct) {
  const options = shuffle([correct, ...getDistractors(correct, 3)]);
  const container = document.getElementById('choices'); container.innerHTML = '';
  options.forEach(word => {
    const btn = document.createElement('button'); btn.className = 'choice-btn';
    btn.textContent = word;
    btn.addEventListener('click', () => handleChoice(btn, word, correct));
    container.appendChild(btn);
  });
}

function handleChoice(btn, chosen, correct) {
  if (answered) return;
  answered = true;
  document.querySelectorAll('.choice-btn').forEach(b => b.disabled = true);
  document.getElementById('flagBtn').style.display = 'none';
  document.getElementById('hintBtn').style.display = 'none';
  if (chosen === correct) {
    btn.classList.add('correct');
    roundResults.push({word: correct, correct: true});
    onCorrect();
  } else {
    btn.classList.add('wrong');
    document.querySelectorAll('.choice-btn').forEach(b => {
      if (b.textContent === correct) b.classList.add('correct');
      else if (b !== btn) b.classList.add('dim');
    });
    roundResults.push({word: correct, correct: false});
    onWrong();
  }
}

function onCorrect() {
  score++; rescuedCount++; streak++;
  setProg(idx, 'ok'); updateHUD();
  addRescuedAnimal();
  const msgs = ['🎉 YAY! You got it!','⭐ Super star!','🌟 Amazing job!','🎊 Woohoo! Perfect!','💫 Brilliant!','🌈 You nailed it!'];
  document.getElementById('resultBox').textContent = msgs[Math.floor(Math.random()*msgs.length)] + ` You rescued ${selectedAnimal.singular}!`;
  document.getElementById('resultBox').className = 'result-box good';
  document.getElementById('nextBtn').style.display = 'inline-block';
  const animalPraise = [
    `The ${selectedAnimal.name.toLowerCase()} thank you!`,
    `You just rescued ${selectedAnimal.singular}!`,
    `${selectedAnimal.name} everywhere are cheering!`,
    selectedAnimal.shout,
  ];
  const allPraise = [...genericPraise, ...animalPraise, ...animalPraise];
  speak(allPraise[Math.floor(Math.random() * allPraise.length)]);
  fireBurst();
  showRescuePopup();
  triggerCelebration();
}

function onWrong() {
  lives = Math.max(0, lives-1); streak = 0;
  setProg(idx, 'miss'); updateHUD();
  const target = words[idx];
  document.getElementById('resultBox').textContent = `😊 The word is "${target}". Keep going — you've got this!`;
  document.getElementById('resultBox').className = 'result-box bad';
  document.getElementById('nextBtn').style.display = 'inline-block';
  document.getElementById('cardScene').style.animation = 'shakeCard .35s ease';
  setTimeout(() => document.getElementById('cardScene').style.animation = '', 400);
  speak('The word is ' + target + '. Try again next time!');
}

function addRescuedAnimal() {
  const pen = document.getElementById('rescuePen');
  pen.querySelectorAll('.rescue-empty').forEach(e => e.remove());
  const span = document.createElement('span'); span.className = 'rescue-animal';
  span.textContent = selectedAnimal.emoji; pen.appendChild(span);
}

function showRescuePopup() {
  document.getElementById('rescuePopupEmoji').textContent = selectedAnimal.emoji;
  document.getElementById('rescuePopupText').textContent = `You rescued ${selectedAnimal.singular}!`;
  const overlay = document.getElementById('rescueOverlay');
  overlay.style.display = 'flex';
  setTimeout(() => { overlay.style.display = 'none'; }, 1400);
}

function nextWord() {
  idx++;
  if (idx >= words.length) { showFinish(); return; }
  showWord();
}

function showFinish() {
  document.getElementById('gameScreen').style.display = 'none';
  document.getElementById('finish').style.display = 'block';
  const pct = score / words.length;
  let em, ti, su;
  if (pct===1)       {em='🏆';ti='PERFECT!';   su='You read EVERY word! WOW!';}
  else if(pct>=0.7)  {em='🌟';ti='Super Star!';su='Amazing reading today!';}
  else if(pct>=0.5)  {em='🎉';ti='Great Job!'; su='Keep practising!';}
  else               {em='💪';ti='Good Try!';  su='Practice makes perfect!';}
  document.getElementById('finEmoji').textContent = em;
  document.getElementById('finTitle').textContent = ti;
  document.getElementById('finSub').textContent = su + ` You rescued ${rescuedCount} ${selectedAnimal.name.toLowerCase()}!`;
  document.getElementById('finScore').textContent = score+'/'+words.length+' ⭐';
  const finPen = document.getElementById('finPen'); finPen.innerHTML = '';
  for (let i = 0; i < rescuedCount; i++) {
    const s = document.createElement('span');
    s.textContent = selectedAnimal.emoji;
    s.style.cssText = `display:inline-block;animation:rescueIn .5s cubic-bezier(.175,.885,.32,1.275) ${i*.08}s both;`;
    finPen.appendChild(s);
  }
  for (let i = 0; i < 8; i++) setTimeout(fireBurst, i*220);
  setTimeout(() => animalShower(20), 300);
  speakSeq([ti, 'You rescued ' + rescuedCount + ' ' + selectedAnimal.name.toLowerCase() + '!']);

  document.getElementById('btnRevision').onclick = () => showRevision();
}

// ===== REVISION SCREEN =====
function showRevision() {
  document.getElementById('finish').style.display = 'none';
  document.getElementById('revisionScreen').style.display = 'flex';
  document.getElementById('saveConfirm').style.display = 'none';
  const btnSave = document.getElementById('btnSaveRound');
  btnSave.disabled = false;
  btnSave.textContent = '💾 Save this list';

  document.getElementById('revisionSub').textContent =
    `${score}/${words.length} correct · Tap 🔊 to hear any word`;

  const list = document.getElementById('revisionList');
  list.innerHTML = '';
  roundResults.forEach(r => {
    const row = document.createElement('div');
    row.className = 'rev-row ' + (r.correct ? 'rev-correct' : 'rev-wrong');
    row.innerHTML = `
      <span class="rev-result">${r.correct ? '✅' : '❌'}</span>
      <span class="rev-word">${r.word}</span>
      <button class="btn-rev-hear" data-word="${r.word}">🔊 Hear</button>
    `;
    row.querySelector('.btn-rev-hear').addEventListener('click', e => {
      speak(e.target.dataset.word);
    });
    list.appendChild(row);
  });

  renderRevFlaggedList();
  renderPastRounds();
}

function renderRevFlaggedList() {
  const list = document.getElementById('revFlaggedList');
  list.innerHTML = '';
  if (flaggedWords.size === 0) {
    list.innerHTML = '<div class="no-flagged">No practice words yet.</div>';
    return;
  }
  [...flaggedWords].sort().forEach(word => {
    const row = document.createElement('div'); row.className = 'flagged-row';
    row.innerHTML = `<div><div class="flagged-word">${word}</div><div class="flagged-meta">Extra practice word</div></div><button class="btn-unflag" data-word="${word}">Remove</button>`;
    row.querySelector('.btn-unflag').addEventListener('click', e => {
      unflagWord(e.target.dataset.word);
      setTimeout(() => renderRevFlaggedList(), 150);
    });
    list.appendChild(row);
  });
}

function renderPastRounds() {
  const container = document.getElementById('pastRoundsList');
  container.innerHTML = '';
  const rounds = loadRounds();
  if (rounds.length === 0) {
    container.innerHTML = '<div class="no-past-rounds">No saved rounds yet. Tap 💾 Save this list after a round!</div>';
    return;
  }
  rounds.forEach((round, ri) => {
    const summary = document.createElement('div');
    summary.className = 'round-summary';
    const correct = round.results.filter(r => r.correct).length;
    summary.innerHTML = `
      <div class="round-summary-header" id="rsh-${ri}">
        <div>
          <div class="round-date">${round.date} · ${round.animal}</div>
        </div>
        <div style="display:flex;align-items:center;gap:8px;">
          <span class="round-score-badge">${correct}/${round.results.length} ⭐</span>
          <span class="round-chevron" id="rc-${ri}">▶</span>
        </div>
      </div>
      <div class="round-words-list" id="rwl-${ri}"></div>
    `;
    container.appendChild(summary);

    const wordList = summary.querySelector(`#rwl-${ri}`);
    round.results.forEach(r => {
      const wr = document.createElement('div');
      wr.className = 'round-word-row ' + (r.correct ? 'rw-correct' : 'rw-wrong');
      wr.innerHTML = `
        <span class="round-word-result">${r.correct ? '✅' : '❌'}</span>
        <span class="round-word-text">${r.word}</span>
        <button class="btn-rw-hear" data-word="${r.word}">🔊</button>
      `;
      wr.querySelector('.btn-rw-hear').addEventListener('click', e => {
        speak(e.target.dataset.word);
      });
      wordList.appendChild(wr);
    });

    summary.querySelector(`#rsh-${ri}`).addEventListener('click', () => {
      const wl = summary.querySelector(`#rwl-${ri}`);
      const chev = summary.querySelector(`#rc-${ri}`);
      const isOpen = wl.classList.toggle('open');
      chev.classList.toggle('open', isOpen);
    });

    if (ri === 0) {
      summary.querySelector(`#rwl-0`).classList.add('open');
      summary.querySelector(`#rc-0`).classList.add('open');
    }
  });
}

document.getElementById('btnSaveRound').addEventListener('click', () => {
  const now = new Date();
  const dateStr = now.toLocaleDateString('en-GB', {day:'numeric',month:'short',year:'numeric'});
  saveRound({
    date: dateStr,
    animal: selectedAnimal.emoji + ' ' + selectedAnimal.name,
    score,
    results: roundResults,
  });
  const btn = document.getElementById('btnSaveRound');
  btn.disabled = true;
  btn.textContent = '✅ Saved!';
  const panel = document.getElementById('revParentPanel');
  panel.style.display = 'block';
  renderRevFlaggedList();
  renderPastRounds();
  setTimeout(() => panel.scrollIntoView({behavior:'smooth', block:'nearest'}), 100);
});

document.getElementById('btnClearRounds').addEventListener('click', () => {
  if (confirm('Clear all saved rounds?')) {
    clearRounds();
    renderPastRounds();
  }
});

document.getElementById('btnRevParentLink').addEventListener('click', () => {
  const panel = document.getElementById('revParentPanel');
  panel.style.display = panel.style.display === 'block' ? 'none' : 'block';
  renderRevFlaggedList();
  renderPastRounds();
});
document.getElementById('revParentClose').addEventListener('click', () => {
  document.getElementById('revParentPanel').style.display = 'none';
});

document.getElementById('btnRevToPlay').addEventListener('click', goToRestart);

// ===== CELEBRATIONS =====
function triggerCelebration() {
  const roll = Math.random();
  if (streak >= 3 && Math.random() < 0.6) {
    setTimeout(animalWander, 300);
  } else if (roll < 0.4) {
    setTimeout(() => animalShower(12), 200);
  } else if (roll < 0.7) {
    setTimeout(animalWander, 300);
  }
}

function animalShower(count) {
  const container = document.getElementById('animalShower');
  for (let i = 0; i < count; i++) {
    const span = document.createElement('span');
    span.className = 'shower-animal';
    span.textContent = selectedAnimal.emoji;
    const left = 5 + Math.random() * 90;
    const dur = 1.2 + Math.random() * 1.6;
    const delay = Math.random() * 1.2;
    const size = 1.4 + Math.random() * 1.4;
    span.style.cssText = `left:${left}%;font-size:${size}rem;animation-duration:${dur}s;animation-delay:${delay}s;`;
    container.appendChild(span);
    setTimeout(() => span.remove(), (dur + delay + 0.2) * 1000);
  }
}

function animalWander() {
  document.querySelectorAll('.wander-wrap').forEach(w => w.remove());
  const wrap = document.createElement('div');
  wrap.className = 'wander-wrap';
  wrap.innerHTML = `
    <div class="wander-speech">${selectedAnimal.shout}</div>
    <div class="wander-animal">${selectedAnimal.emoji}</div>
  `;
  document.body.appendChild(wrap);
  setTimeout(() => wrap.remove(), 4200);
}

// ===== HIGHLIGHT / FLAG =====
document.getElementById('flagBtn').addEventListener('click', () => {
  if (answered) return;
  const word = words[idx];
  const isFlagged = flaggedWords.has(word);
  const btn = document.getElementById('flagBtn');
  btn.classList.remove('flashing');
  void btn.offsetWidth;
  btn.classList.add('flashing');
  setTimeout(() => btn.classList.remove('flashing'), 500);

  if (isFlagged) {
    unflagWord(word);
    btn.textContent = '🚩 Highlight'; btn.classList.remove('is-flagged');
    document.getElementById('cardScene').classList.remove('is-flagged');
    document.getElementById('wordCardFront').classList.remove('is-flagged');
  } else {
    flagWord(word);
    btn.textContent = '🚩 Highlighted'; btn.classList.add('is-flagged');
    document.getElementById('cardScene').classList.add('is-flagged');
    document.getElementById('wordCardFront').classList.add('is-flagged');
  }
});

// ===== HINT FLIP =====
document.getElementById('hintBtn').addEventListener('click', () => {
  cardFlipped = !cardFlipped;
  document.getElementById('cardFlipper').classList.toggle('flipped', cardFlipped);
  document.getElementById('hintBtn').textContent = cardFlipped ? '🔄 Word' : '💡 Hint';
});

document.getElementById('sayBtn').addEventListener('click', () => speak(words[idx]));
document.getElementById('nextBtn').addEventListener('click', nextWord);

// ===== BURST =====
function fireBurst() {
  const b = document.getElementById('burst');
  const emojis = ['⭐','🌟','✨','💫','🎉','🎊','🌈','💥', selectedAnimal.emoji];
  const cx = window.innerWidth/2, cy = window.innerHeight/2;
  for (let i = 0; i < 10; i++) {
    const s = document.createElement('span'); s.className = 'burst-star';
    s.textContent = emojis[Math.floor(Math.random()*emojis.length)];
    const angle = Math.random()*Math.PI*2, dist = 100+Math.random()*180;
    const size = 1.4 + Math.random()*1.2;
    s.style.cssText = `left:${cx}px;top:${cy}px;font-size:${size}rem;--dx:${Math.cos(angle)*dist}px;--dy:${Math.sin(angle)*dist}px;--dr:${Math.random()*720-360}deg;animation-delay:${Math.random()*.15}s;`;
    b.appendChild(s); setTimeout(() => s.remove(), 1200);
  }
}

// ===== RESTART =====
function goToRestart() {
  document.getElementById('finish').style.display = 'none';
  document.getElementById('revisionScreen').style.display = 'none';
  document.getElementById('gameScreen').style.display = 'none';
  document.getElementById('pickerScreen').style.display = 'flex';
  document.getElementById('revParentPanel').style.display = 'none';
  document.getElementById('gameParentPanel').style.display = 'none';
  document.getElementById('parentPanel').style.display = 'none';
  document.querySelectorAll('.animal-card').forEach(c => c.classList.remove('selected'));
  document.getElementById('btnStart').style.display = 'none';
  selectedAnimal = null;
}

document.getElementById('restartBtn').addEventListener('click', goToRestart);

buildPicker(); buildBg(); updateFlagCount();
