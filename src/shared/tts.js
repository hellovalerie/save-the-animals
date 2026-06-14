const TTS_BASE = "https://fish-audio-399049857363-ap-southeast-1-an.s3.ap-southeast-1.amazonaws.com/tts/";

export function createSpeaker(clips, { lang = "en", rate = lang === "zh" ? 0.8 : 1 } = {}) {
  const player = typeof Audio !== "undefined" ? new Audio() : null;
  let queue = [];

  function playNext() {
    const url = queue.shift();
    if (!url || !player) return;
    player.playbackRate = rate;
    player.src = url;
    player.onended = playNext;
    player.play().catch(() => {});
  }

  function speakSeq(texts) {
    if (player) player.pause();
    if (window.speechSynthesis) window.speechSynthesis.cancel();
    queue = [];
    for (const text of texts) {
      const key = clips[text];
      if (key) {
        queue.push(TTS_BASE + key + ".mp3");
      } else if (window.speechSynthesis) {
        const utt = new SpeechSynthesisUtterance(text);
        utt.rate = rate;
        if (lang === "zh") {
          utt.lang = "zh-CN";
          utt.pitch = 1;
          const trySpeak = () => {
            const voices = window.speechSynthesis.getVoices();
            const zh =
              voices.find((v) => v.lang === "zh-CN") ||
              voices.find((v) => v.lang === "zh_CN") ||
              voices.find((v) => v.lang.startsWith("zh"));
            if (zh) utt.voice = zh;
            if (window.speechSynthesis.paused) window.speechSynthesis.resume();
            setTimeout(() => window.speechSynthesis.speak(utt), 50);
          };
          if (window.speechSynthesis.getVoices().length === 0) {
            window.speechSynthesis.onvoiceschanged = () => {
              trySpeak();
              window.speechSynthesis.onvoiceschanged = null;
            };
          } else {
            trySpeak();
          }
        } else {
          utt.pitch = 1.08;
          utt.volume = 1;
          window.speechSynthesis.speak(utt);
        }
      }
    }
    playNext();
  }

  return {
    speak: (text) => speakSeq([text]),
    speakSeq,
  };
}
