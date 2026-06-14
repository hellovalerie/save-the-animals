import { useState } from "react";
import "./styles.css";
import { createSpeaker } from "../shared/tts.js";
import { TTS_CLIPS } from "./tts-manifest.js";
import { WORD_DATA, ALL_WORDS, ANIMALS, MASCOTS, WORD_COLORS, genericPraise } from "./data.js";

const { speak, speakSeq } = createSpeaker(TTS_CLIPS, { lang: "en" });

const LS_KEY = "sightwords_flagged_v1";
const LS_ROUNDS_KEY = "sightwords_rounds_v1";
const ROUND_SIZE = 10;

function loadFlagged() {
  try {
    return new Set(JSON.parse(localStorage.getItem(LS_KEY)) || []);
  } catch {
    return new Set();
  }
}

function saveFlagged(flaggedWords) {
  localStorage.setItem(LS_KEY, JSON.stringify([...flaggedWords]));
}

function loadRounds() {
  try {
    return JSON.parse(localStorage.getItem(LS_ROUNDS_KEY)) || [];
  } catch {
    return [];
  }
}

function saveRounds(rounds) {
  localStorage.setItem(LS_ROUNDS_KEY, JSON.stringify(rounds));
}

function shuffle(arr) {
  return [...arr].sort(() => Math.random() - 0.5);
}

function pickRound(flaggedWords) {
  const pool = [];
  for (const word of ALL_WORDS) {
    const count = flaggedWords.has(word) ? 3 : 1;
    for (let i = 0; i < count; i++) pool.push(word);
  }

  const seen = new Set();
  const result = [];
  for (const word of shuffle(pool)) {
    if (!seen.has(word)) {
      seen.add(word);
      result.push(word);
    }
    if (result.length === ROUND_SIZE) break;
  }

  if (result.length < ROUND_SIZE) {
    for (const word of shuffle(ALL_WORDS)) {
      if (!seen.has(word)) {
        seen.add(word);
        result.push(word);
      }
      if (result.length === ROUND_SIZE) break;
    }
  }

  return result;
}

function makeQuestion(word) {
  return {
    word,
    choices: shuffle([word, ...shuffle(ALL_WORDS.filter((candidate) => candidate !== word)).slice(0, 3)]),
    wordColor: WORD_COLORS[Math.floor(Math.random() * WORD_COLORS.length)],
    mascot: MASCOTS[Math.floor(Math.random() * MASCOTS.length)],
  };
}

function makeBackgroundShapes() {
  const colors = ["#FF6B6B", "#4ECDC4", "#FFD700", "#a78bfa", "#51CF66", "#FCB69F"];
  return Array.from({ length: 14 }, (_, i) => ({
    id: i,
    size: 40 + Math.random() * 80,
    color: colors[i % colors.length],
    left: Math.random() * 100,
    duration: 12 + Math.random() * 18,
    delay: -Math.random() * 20,
  }));
}

function makeBurst(animalEmoji) {
  const emojis = ["⭐", "🌟", "✨", "💫", "🎉", "🎊", "🌈", "💥", animalEmoji];
  const cx = window.innerWidth / 2;
  const cy = window.innerHeight / 2;
  return Array.from({ length: 10 }, (_, i) => {
    const angle = Math.random() * Math.PI * 2;
    const dist = 100 + Math.random() * 180;
    return {
      id: `${Date.now()}-${i}-${Math.random()}`,
      emoji: emojis[Math.floor(Math.random() * emojis.length)],
      left: cx,
      top: cy,
      dx: Math.cos(angle) * dist,
      dy: Math.sin(angle) * dist,
      rotate: Math.random() * 720 - 360,
      size: 1.4 + Math.random() * 1.2,
      delay: Math.random() * 0.15,
    };
  });
}

function makeShower(count, animalEmoji) {
  return Array.from({ length: count }, (_, i) => {
    const duration = 1.2 + Math.random() * 1.6;
    const delay = Math.random() * 1.2;
    return {
      id: `${Date.now()}-${i}-${Math.random()}`,
      emoji: animalEmoji,
      left: 5 + Math.random() * 90,
      duration,
      delay,
      size: 1.4 + Math.random() * 1.4,
      ttl: (duration + delay + 0.2) * 1000,
    };
  });
}

function finishCopy(score, total) {
  const pct = score / total;
  if (pct === 1) return { emoji: "🏆", title: "PERFECT!", sub: "You read EVERY word! WOW!" };
  if (pct >= 0.7) return { emoji: "🌟", title: "Super Star!", sub: "Amazing reading today!" };
  if (pct >= 0.5) return { emoji: "🎉", title: "Great Job!", sub: "Keep practising!" };
  return { emoji: "💪", title: "Good Try!", sub: "Practice makes perfect!" };
}

function FlaggedList({ flaggedWords, emptyText, onRemove }) {
  const words = [...flaggedWords].sort();
  if (words.length === 0) {
    return <div className="no-flagged">{emptyText}</div>;
  }

  return words.map((word) => (
    <div className="flagged-row" key={word}>
      <div>
        <div className="flagged-word">{word}</div>
        <div className="flagged-meta">Extra practice word</div>
      </div>
      <button className="btn-unflag" onClick={() => onRemove(word)}>Remove</button>
    </div>
  ));
}

function ParentPanel({ flaggedWords, onRemove, onClose, title = "🔒 Practice Words", includeRounds = false, rounds = [], onClearRounds }) {
  const [openRound, setOpenRound] = useState(0);

  return (
    <div id={includeRounds ? "revParentPanel" : "parentPanel"} style={{ display: "block" }}>
      <div className="parent-header">
        <div className="parent-title">{title}</div>
        <button className="parent-close" onClick={onClose}>✕</button>
      </div>
      <div className="flagged-list">
        <FlaggedList
          flaggedWords={flaggedWords}
          emptyText={includeRounds ? "No practice words yet." : "No practice words yet! Tap 🚩 Highlight during the game to add words."}
          onRemove={onRemove}
        />
      </div>
      <div className="parent-note">Tap <strong>Remove</strong> next to a word to return it to normal rotation.</div>

      {includeRounds && (
        <div className="past-rounds-section">
          <div className="past-rounds-title">📚 Saved Rounds</div>
          {rounds.length === 0 ? (
            <div className="no-past-rounds">No saved rounds yet. Tap 💾 Save this list after a round!</div>
          ) : rounds.map((round, index) => {
            const correct = round.results.filter((r) => r.correct).length;
            const isOpen = openRound === index;
            return (
              <div className="round-summary" key={`${round.date}-${index}`}>
                <div className="round-summary-header" onClick={() => setOpenRound(isOpen ? -1 : index)}>
                  <div>
                    <div className="round-date">{round.date} · {round.animal}</div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <span className="round-score-badge">{correct}/{round.results.length} ⭐</span>
                    <span className={`round-chevron ${isOpen ? "open" : ""}`}>▶</span>
                  </div>
                </div>
                <div className={`round-words-list ${isOpen ? "open" : ""}`}>
                  {round.results.map((result, resultIndex) => (
                    <div className={`round-word-row ${result.correct ? "rw-correct" : "rw-wrong"}`} key={`${result.word}-${resultIndex}`}>
                      <span className="round-word-result">{result.correct ? "✅" : "❌"}</span>
                      <span className="round-word-text">{result.word}</span>
                      <button className="btn-rw-hear" onClick={() => speak(result.word)}>🔊</button>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
          <button className="btn-clear-rounds" onClick={onClearRounds}>Clear all saved rounds</button>
        </div>
      )}
    </div>
  );
}

function PickerScreen({ selectedAnimal, flaggedWords, parentOpen, onSelectAnimal, onStart, onToggleParent, onRemoveFlag }) {
  return (
    <div id="pickerScreen">
      <div className="picker-title">Choose your animal to rescue! 🐾</div>
      <div className="picker-sub">Every word you get right saves one from the wild!</div>
      <div className="animal-grid">
        {ANIMALS.map((animal) => (
          <div
            className={`animal-card ${selectedAnimal?.name === animal.name ? "selected" : ""}`}
            key={animal.name}
            onClick={() => {
              onSelectAnimal(animal);
              speak(`Let's save the ${animal.name}!`);
            }}
          >
            <span className="animal-emoji">{animal.emoji}</span>
            <div className="animal-name">{animal.name}</div>
          </div>
        ))}
      </div>
      {selectedAnimal && (
        <button className="btn-start" style={{ display: "block" }} onClick={onStart}>
          🚀 Save the {selectedAnimal.name}!
        </button>
      )}
      <button className="parent-link" onClick={onToggleParent}>🔒 Parent view</button>
      {parentOpen && (
        <ParentPanel flaggedWords={flaggedWords} onRemove={onRemoveFlag} onClose={onToggleParent} />
      )}
    </div>
  );
}

function GameScreen({
  animal,
  flaggedWords,
  game,
  gameParentOpen,
  onAnswer,
  onNext,
  onToggleFlag,
  onToggleHint,
  onRemoveFlag,
  onToggleParent,
}) {
  const current = game.questions[game.index];
  const wordData = WORD_DATA[current.word];
  const isFlagged = flaggedWords.has(current.word);

  return (
    <div id="gameScreen" style={{ width: "100%", display: "flex", flexDirection: "column", alignItems: "center", gap: "13px" }}>
      <div className="rescue-bar">
        <div className="rescue-label">🌿 Rescued {animal.name}</div>
        <div className="rescue-pen">
          {game.rescuedCount === 0 ? (
            <span className="rescue-empty">Answer correctly to rescue animals!</span>
          ) : Array.from({ length: game.rescuedCount }, (_, i) => (
            <span className="rescue-animal" key={i}>{animal.emoji}</span>
          ))}
        </div>
      </div>

      <div className="score-strip">
        <div className="score-pill">⭐ <span className="num">{game.score}</span></div>
        <div className="score-pill">❤️ <span className="num">{game.lives}</span></div>
        <div className="score-pill">🔤 <span className="num">{game.index + 1}/{game.questions.length}</span></div>
        <div className="score-pill">🚩 <span className="num">{flaggedWords.size}</span></div>
      </div>

      <div className="prog-strip">
        {game.questions.map((question, index) => {
          const result = game.results[index];
          const cls = index === game.index && !result ? "cur" : result?.correct ? "ok" : result ? "miss" : "";
          return <span className={`prog-dot ${cls}`} key={`${question.word}-${index}`}>{animal.emoji}</span>;
        })}
      </div>

      <span className="char">{current.mascot}</span>

      <div className={`card-scene ${isFlagged ? "is-flagged" : ""}`} style={{ animation: game.shake ? "shakeCard .35s ease" : undefined }}>
        <div className="flag-badge">🚩 PRACTICE WORD</div>
        <div className={`card-flipper ${game.cardFlipped ? "flipped" : ""}`}>
          <div className={`card-face ${isFlagged ? "is-flagged" : ""}`}>
            <div className="word-label">Which word is this?</div>
            <div className="the-word" style={{ color: current.wordColor }}>{current.word}</div>
            <div className="word-num">Word {game.index + 1} of {game.questions.length}</div>
          </div>
          <div className="card-face card-back">
            <div className="phonics-label">🔤 Say each sound!</div>
            <div className="phonics-chunks">
              {wordData.chunks.map((chunk, index) => (
                <span className="phonics-chunk" key={`${chunk}-${index}`}>{chunk}</span>
              ))}
            </div>
            <div className="phonics-hint-note">{wordData.hint}</div>
          </div>
        </div>
      </div>

      <div className="btn-row">
        <button className="btn btn-say" onClick={() => speak(current.word)}>🔊 Hear it</button>
        {!game.answered && (
          <>
            <button className="btn btn-hint" onClick={onToggleHint}>{game.cardFlipped ? "🔄 Word" : "💡 Hint"}</button>
            <button className={`btn btn-flag ${isFlagged ? "is-flagged" : ""} ${game.flagFlash ? "flashing" : ""}`} onClick={onToggleFlag}>
              {isFlagged ? "🚩 Highlighted" : "🚩 Highlight"}
            </button>
          </>
        )}
        {game.answered && <button className="btn btn-next" style={{ display: "inline-block" }} onClick={onNext}>Next ➡️</button>}
      </div>

      <div className="choices">
        {current.choices.map((choice) => {
          const isChosen = game.chosen === choice;
          const isCorrect = choice === current.word;
          const cls = game.answered
            ? isCorrect
              ? "correct"
              : isChosen
                ? "wrong"
                : "dim"
            : "";
          return (
            <button
              className={`choice-btn ${cls}`}
              disabled={game.answered}
              key={choice}
              onClick={() => onAnswer(choice)}
            >
              {choice}
            </button>
          );
        })}
      </div>

      {game.resultMessage && (
        <div className={`result-box ${game.resultKind}`}>{game.resultMessage}</div>
      )}

      <button className="parent-link" onClick={onToggleParent}>🔒 Parent view</button>
      {gameParentOpen && (
        <ParentPanel
          flaggedWords={flaggedWords}
          onRemove={onRemoveFlag}
          onClose={onToggleParent}
        />
      )}
    </div>
  );
}

function FinishScreen({ animal, game, onReview, onRestart }) {
  const copy = finishCopy(game.score, game.questions.length);

  return (
    <div className="finish" style={{ display: "block" }}>
      <div className="finish-big">{copy.emoji}</div>
      <div className="finish-title">{copy.title}</div>
      <div className="finish-sub">{copy.sub} You rescued {game.rescuedCount} {animal.name.toLowerCase()}!</div>
      <div className="finish-score">{game.score}/{game.questions.length} ⭐</div>
      <div className="finish-pen">
        {Array.from({ length: game.rescuedCount }, (_, i) => (
          <span
            key={i}
            style={{
              display: "inline-block",
              animation: `rescueIn .5s cubic-bezier(.175,.885,.32,1.275) ${i * 0.08}s both`,
            }}
          >
            {animal.emoji}
          </span>
        ))}
      </div>
      <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", justifyContent: "center", marginTop: "12px" }}>
        <button
          className="btn-restart"
          style={{ background: "linear-gradient(135deg,#4ECDC4,#2b9e96)", boxShadow: "0 5px 0 #1a7a72" }}
          onClick={onReview}
        >
          📖 Review Words
        </button>
        <button className="btn-restart" onClick={onRestart}>🔄 Play Again!</button>
      </div>
    </div>
  );
}

function RevisionScreen({ animal, game, flaggedWords, rounds, saved, parentOpen, onSaveRound, onRestart, onToggleParent, onRemoveFlag, onClearRounds }) {
  return (
    <div id="revisionScreen" style={{ display: "flex" }}>
      <div className="revision-card">
        <div className="revision-title">📖 This Round's Words</div>
        <div className="revision-sub">{game.score}/{game.questions.length} correct · Tap 🔊 to hear any word</div>
        <div className="revision-list">
          {game.results.map((result, index) => (
            <div className={`rev-row ${result.correct ? "rev-correct" : "rev-wrong"}`} key={`${result.word}-${index}`}>
              <span className="rev-result">{result.correct ? "✅" : "❌"}</span>
              <span className="rev-word">{result.word}</span>
              <button className="btn-rev-hear" onClick={() => speak(result.word)}>🔊 Hear</button>
            </div>
          ))}
        </div>
      </div>
      <div className="revision-actions">
        <button className="btn-save-round" disabled={saved} onClick={onSaveRound}>
          {saved ? "✅ Saved!" : "💾 Save this list"}
        </button>
        <button className="btn-to-play" onClick={onRestart}>🔄 Play Again!</button>
      </div>
      {saved && <div className="save-confirm" style={{ display: "block" }}>✅ Saved! Find it in Parent view.</div>}
      <button className="parent-link" onClick={onToggleParent}>🔒 Parent view</button>
      {parentOpen && (
        <ParentPanel
          flaggedWords={flaggedWords}
          onRemove={onRemoveFlag}
          onClose={onToggleParent}
          title="🔒 Practice Words & Past Rounds"
          includeRounds
          rounds={rounds}
          onClearRounds={onClearRounds}
        />
      )}
    </div>
  );
}

export default function App() {
  const [screen, setScreen] = useState("picker");
  const [selectedAnimal, setSelectedAnimal] = useState(null);
  const [flaggedWords, setFlaggedWords] = useState(() => loadFlagged());
  const [rounds, setRounds] = useState(() => loadRounds());
  const [parentOpen, setParentOpen] = useState(false);
  const [gameParentOpen, setGameParentOpen] = useState(false);
  const [revisionParentOpen, setRevisionParentOpen] = useState(false);
  const [savedRound, setSavedRound] = useState(false);
  const [bgShapes, setBgShapes] = useState(() => makeBackgroundShapes());
  const [bursts, setBursts] = useState([]);
  const [shower, setShower] = useState([]);
  const [wander, setWander] = useState(null);
  const [rescuePopup, setRescuePopup] = useState(null);
  const [game, setGame] = useState(null);

  const currentWord = game?.questions[game.index]?.word;

  function updateFlagged(updater) {
    setFlaggedWords((current) => {
      const next = updater(new Set(current));
      saveFlagged(next);
      return next;
    });
  }

  function removeFlag(word) {
    updateFlagged((next) => {
      next.delete(word);
      return next;
    });
  }

  function startGame() {
    if (!selectedAnimal) return;
    const words = pickRound(flaggedWords);
    setBgShapes(makeBackgroundShapes());
    setGame({
      questions: words.map(makeQuestion),
      index: 0,
      score: 0,
      lives: 3,
      rescuedCount: 0,
      streak: 0,
      results: [],
      answered: false,
      chosen: null,
      cardFlipped: false,
      resultMessage: "",
      resultKind: "",
      flagFlash: false,
      shake: false,
    });
    setParentOpen(false);
    setGameParentOpen(false);
    setSavedRound(false);
    setScreen("game");
  }

  function restartToPicker() {
    setScreen("picker");
    setSelectedAnimal(null);
    setParentOpen(false);
    setGameParentOpen(false);
    setRevisionParentOpen(false);
    setSavedRound(false);
    setGame(null);
  }

  function addBurst() {
    const next = makeBurst(selectedAnimal.emoji);
    setBursts((current) => [...current, ...next]);
    setTimeout(() => {
      setBursts((current) => current.filter((burst) => !next.some((item) => item.id === burst.id)));
    }, 1300);
  }

  function addShower(count) {
    const next = makeShower(count, selectedAnimal.emoji);
    setShower((current) => [...current, ...next]);
    for (const item of next) {
      setTimeout(() => {
        setShower((current) => current.filter((existing) => existing.id !== item.id));
      }, item.ttl);
    }
  }

  function addWander() {
    const next = {
      id: Date.now(),
      emoji: selectedAnimal.emoji,
      shout: selectedAnimal.shout,
    };
    setWander(next);
    setTimeout(() => {
      setWander((current) => (current?.id === next.id ? null : current));
    }, 4200);
  }

  function triggerCelebration(streak) {
    const roll = Math.random();
    if (streak >= 3 && Math.random() < 0.6) {
      setTimeout(addWander, 300);
    } else if (roll < 0.4) {
      setTimeout(() => addShower(12), 200);
    } else if (roll < 0.7) {
      setTimeout(addWander, 300);
    }
  }

  function answer(choice) {
    setGame((current) => {
      if (!current || current.answered) return current;
      const question = current.questions[current.index];
      const isCorrect = choice === question.word;
      const nextResults = [...current.results, { word: question.word, correct: isCorrect }];

      if (isCorrect) {
        const nextScore = current.score + 1;
        const nextRescued = current.rescuedCount + 1;
        const nextStreak = current.streak + 1;
        const animalPraise = [
          `The ${selectedAnimal.name.toLowerCase()} thank you!`,
          `You just rescued ${selectedAnimal.singular}!`,
          `${selectedAnimal.name} everywhere are cheering!`,
          selectedAnimal.shout,
        ];
        const allPraise = [...genericPraise, ...animalPraise, ...animalPraise];
        speak(allPraise[Math.floor(Math.random() * allPraise.length)]);
        addBurst();
        setRescuePopup({ emoji: selectedAnimal.emoji, text: `You rescued ${selectedAnimal.singular}!` });
        setTimeout(() => setRescuePopup(null), 1400);
        triggerCelebration(nextStreak);
        return {
          ...current,
          answered: true,
          chosen: choice,
          score: nextScore,
          rescuedCount: nextRescued,
          streak: nextStreak,
          results: nextResults,
          resultKind: "good",
          resultMessage: `🎉 YAY! You got it! You rescued ${selectedAnimal.singular}!`,
        };
      }

      speak(`The word is ${question.word}. Try again next time!`);
      setTimeout(() => setGame((latest) => latest ? { ...latest, shake: false } : latest), 400);
      return {
        ...current,
        answered: true,
        chosen: choice,
        lives: Math.max(0, current.lives - 1),
        streak: 0,
        results: nextResults,
        resultKind: "bad",
        resultMessage: `😊 The word is "${question.word}". Keep going — you've got this!`,
        shake: true,
      };
    });
  }

  function nextWord() {
    setGame((current) => {
      if (!current) return current;
      const nextIndex = current.index + 1;
      if (nextIndex >= current.questions.length) {
        const copy = finishCopy(current.score, current.questions.length);
        for (let i = 0; i < 8; i++) setTimeout(addBurst, i * 220);
        setTimeout(() => addShower(20), 300);
        speakSeq([copy.title, `You rescued ${current.rescuedCount} ${selectedAnimal.name.toLowerCase()}!`]);
        setScreen("finish");
        return current;
      }

      return {
        ...current,
        index: nextIndex,
        answered: false,
        chosen: null,
        cardFlipped: false,
        resultMessage: "",
        resultKind: "",
        flagFlash: false,
        shake: false,
      };
    });
  }

  function toggleCurrentFlag() {
    if (!currentWord || game?.answered) return;
    updateFlagged((next) => {
      if (next.has(currentWord)) next.delete(currentWord);
      else next.add(currentWord);
      return next;
    });
    setGame((current) => current ? { ...current, flagFlash: true } : current);
    setTimeout(() => setGame((current) => current ? { ...current, flagFlash: false } : current), 500);
  }

  function saveCurrentRound() {
    if (!selectedAnimal || !game) return;
    const now = new Date();
    const date = now.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
    const nextRounds = [{
      date,
      animal: `${selectedAnimal.emoji} ${selectedAnimal.name}`,
      score: game.score,
      results: game.results,
    }, ...rounds].slice(0, 20);
    setRounds(nextRounds);
    saveRounds(nextRounds);
    setSavedRound(true);
    setRevisionParentOpen(true);
  }

  function clearSavedRounds() {
    if (!confirm("Clear all saved rounds?")) return;
    setRounds([]);
    localStorage.removeItem(LS_ROUNDS_KEY);
  }

  return (
    <>
      <div className="bg-shapes">
        {bgShapes.map((shape) => (
          <div
            className="shape"
            key={shape.id}
            style={{
              width: `${shape.size}px`,
              height: `${shape.size}px`,
              background: shape.color,
              left: `${shape.left}%`,
              animationDuration: `${shape.duration}s`,
              animationDelay: `${shape.delay}s`,
            }}
          />
        ))}
      </div>
      <div className="burst">
        {bursts.map((burst) => (
          <span
            className="burst-star"
            key={burst.id}
            style={{
              left: `${burst.left}px`,
              top: `${burst.top}px`,
              fontSize: `${burst.size}rem`,
              "--dx": `${burst.dx}px`,
              "--dy": `${burst.dy}px`,
              "--dr": `${burst.rotate}deg`,
              animationDelay: `${burst.delay}s`,
            }}
          >
            {burst.emoji}
          </span>
        ))}
      </div>
      <div className="animal-shower">
        {shower.map((item) => (
          <span
            className="shower-animal"
            key={item.id}
            style={{
              left: `${item.left}%`,
              fontSize: `${item.size}rem`,
              animationDuration: `${item.duration}s`,
              animationDelay: `${item.delay}s`,
            }}
          >
            {item.emoji}
          </span>
        ))}
      </div>
      {wander && (
        <div className="wander-wrap">
          <div className="wander-speech">{wander.shout}</div>
          <div className="wander-animal">{wander.emoji}</div>
        </div>
      )}

      <div className="container">
        <h1>🌟 Sight Words! 🌟</h1>
        {screen === "picker" && (
          <PickerScreen
            selectedAnimal={selectedAnimal}
            flaggedWords={flaggedWords}
            parentOpen={parentOpen}
            onSelectAnimal={setSelectedAnimal}
            onStart={startGame}
            onToggleParent={() => setParentOpen((open) => !open)}
            onRemoveFlag={removeFlag}
          />
        )}
        {screen === "game" && selectedAnimal && game && (
          <GameScreen
            animal={selectedAnimal}
            flaggedWords={flaggedWords}
            game={game}
            gameParentOpen={gameParentOpen}
            onAnswer={answer}
            onNext={nextWord}
            onToggleFlag={toggleCurrentFlag}
            onToggleHint={() => setGame((current) => current ? { ...current, cardFlipped: !current.cardFlipped } : current)}
            onRemoveFlag={removeFlag}
            onToggleParent={() => setGameParentOpen((open) => !open)}
          />
        )}
        {screen === "finish" && selectedAnimal && game && (
          <FinishScreen
            animal={selectedAnimal}
            game={game}
            onReview={() => {
              setSavedRound(false);
              setScreen("revision");
            }}
            onRestart={restartToPicker}
          />
        )}
        {screen === "revision" && selectedAnimal && game && (
          <RevisionScreen
            animal={selectedAnimal}
            game={game}
            flaggedWords={flaggedWords}
            rounds={rounds}
            saved={savedRound}
            parentOpen={revisionParentOpen}
            onSaveRound={saveCurrentRound}
            onRestart={restartToPicker}
            onToggleParent={() => setRevisionParentOpen((open) => !open)}
            onRemoveFlag={removeFlag}
            onClearRounds={clearSavedRounds}
          />
        )}
      </div>

      {rescuePopup && (
        <div className="rescue-overlay" style={{ display: "flex" }}>
          <div className="rescue-popup">
            <div className="rescue-popup-emoji">{rescuePopup.emoji}</div>
            <div className="rescue-popup-text">{rescuePopup.text}</div>
            <div className="rescue-popup-sub">Keep going to save more! 💚</div>
          </div>
        </div>
      )}
    </>
  );
}
