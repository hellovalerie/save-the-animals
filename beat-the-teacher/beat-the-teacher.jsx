import { useState, useRef } from "react";

// ── CHAPTERS ──────────────────────────────────────────────────────────────
const CHAPTERS = [
  { id: "all", label: "⭐ All Chapters",          color: "#facc15", bg: "#1a1400" },
  { id: "ch0", label: "你好 谢谢 水 火",          color: "#60a5fa", bg: "#001428" },
  { id: "ch1", label: "听 猴 告 给 进 电",        color: "#f472b6", bg: "#1a0014" },
  { id: "ch2", label: "用 巴 竹 总 玉 苗 尾 尖",  color: "#34d399", bg: "#001a0e" },
  { id: "ch3", label: "念 饭 乖 想 上下面",       color: "#fb923c", bg: "#1a0a00" },
  { id: "ch4", label: "面 住 前 后",              color: "#a78bfa", bg: "#0e0020" },
  { id: "ch5", label: "从 同 没 送",              color: "#f87171", bg: "#1a0000" },
  { id: "ch6", label: "动 关 找 年 节 果 工",     color: "#4ade80", bg: "#001a00" },
];

// ── WORDS ─────────────────────────────────────────────────────────────────
// ch field maps each word to its chapter
const WORDS = [
  // ── CH0: Basics (pre-image vocabulary) ───────────────────────────────
  { ch:"ch0", chinese: "你好",   pinyin: "nǐ hǎo",       english: "Hello",                         emoji: "👋", radical: "亻", radicalName: "person",     radicalChinese: "人字旁" },
  { ch:"ch0", chinese: "谢谢",   pinyin: "xiè xiè",       english: "Thank you",                     emoji: "🙏", radical: "讠", radicalName: "speech",     radicalChinese: "言字旁" },
  { ch:"ch0", chinese: "猫",     pinyin: "māo",           english: "Cat",                           emoji: "🐱", radical: "犭", radicalName: "animal",     radicalChinese: "反犬旁" },
  { ch:"ch0", chinese: "狗",     pinyin: "gǒu",           english: "Dog",                           emoji: "🐶", radical: "犭", radicalName: "animal",     radicalChinese: "反犬旁" },
  { ch:"ch0", chinese: "水",     pinyin: "shuǐ",          english: "Water",                         emoji: "💧", radical: "水", radicalName: "water",      radicalChinese: "水字底" },
  { ch:"ch0", chinese: "火",     pinyin: "huǒ",           english: "Fire",                          emoji: "🔥", radical: "火", radicalName: "fire",       radicalChinese: "火字旁" },
  { ch:"ch0", chinese: "书",     pinyin: "shū",           english: "Book",                          emoji: "📚" },
  { ch:"ch0", chinese: "吃",     pinyin: "chī",           english: "To eat",                        emoji: "🍜", radical: "口", radicalName: "mouth",      radicalChinese: "口字旁" },
  { ch:"ch0", chinese: "睡觉",   pinyin: "shuì jiào",     english: "To sleep",                      emoji: "😴", radical: "目", radicalName: "eye",        radicalChinese: "目字旁" },
  { ch:"ch0", chinese: "朋友",   pinyin: "péng yǒu",      english: "Friend",                        emoji: "🤝", radical: "月", radicalName: "moon",       radicalChinese: "月字旁" },
  { ch:"ch0", chinese: "老师",   pinyin: "lǎo shī",       english: "Teacher",                       emoji: "👩‍🏫", radical: "耂", radicalName: "old",        radicalChinese: "老字头" },
  { ch:"ch0", chinese: "学生",   pinyin: "xué shēng",     english: "Student",                       emoji: "🎒", radical: "子", radicalName: "child",      radicalChinese: "子字旁" },
  { ch:"ch0", chinese: "钱",     pinyin: "qián",          english: "Money",                         emoji: "💰", radical: "钅", radicalName: "metal",      radicalChinese: "金字旁" },
  { ch:"ch0", chinese: "快乐",   pinyin: "kuài lè",       english: "Happy",                         emoji: "😊", radical: "忄", radicalName: "heart",      radicalChinese: "竖心旁" },
  { ch:"ch0", chinese: "漂亮",   pinyin: "piào liang",    english: "Beautiful",                     emoji: "✨", radical: "氵", radicalName: "water",      radicalChinese: "三点水" },
  { ch:"ch0", chinese: "虫子",   pinyin: "chóng zi",      english: "Bug / Worm",                    emoji: "🐛", radical: "虫", radicalName: "insect",     radicalChinese: "虫字旁" },
  { ch:"ch0", chinese: "扫把",   pinyin: "sào bǎ",        english: "Broom",                         emoji: "🧹", radical: "扌", radicalName: "hand",       radicalChinese: "提手旁" },
  { ch:"ch0", chinese: "手",     pinyin: "shǒu",          english: "Hand",                          emoji: "🖐️", radical: "手", radicalName: "hand",       radicalChinese: "手字底" },
  { ch:"ch0", chinese: "门",     pinyin: "mén",           english: "Door",                          emoji: "🚪", radical: "门", radicalName: "gate",       radicalChinese: "门字框" },
  { ch:"ch0", chinese: "游戏",   pinyin: "yóu xì",        english: "Game",                          emoji: "🎮", radical: "氵", radicalName: "water",      radicalChinese: "三点水" },
  { ch:"ch0", chinese: "驮着",   pinyin: "tuó zhe",       english: "Carrying on back (animal)",     emoji: "🐫", radical: "马", radicalName: "horse",      radicalChinese: "马字旁" },
  { ch:"ch0", chinese: "天鹅",   pinyin: "tiān é",        english: "Swan",                          emoji: "🦢" },
  { ch:"ch0", chinese: "白鹅",   pinyin: "bái é",         english: "White goose",                   emoji: "🪿" },
  { ch:"ch0", chinese: "河水",   pinyin: "hé shuǐ",       english: "River water",                   emoji: "🌊", radical: "氵", radicalName: "water",      radicalChinese: "三点水" },
  { ch:"ch0", chinese: "黄",     pinyin: "huáng",         english: "Yellow",                        emoji: "🟡" },
  { ch:"ch0", chinese: "河马",   pinyin: "hé mǎ",         english: "Hippo",                         emoji: "🦛", radical: "氵", radicalName: "water",      radicalChinese: "三点水" },
  { ch:"ch0", chinese: "背心",   pinyin: "bèi xīn",       english: "Vest / Tank top",               emoji: "👕", radical: "月", radicalName: "flesh/moon", radicalChinese: "月字底" },
  { ch:"ch0", chinese: "背上",   pinyin: "bèi shàng",     english: "On one's back",                 emoji: "🔝", radical: "月", radicalName: "flesh/moon", radicalChinese: "月字底" },
  { ch:"ch0", chinese: "背着",   pinyin: "bēi zhe",       english: "Carrying on back (person)",     emoji: "🎒", radical: "月", radicalName: "flesh/moon", radicalChinese: "月字底" },
  { ch:"ch0", chinese: "拿着",   pinyin: "ná zhe",        english: "Holding in hand",               emoji: "✋", radical: "手", radicalName: "hand",       radicalChinese: "手字底" },
  { ch:"ch0", chinese: "拿来",   pinyin: "ná lái",        english: "Bring here",                    emoji: "👈", radical: "手", radicalName: "hand",       radicalChinese: "手字底" },
  { ch:"ch0", chinese: "拿去",   pinyin: "ná qù",         english: "Take away",                     emoji: "👉", radical: "手", radicalName: "hand",       radicalChinese: "手字底" },
  { ch:"ch0", chinese: "照着",   pinyin: "zhào zhe",      english: "Following / copying",           emoji: "📋", radical: "灬", radicalName: "fire",       radicalChinese: "四点底" },
  { ch:"ch0", chinese: "照看",   pinyin: "zhào kàn",      english: "To look after",                 emoji: "👀", radical: "灬", radicalName: "fire",       radicalChinese: "四点底" },
  { ch:"ch0", chinese: "照明",   pinyin: "zhào míng",     english: "Lighting / illumination",       emoji: "💡", radical: "灬", radicalName: "fire",       radicalChinese: "四点底" },
  { ch:"ch0", chinese: "甜的",   pinyin: "tián de",       english: "Sweet (thing)",                 emoji: "🍬", radical: "甘", radicalName: "sweet",      radicalChinese: "甘字旁" },
  { ch:"ch0", chinese: "甜水",   pinyin: "tián shuǐ",     english: "Sweet water",                   emoji: "🍯", radical: "甘", radicalName: "sweet",      radicalChinese: "甘字旁" },
  { ch:"ch0", chinese: "做梦",   pinyin: "zuò mèng",      english: "To dream",                      emoji: "💭", radical: "亻", radicalName: "person",     radicalChinese: "人字旁" },
  { ch:"ch0", chinese: "梦见",   pinyin: "mèng jiàn",     english: "To dream of something",         emoji: "🌙", radical: "夕", radicalName: "evening",    radicalChinese: "夕字旁" },
  { ch:"ch0", chinese: "梦游",   pinyin: "mèng yóu",      english: "Sleepwalking",                  emoji: "🚶", radical: "夕", radicalName: "evening",    radicalChinese: "夕字旁" },
  { ch:"ch0", chinese: "老人",   pinyin: "lǎo rén",       english: "Elderly person",                emoji: "👴", radical: "耂", radicalName: "old",        radicalChinese: "老字头" },
  { ch:"ch0", chinese: "老家",   pinyin: "lǎo jiā",       english: "Hometown / old home",           emoji: "🏡", radical: "耂", radicalName: "old",        radicalChinese: "老字头" },
  { ch:"ch0", chinese: "盒子",   pinyin: "hé zi",         english: "Box",                           emoji: "📦", radical: "皿", radicalName: "dish",       radicalChinese: "皿字底" },
  { ch:"ch0", chinese: "尺子",   pinyin: "chǐ zi",        english: "Ruler",                         emoji: "📏", radical: "尸", radicalName: "body",       radicalChinese: "尸字头" },
  { ch:"ch0", chinese: "刀子",   pinyin: "dāo zi",        english: "Knife",                         emoji: "🔪", radical: "刀", radicalName: "knife",      radicalChinese: "刀字旁" },
  { ch:"ch0", chinese: "小刀",   pinyin: "xiǎo dāo",      english: "Small knife / penknife",        emoji: "🗡️", radical: "小", radicalName: "small",      radicalChinese: "小字头" },
  { ch:"ch0", chinese: "老人家", pinyin: "lǎo rén jiā",   english: "Respectful term for elderly",   emoji: "🙇", radical: "耂", radicalName: "old",        radicalChinese: "老字头" },
  { ch:"ch0", chinese: "老爷爷", pinyin: "lǎo yé ye",     english: "Old grandpa / elderly man",     emoji: "👴", radical: "耂", radicalName: "old",        radicalChinese: "老字头" },
  { ch:"ch0", chinese: "老奶奶", pinyin: "lǎo nǎi nai",   english: "Old grandma / elderly woman",   emoji: "👵", radical: "耂", radicalName: "old",        radicalChinese: "老字头" },
  { ch:"ch0", chinese: "老公公", pinyin: "lǎo gōng gong", english: "Old man (fairy-tale style)",    emoji: "🧓", radical: "耂", radicalName: "old",        radicalChinese: "老字头" },
  { ch:"ch0", chinese: "老婆婆", pinyin: "lǎo pó po",     english: "Old woman (fairy-tale style)",  emoji: "👵", radical: "耂", radicalName: "old",        radicalChinese: "老字头" },
  { ch:"ch0", chinese: "小时",   pinyin: "xiǎo shí",      english: "Hour",                          emoji: "⏰", radical: "小", radicalName: "small",      radicalChinese: "小字头" },
  { ch:"ch0", chinese: "正在",   pinyin: "zhèng zài",     english: "Currently doing",               emoji: "⚡", radical: "止", radicalName: "stop/foot",  radicalChinese: "止字旁" },
  { ch:"ch0", chinese: "正是",   pinyin: "zhèng shì",     english: "Exactly / precisely",           emoji: "🎯", radical: "止", radicalName: "stop/foot",  radicalChinese: "止字旁" },
  { ch:"ch0", chinese: "正好",   pinyin: "zhèng hǎo",     english: "Just right / perfect timing",   emoji: "👌", radical: "止", radicalName: "stop/foot",  radicalChinese: "止字旁" },
  { ch:"ch0", chinese: "中文",   pinyin: "zhōng wén",     english: "Chinese language",              emoji: "🇨🇳" },
  { ch:"ch0", chinese: "文字",   pinyin: "wén zì",        english: "Written characters / text",     emoji: "✍️", radical: "文", radicalName: "script",     radicalChinese: "文字旁" },
  { ch:"ch0", chinese: "文人",   pinyin: "wén rén",       english: "Scholar / literary person",     emoji: "🖊️", radical: "文", radicalName: "script",     radicalChinese: "文字旁" },
  { ch:"ch0", chinese: "文明",   pinyin: "wén míng",      english: "Civilization / civilized",      emoji: "🏛️", radical: "文", radicalName: "script",     radicalChinese: "文字旁" },
  { ch:"ch0", chinese: "文学",   pinyin: "wén xué",       english: "Literature",                    emoji: "📖", radical: "文", radicalName: "script",     radicalChinese: "文字旁" },
  { ch:"ch0", chinese: "文具",   pinyin: "wén jù",        english: "Stationery",                    emoji: "✏️", radical: "文", radicalName: "script",     radicalChinese: "文字旁" },
  { ch:"ch0", chinese: "文具盒", pinyin: "wén jù hé",     english: "Pencil case",                   emoji: "🖊️", radical: "文", radicalName: "script",     radicalChinese: "文字旁" },
  { ch:"ch0", chinese: "玩具",   pinyin: "wán jù",        english: "Toy",                           emoji: "🧸", radical: "王", radicalName: "king/jade",  radicalChinese: "王字旁" },
  { ch:"ch0", chinese: "家具",   pinyin: "jiā jù",        english: "Furniture",                     emoji: "🪑", radical: "宀", radicalName: "roof",       radicalChinese: "宝盖头" },
  { ch:"ch0", chinese: "画画",   pinyin: "huà huà",       english: "To draw / paint",               emoji: "🎨", radical: "田", radicalName: "field",      radicalChinese: "田字底" },
  { ch:"ch0", chinese: "画家",   pinyin: "huà jiā",       english: "Painter / artist",              emoji: "🖼️", radical: "田", radicalName: "field",      radicalChinese: "田字底" },
  { ch:"ch0", chinese: "画笔",   pinyin: "huà bǐ",        english: "Paintbrush",                    emoji: "🖌️", radical: "田", radicalName: "field",      radicalChinese: "田字底" },
  { ch:"ch0", chinese: "笔头",   pinyin: "bǐ tóu",        english: "Pen tip / nib",                 emoji: "✒️", radical: "竹", radicalName: "bamboo",     radicalChinese: "竹字头" },
  { ch:"ch0", chinese: "长大",   pinyin: "zhǎng dà",      english: "To grow up",                    emoji: "📈", radical: "长", radicalName: "long/grow",  radicalChinese: "长字旁" },
  { ch:"ch0", chinese: "长高",   pinyin: "zhǎng gāo",     english: "To grow taller",                emoji: "📏", radical: "长", radicalName: "long/grow",  radicalChinese: "长字旁" },
  { ch:"ch0", chinese: "生长",   pinyin: "shēng zhǎng",   english: "To grow (living things)",       emoji: "🌱", radical: "生", radicalName: "life/birth", radicalChinese: "生字旁" },
  { ch:"ch0", chinese: "成长",   pinyin: "chéng zhǎng",   english: "To mature / grow as a person",  emoji: "🌳", radical: "戈", radicalName: "spear",      radicalChinese: "戈字旁" },
  { ch:"ch0", chinese: "放着",   pinyin: "fàng zhe",      english: "Left there / placed there",     emoji: "📍", radical: "攵", radicalName: "strike",     radicalChinese: "反文旁" },
  { ch:"ch0", chinese: "放开",   pinyin: "fàng kāi",      english: "Let go / release",              emoji: "🔓", radical: "攵", radicalName: "strike",     radicalChinese: "反文旁" },
  { ch:"ch0", chinese: "放大",   pinyin: "fàng dà",       english: "To enlarge / zoom in",          emoji: "🔍", radical: "攵", radicalName: "strike",     radicalChinese: "反文旁" },
  { ch:"ch0", chinese: "放火",   pinyin: "fàng huǒ",      english: "To set fire / arson",           emoji: "🔥", radical: "攵", radicalName: "strike",     radicalChinese: "反文旁" },
  { ch:"ch0", chinese: "放心",   pinyin: "fàng xīn",      english: "Don't worry / relax",           emoji: "😌", radical: "攵", radicalName: "strike",     radicalChinese: "反文旁" },
  { ch:"ch0", chinese: "放学",   pinyin: "fàng xué",      english: "End of school day",             emoji: "🏫", radical: "攵", radicalName: "strike",     radicalChinese: "反文旁" },
  { ch:"ch0", chinese: "放牛",   pinyin: "fàng niú",      english: "To graze cattle",               emoji: "🐄", radical: "攵", radicalName: "strike",     radicalChinese: "反文旁" },
  { ch:"ch0", chinese: "放羊",   pinyin: "fàng yáng",     english: "To graze sheep",                emoji: "🐑", radical: "攵", radicalName: "strike",     radicalChinese: "反文旁" },
  { ch:"ch0", chinese: "放马",   pinyin: "fàng mǎ",       english: "To let horses graze",           emoji: "🐴", radical: "攵", radicalName: "strike",     radicalChinese: "反文旁" },
  { ch:"ch0", chinese: "放手",   pinyin: "fàng shǒu",     english: "Let go / give up control",      emoji: "🤲", radical: "攵", radicalName: "strike",     radicalChinese: "反文旁" },

  // ── CH1: Image 1 — 听 话 猴 猩 给 进 告 电 ────────────────────────────
  { ch:"ch1", chinese: "听见",   pinyin: "tīng jiàn",     english: "To hear",                       emoji: "👂", radical: "口", radicalName: "mouth",      radicalChinese: "口字旁" },
  { ch:"ch1", chinese: "听说",   pinyin: "tīng shuō",     english: "I heard that / apparently",     emoji: "💬", radical: "口", radicalName: "mouth",      radicalChinese: "口字旁" },
  { ch:"ch1", chinese: "听话",   pinyin: "tīng huà",      english: "Obedient / to listen",          emoji: "🙆", radical: "口", radicalName: "mouth",      radicalChinese: "口字旁" },
  { ch:"ch1", chinese: "好听",   pinyin: "hǎo tīng",      english: "Nice-sounding / pleasant",      emoji: "🎵", radical: "女", radicalName: "woman",      radicalChinese: "女字旁" },
  { ch:"ch1", chinese: "说话",   pinyin: "shuō huà",      english: "To speak / to talk",            emoji: "🗣️", radical: "讠", radicalName: "speech",     radicalChinese: "言字旁" },
  { ch:"ch1", chinese: "猴子",   pinyin: "hóu zi",        english: "Monkey",                        emoji: "🐒", radical: "犭", radicalName: "animal",     radicalChinese: "反犬旁" },
  { ch:"ch1", chinese: "猩猩",   pinyin: "xīng xing",     english: "Orangutan / chimpanzee",        emoji: "🦧", radical: "犭", radicalName: "animal",     radicalChinese: "反犬旁" },
  { ch:"ch1", chinese: "给你",   pinyin: "gěi nǐ",        english: "For you / here you go",         emoji: "🎁", radical: "纟", radicalName: "silk/thread", radicalChinese: "绞丝旁" },
  { ch:"ch1", chinese: "给我",   pinyin: "gěi wǒ",        english: "Give me / for me",              emoji: "🙋", radical: "纟", radicalName: "silk/thread", radicalChinese: "绞丝旁" },
  { ch:"ch1", chinese: "给他",   pinyin: "gěi tā",        english: "Give him / for him",            emoji: "👦", radical: "纟", radicalName: "silk/thread", radicalChinese: "绞丝旁" },
  { ch:"ch1", chinese: "不给",   pinyin: "bù gěi",        english: "Won't give / not giving",       emoji: "🙅", radical: "纟", radicalName: "silk/thread", radicalChinese: "绞丝旁" },
  { ch:"ch1", chinese: "进来",   pinyin: "jìn lái",       english: "Come in",                       emoji: "🚪", radical: "辶", radicalName: "walk/movement", radicalChinese: "走之旁" },
  { ch:"ch1", chinese: "进去",   pinyin: "jìn qù",        english: "Go in / enter",                 emoji: "➡️", radical: "辶", radicalName: "walk/movement", radicalChinese: "走之旁" },
  { ch:"ch1", chinese: "进出",   pinyin: "jìn chū",       english: "In and out / entry and exit",   emoji: "🔄", radical: "辶", radicalName: "walk/movement", radicalChinese: "走之旁" },
  { ch:"ch1", chinese: "进门",   pinyin: "jìn mén",       english: "Enter the door / come in",      emoji: "🚪", radical: "辶", radicalName: "walk/movement", radicalChinese: "走之旁" },
  { ch:"ch1", chinese: "进口",   pinyin: "jìn kǒu",       english: "Import / entrance",             emoji: "📦", radical: "辶", radicalName: "walk/movement", radicalChinese: "走之旁" },
  { ch:"ch1", chinese: "电话",   pinyin: "diàn huà",      english: "Telephone / phone call",        emoji: "📞", radical: "电", radicalName: "electricity", radicalChinese: "电字旁" },
  { ch:"ch1", chinese: "告诉",   pinyin: "gào sù",        english: "To tell / to inform",           emoji: "📢", radical: "口", radicalName: "mouth",      radicalChinese: "口字旁" },

  // ── CH2: Image 2 — 用 巴 竹 总 玉 苗 尾 尖 ───────────────────────────
  { ch:"ch2", chinese: "有用",   pinyin: "yǒu yòng",      english: "Useful",                        emoji: "✅", radical: "用", radicalName: "use",        radicalChinese: "用字旁" },
  { ch:"ch2", chinese: "不用",   pinyin: "bù yòng",       english: "No need / don't use",           emoji: "🚫", radical: "用", radicalName: "use",        radicalChinese: "用字旁" },
  { ch:"ch2", chinese: "用来",   pinyin: "yòng lái",      english: "Used for / in order to",        emoji: "🔧", radical: "用", radicalName: "use",        radicalChinese: "用字旁" },
  { ch:"ch2", chinese: "用心",   pinyin: "yòng xīn",      english: "Wholeheartedly / with care",    emoji: "💗", radical: "用", radicalName: "use",        radicalChinese: "用字旁" },
  { ch:"ch2", chinese: "用做",   pinyin: "yòng zuò",      english: "Used as / to use as",           emoji: "🛠️", radical: "用", radicalName: "use",        radicalChinese: "用字旁" },
  { ch:"ch2", chinese: "总是",   pinyin: "zǒng shì",      english: "Always",                        emoji: "♾️", radical: "心", radicalName: "heart",      radicalChinese: "心字底" },
  { ch:"ch2", chinese: "尾巴",   pinyin: "wěi ba",        english: "Tail",                          emoji: "🐾", radical: "尸", radicalName: "body",       radicalChinese: "尸字头" },
  { ch:"ch2", chinese: "巴不得", pinyin: "bā bù dé",      english: "Wish desperately / can't wait", emoji: "🙏", radical: "己", radicalName: "self",       radicalChinese: "己字旁" },
  { ch:"ch2", chinese: "哈巴狗", pinyin: "hǎ ba gǒu",     english: "Pug / lapdog",                  emoji: "🐶", radical: "口", radicalName: "mouth",      radicalChinese: "口字旁" },
  { ch:"ch2", chinese: "玉米",   pinyin: "yù mǐ",         english: "Corn / maize",                  emoji: "🌽", radical: "王", radicalName: "king/jade",  radicalChinese: "王字旁" },
  { ch:"ch2", chinese: "玉石",   pinyin: "yù shí",        english: "Jade / precious stone",         emoji: "💎", radical: "王", radicalName: "king/jade",  radicalChinese: "王字旁" },
  { ch:"ch2", chinese: "玉兔",   pinyin: "yù tù",         english: "Jade rabbit (moon rabbit)",     emoji: "🐇", radical: "王", radicalName: "king/jade",  radicalChinese: "王字旁" },
  { ch:"ch2", chinese: "宝玉",   pinyin: "bǎo yù",        english: "Precious jade",                 emoji: "✨", radical: "宀", radicalName: "roof",       radicalChinese: "宝盖头" },
  { ch:"ch2", chinese: "尖的",   pinyin: "jiān de",       english: "Sharp / pointed (thing)",       emoji: "📌", radical: "小", radicalName: "small",      radicalChinese: "小字头" },
  { ch:"ch2", chinese: "尖刀",   pinyin: "jiān dāo",      english: "Sharp knife / dagger",          emoji: "🗡️", radical: "小", radicalName: "small",      radicalChinese: "小字头" },
  { ch:"ch2", chinese: "刀尖",   pinyin: "dāo jiān",      english: "Tip of a knife / knife point",  emoji: "🔪", radical: "刀", radicalName: "knife",      radicalChinese: "刀字旁" },
  { ch:"ch2", chinese: "笔尖",   pinyin: "bǐ jiān",       english: "Pen tip / nib",                 emoji: "✒️", radical: "竹", radicalName: "bamboo",     radicalChinese: "竹字头" },
  { ch:"ch2", chinese: "尖子",   pinyin: "jiān zi",       english: "Top student / elite",           emoji: "🏆", radical: "小", radicalName: "small",      radicalChinese: "小字头" },
  { ch:"ch2", chinese: "竹子",   pinyin: "zhú zi",        english: "Bamboo",                        emoji: "🎍", radical: "竹", radicalName: "bamboo",     radicalChinese: "竹字头" },
  { ch:"ch2", chinese: "竹马",   pinyin: "zhú mǎ",        english: "Hobby horse / childhood friend",emoji: "🐴", radical: "竹", radicalName: "bamboo",     radicalChinese: "竹字头" },
  { ch:"ch2", chinese: "竹叶",   pinyin: "zhú yè",        english: "Bamboo leaf",                   emoji: "🌿", radical: "竹", radicalName: "bamboo",     radicalChinese: "竹字头" },
  { ch:"ch2", chinese: "小苗",   pinyin: "xiǎo miáo",     english: "Seedling / sprout",             emoji: "🌱", radical: "艹", radicalName: "grass/plant", radicalChinese: "草字头" },
  { ch:"ch2", chinese: "竹苗",   pinyin: "zhú miáo",      english: "Bamboo seedling",               emoji: "🎋", radical: "竹", radicalName: "bamboo",     radicalChinese: "竹字头" },
  { ch:"ch2", chinese: "苗儿",   pinyin: "miáo r",        english: "Little sprout (affectionate)",  emoji: "🌿", radical: "艹", radicalName: "grass/plant", radicalChinese: "草字头" },
  { ch:"ch2", chinese: "青苗",   pinyin: "qīng miáo",     english: "Green seedling / young crop",   emoji: "🌾", radical: "艹", radicalName: "grass/plant", radicalChinese: "草字头" },
  { ch:"ch2", chinese: "绿苗",   pinyin: "lǜ miáo",       english: "Green sprout",                  emoji: "🌱", radical: "纟", radicalName: "silk/thread", radicalChinese: "绞丝旁" },
  { ch:"ch2", chinese: "苗子",   pinyin: "miáo zi",       english: "Seedling / promising person",   emoji: "🌿", radical: "艹", radicalName: "grass/plant", radicalChinese: "草字头" },

  // ── CH3: Image 3 — 念 饭 乖 想 上下面 ───────────────────────────────
  { ch:"ch3", chinese: "告诉",   pinyin: "gào sù",        english: "To tell / to inform",           emoji: "📢", radical: "口", radicalName: "mouth",      radicalChinese: "口字旁" },
  { ch:"ch3", chinese: "念书",   pinyin: "niàn shū",      english: "To study / read aloud",         emoji: "📖", radical: "心", radicalName: "heart",      radicalChinese: "心字底" },
  { ch:"ch3", chinese: "念头",   pinyin: "niàn tou",      english: "Thought / idea",                emoji: "💭", radical: "心", radicalName: "heart",      radicalChinese: "心字底" },
  { ch:"ch3", chinese: "想念",   pinyin: "xiǎng niàn",    english: "To miss (someone)",             emoji: "🥺", radical: "心", radicalName: "heart",      radicalChinese: "心字底" },
  { ch:"ch3", chinese: "吃饭",   pinyin: "chī fàn",       english: "To eat (a meal)",               emoji: "🍚", radical: "口", radicalName: "mouth",      radicalChinese: "口字旁" },
  { ch:"ch3", chinese: "早饭",   pinyin: "zǎo fàn",       english: "Breakfast",                     emoji: "🌅", radical: "日", radicalName: "sun",        radicalChinese: "日字旁" },
  { ch:"ch3", chinese: "中饭",   pinyin: "zhōng fàn",     english: "Lunch",                         emoji: "🍱", radical: "饣", radicalName: "food",       radicalChinese: "食字旁" },
  { ch:"ch3", chinese: "米饭",   pinyin: "mǐ fàn",        english: "Cooked rice",                   emoji: "🍚", radical: "米", radicalName: "rice",       radicalChinese: "米字旁" },
  { ch:"ch3", chinese: "饭盒",   pinyin: "fàn hé",        english: "Lunchbox",                      emoji: "🍱", radical: "饣", radicalName: "food",       radicalChinese: "食字旁" },
  { ch:"ch3", chinese: "乖乖",   pinyin: "guāi guāi",     english: "Well-behaved / good boy/girl",  emoji: "😇", radical: "乖", radicalName: "obedient",   radicalChinese: "乖字旁" },
  { ch:"ch3", chinese: "乖孩子", pinyin: "guāi hái zi",   english: "Good / obedient child",         emoji: "👧", radical: "乖", radicalName: "obedient",   radicalChinese: "乖字旁" },
  { ch:"ch3", chinese: "乖宝贝", pinyin: "guāi bǎo bèi",  english: "Good little darling",           emoji: "🥰", radical: "乖", radicalName: "obedient",   radicalChinese: "乖字旁" },
  { ch:"ch3", chinese: "乖巧",   pinyin: "guāi qiǎo",     english: "Clever and well-behaved",       emoji: "✨", radical: "乖", radicalName: "obedient",   radicalChinese: "乖字旁" },
  { ch:"ch3", chinese: "想你",   pinyin: "xiǎng nǐ",      english: "I miss you",                    emoji: "💌", radical: "心", radicalName: "heart",      radicalChinese: "心字底" },
  { ch:"ch3", chinese: "想不到", pinyin: "xiǎng bù dào",  english: "Unexpected / didn't expect",    emoji: "😲", radical: "心", radicalName: "heart",      radicalChinese: "心字底" },
  { ch:"ch3", chinese: "想得到", pinyin: "xiǎng dé dào",  english: "To think of / can imagine",     emoji: "🤔", radical: "心", radicalName: "heart",      radicalChinese: "心字底" },
  { ch:"ch3", chinese: "上面",   pinyin: "shàng miàn",    english: "Above / on top",                emoji: "⬆️" },
  { ch:"ch3", chinese: "下面",   pinyin: "xià miàn",      english: "Below / underneath",            emoji: "⬇️" },

  // ── CH4: Image 4 — 面(方向) 住 前 后 ────────────────────────────────
  { ch:"ch4", chinese: "正面",   pinyin: "zhèng miàn",    english: "Front side / positive side",    emoji: "🔲", radical: "止", radicalName: "stop/foot",  radicalChinese: "止字旁" },
  { ch:"ch4", chinese: "对面",   pinyin: "duì miàn",      english: "Opposite / across from",        emoji: "↔️", radical: "又", radicalName: "again/hand", radicalChinese: "又字旁" },
  { ch:"ch4", chinese: "前面",   pinyin: "qián miàn",     english: "In front / ahead",              emoji: "⬆️", radical: "刖", radicalName: "front",      radicalChinese: "前字旁" },
  { ch:"ch4", chinese: "后面",   pinyin: "hòu miàn",      english: "Behind / at the back",          emoji: "🔙", radical: "彳", radicalName: "step",       radicalChinese: "双人旁" },
  { ch:"ch4", chinese: "面具",   pinyin: "miàn jù",       english: "Mask",                          emoji: "🎭", radical: "面", radicalName: "face/surface", radicalChinese: "面字旁" },
  { ch:"ch4", chinese: "住房",   pinyin: "zhù fáng",      english: "Housing / residence",           emoji: "🏠", radical: "亻", radicalName: "person",     radicalChinese: "人字旁" },
  { ch:"ch4", chinese: "站住",   pinyin: "zhàn zhù",      english: "Stop! / Stand still",           emoji: "🛑", radical: "立", radicalName: "stand",      radicalChinese: "立字旁" },
  { ch:"ch4", chinese: "住家",   pinyin: "zhù jiā",       english: "To live at home / residence",   emoji: "🏡", radical: "亻", radicalName: "person",     radicalChinese: "人字旁" },
  { ch:"ch4", chinese: "住口",   pinyin: "zhù kǒu",       english: "Shut up! / Stop talking",       emoji: "🤐", radical: "亻", radicalName: "person",     radicalChinese: "人字旁" },
  { ch:"ch4", chinese: "住手",   pinyin: "zhù shǒu",      english: "Stop it! / Hands off!",         emoji: "✋", radical: "亻", radicalName: "person",     radicalChinese: "人字旁" },
  { ch:"ch4", chinese: "前后",   pinyin: "qián hòu",      english: "Front and back / before and after", emoji: "↕️", radical: "刖", radicalName: "front", radicalChinese: "前字旁" },
  { ch:"ch4", chinese: "前边",   pinyin: "qián biān",     english: "The front / in front",          emoji: "⬆️", radical: "刖", radicalName: "front",      radicalChinese: "前字旁" },
  { ch:"ch4", chinese: "后边",   pinyin: "hòu biān",      english: "The back / behind",             emoji: "🔙", radical: "彳", radicalName: "step",       radicalChinese: "双人旁" },
  { ch:"ch4", chinese: "面前",   pinyin: "miàn qián",     english: "In front of / before (someone)",emoji: "👀", radical: "面", radicalName: "face/surface", radicalChinese: "面字旁" },
  { ch:"ch4", chinese: "前天",   pinyin: "qián tiān",     english: "The day before yesterday",      emoji: "📅", radical: "刖", radicalName: "front",      radicalChinese: "前字旁" },
  { ch:"ch4", chinese: "前方",   pinyin: "qián fāng",     english: "Ahead / the front",             emoji: "🧭", radical: "刖", radicalName: "front",      radicalChinese: "前字旁" },
  { ch:"ch4", chinese: "前头",   pinyin: "qián tóu",      english: "Up ahead / the front part",     emoji: "⬆️", radical: "刖", radicalName: "front",      radicalChinese: "前字旁" },
  { ch:"ch4", chinese: "眼前",   pinyin: "yǎn qián",      english: "Right before one's eyes",       emoji: "👁️", radical: "目", radicalName: "eye",        radicalChinese: "目字旁" },

  // ── CH5: Image 5 — 从 同 没 送 ──────────────────────────────────────
  { ch:"ch5", chinese: "从来",   pinyin: "cóng lái",      english: "Ever / always (negative: never)",emoji: "♾️", radical: "人", radicalName: "person",    radicalChinese: "人字底" },
  { ch:"ch5", chinese: "从前",   pinyin: "cóng qián",     english: "Once upon a time / formerly",   emoji: "📜", radical: "人", radicalName: "person",     radicalChinese: "人字底" },
  { ch:"ch5", chinese: "从头",   pinyin: "cóng tóu",      english: "From the beginning / again",    emoji: "🔄", radical: "人", radicalName: "person",     radicalChinese: "人字底" },
  { ch:"ch5", chinese: "从小",   pinyin: "cóng xiǎo",     english: "Since childhood / from young",  emoji: "👶", radical: "人", radicalName: "person",     radicalChinese: "人字底" },
  { ch:"ch5", chinese: "一同",   pinyin: "yī tóng",       english: "Together / at the same time",   emoji: "🤝", radical: "口", radicalName: "mouth",      radicalChinese: "口字旁" },
  { ch:"ch5", chinese: "同学",   pinyin: "tóng xué",      english: "Classmate",                     emoji: "🧑‍🤝‍🧑", radical: "口", radicalName: "mouth",  radicalChinese: "口字旁" },
  { ch:"ch5", chinese: "同班",   pinyin: "tóng bān",      english: "Same class",                    emoji: "🏫", radical: "口", radicalName: "mouth",      radicalChinese: "口字旁" },
  { ch:"ch5", chinese: "同上",   pinyin: "tóng shàng",    english: "Same as above / ditto",         emoji: "☝️", radical: "口", radicalName: "mouth",      radicalChinese: "口字旁" },
  { ch:"ch5", chinese: "同时",   pinyin: "tóng shí",      english: "At the same time",              emoji: "⏱️", radical: "口", radicalName: "mouth",      radicalChinese: "口字旁" },
  { ch:"ch5", chinese: "没有",   pinyin: "méi yǒu",       english: "Don't have / there isn't",      emoji: "❌", radical: "氵", radicalName: "water",      radicalChinese: "三点水" },
  { ch:"ch5", chinese: "没来",   pinyin: "méi lái",       english: "Didn't come",                   emoji: "🚫", radical: "氵", radicalName: "water",      radicalChinese: "三点水" },
  { ch:"ch5", chinese: "没了",   pinyin: "méi le",        english: "Gone / all used up",            emoji: "😢", radical: "氵", radicalName: "water",      radicalChinese: "三点水" },
  { ch:"ch5", chinese: "没用",   pinyin: "méi yòng",      english: "Useless / no use",              emoji: "🗑️", radical: "氵", radicalName: "water",      radicalChinese: "三点水" },
  { ch:"ch5", chinese: "没去",   pinyin: "méi qù",        english: "Didn't go",                     emoji: "🚶", radical: "氵", radicalName: "water",      radicalChinese: "三点水" },
  { ch:"ch5", chinese: "送给",   pinyin: "sòng gěi",      english: "To give as a gift",             emoji: "🎁", radical: "辶", radicalName: "walk/movement", radicalChinese: "走之旁" },
  { ch:"ch5", chinese: "送去",   pinyin: "sòng qù",       english: "To send / take away",           emoji: "📤", radical: "辶", radicalName: "walk/movement", radicalChinese: "走之旁" },
  { ch:"ch5", chinese: "送来",   pinyin: "sòng lái",      english: "To bring / deliver here",       emoji: "📥", radical: "辶", radicalName: "walk/movement", radicalChinese: "走之旁" },
  { ch:"ch5", chinese: "送东西", pinyin: "sòng dōng xi",  english: "To give things as gifts",       emoji: "🎀", radical: "辶", radicalName: "walk/movement", radicalChinese: "走之旁" },

  // ── CH6: Images 6+7 — 动 关 找 按 年 节 桃 荷 果 工 厂 产 ─────────
  // 动
  { ch:"ch6", chinese: "动物",   pinyin: "dòng wù",       english: "Animal",                        emoji: "🐾", radical: "力", radicalName: "strength",   radicalChinese: "力字旁" },
  { ch:"ch6", chinese: "动手",   pinyin: "dòng shǒu",     english: "To start working / to hit",     emoji: "✋", radical: "力", radicalName: "strength",   radicalChinese: "力字旁" },
  { ch:"ch6", chinese: "动人",   pinyin: "dòng rén",      english: "Moving / touching",             emoji: "🥹", radical: "力", radicalName: "strength",   radicalChinese: "力字旁" },
  { ch:"ch6", chinese: "动作",   pinyin: "dòng zuò",      english: "Action / movement",             emoji: "🎬", radical: "力", radicalName: "strength",   radicalChinese: "力字旁" },
  // 关
  { ch:"ch6", chinese: "关门",   pinyin: "guān mén",      english: "To close the door",             emoji: "🚪", radical: "八", radicalName: "eight",      radicalChinese: "八字头" },
  { ch:"ch6", chinese: "关心",   pinyin: "guān xīn",      english: "To care about / concern",       emoji: "❤️", radical: "八", radicalName: "eight",      radicalChinese: "八字头" },
  { ch:"ch6", chinese: "关上",   pinyin: "guān shàng",    english: "To close / shut",               emoji: "🔒", radical: "八", radicalName: "eight",      radicalChinese: "八字头" },
  { ch:"ch6", chinese: "关系",   pinyin: "guān xi",       english: "Relationship / connection",     emoji: "🔗", radical: "八", radicalName: "eight",      radicalChinese: "八字头" },
  // 找
  { ch:"ch6", chinese: "找到",   pinyin: "zhǎo dào",      english: "To find / found",               emoji: "🔍", radical: "扌", radicalName: "hand",       radicalChinese: "提手旁" },
  { ch:"ch6", chinese: "找人",   pinyin: "zhǎo rén",      english: "To look for someone",           emoji: "👤", radical: "扌", radicalName: "hand",       radicalChinese: "提手旁" },
  { ch:"ch6", chinese: "找来",   pinyin: "zhǎo lái",      english: "To fetch / bring by finding",   emoji: "👈", radical: "扌", radicalName: "hand",       radicalChinese: "提手旁" },
  // 按
  { ch:"ch6", chinese: "按时",   pinyin: "àn shí",        english: "On time / punctually",          emoji: "⏰", radical: "扌", radicalName: "hand",       radicalChinese: "提手旁" },
  { ch:"ch6", chinese: "按照",   pinyin: "àn zhào",       english: "According to / following",      emoji: "📋", radical: "扌", radicalName: "hand",       radicalChinese: "提手旁" },
  // 年
  { ch:"ch6", chinese: "年年",   pinyin: "nián nián",     english: "Every year / year after year",  emoji: "📅", radical: "干", radicalName: "dry/stem",   radicalChinese: "干字旁" },
  { ch:"ch6", chinese: "年头",   pinyin: "nián tóu",      english: "Beginning of the year / years", emoji: "🗓️", radical: "干", radicalName: "dry/stem",   radicalChinese: "干字旁" },
  { ch:"ch6", chinese: "去年",   pinyin: "qù nián",       english: "Last year",                     emoji: "⬅️", radical: "干", radicalName: "dry/stem",   radicalChinese: "干字旁" },
  { ch:"ch6", chinese: "今年",   pinyin: "jīn nián",      english: "This year",                     emoji: "📌", radical: "干", radicalName: "dry/stem",   radicalChinese: "干字旁" },
  // 节
  { ch:"ch6", chinese: "节日",   pinyin: "jié rì",        english: "Holiday / festival",            emoji: "🎉", radical: "艹", radicalName: "grass/plant", radicalChinese: "草字头" },
  { ch:"ch6", chinese: "过节",   pinyin: "guò jié",       english: "To celebrate a festival",       emoji: "🎊", radical: "辶", radicalName: "walk/movement", radicalChinese: "走之旁" },
  // 桃
  { ch:"ch6", chinese: "桃子",   pinyin: "táo zi",        english: "Peach",                         emoji: "🍑", radical: "木", radicalName: "wood",       radicalChinese: "木字旁" },
  { ch:"ch6", chinese: "桃花",   pinyin: "táo huā",       english: "Peach blossom",                 emoji: "🌸", radical: "木", radicalName: "wood",       radicalChinese: "木字旁" },
  // 荷
  { ch:"ch6", chinese: "荷花",   pinyin: "hé huā",        english: "Lotus flower",                  emoji: "🪷", radical: "艹", radicalName: "grass/plant", radicalChinese: "草字头" },
  { ch:"ch6", chinese: "荷叶",   pinyin: "hé yè",         english: "Lotus leaf",                    emoji: "🍃", radical: "艹", radicalName: "grass/plant", radicalChinese: "草字头" },
  // 果
  { ch:"ch6", chinese: "果子",   pinyin: "guǒ zi",        english: "Fruit",                         emoji: "🍎", radical: "木", radicalName: "wood",       radicalChinese: "木字旁" },
  { ch:"ch6", chinese: "水果",   pinyin: "shuǐ guǒ",      english: "Fruit (collective)",            emoji: "🍇", radical: "木", radicalName: "wood",       radicalChinese: "木字旁" },
  { ch:"ch6", chinese: "果然",   pinyin: "guǒ rán",       english: "Sure enough / as expected",     emoji: "✅", radical: "木", radicalName: "wood",       radicalChinese: "木字旁" },
  // 工
  { ch:"ch6", chinese: "工人",   pinyin: "gōng rén",      english: "Worker / laborer",              emoji: "👷", radical: "工", radicalName: "work",       radicalChinese: "工字旁" },
  { ch:"ch6", chinese: "工作",   pinyin: "gōng zuò",      english: "Work / job",                    emoji: "💼", radical: "工", radicalName: "work",       radicalChinese: "工字旁" },
  // 厂
  { ch:"ch6", chinese: "工厂",   pinyin: "gōng chǎng",    english: "Factory",                       emoji: "🏭", radical: "厂", radicalName: "cliff/factory", radicalChinese: "厂字头" },
  // 产
  { ch:"ch6", chinese: "产品",   pinyin: "chǎn pǐn",      english: "Product",                       emoji: "📦", radical: "亠", radicalName: "lid",        radicalChinese: "亠字头" },
  { ch:"ch6", chinese: "生产",   pinyin: "shēng chǎn",    english: "To produce / production",       emoji: "🏭", radical: "亠", radicalName: "lid",        radicalChinese: "亠字头" },
];

// ── HELPER: get words for a given chapter selection ───────────────────────
function getWordsForChapter(chapterId) {
  if (chapterId === "all") return WORDS;
  return WORDS.filter(w => w.ch === chapterId);
}

// Nightmare mode: plausible second characters drawn from all second characters in the list
function getAllSecondChars(words) {
  const set = new Set();
  for (const w of words) {
    if (w.chinese.length >= 2) set.add(w.chinese[1]);
  }
  return [...set];
}

const ALL_RADICALS = [
  { radical: "亻", radicalName: "person",        radicalChinese: "人字旁" },
  { radical: "讠", radicalName: "speech",        radicalChinese: "言字旁" },
  { radical: "犭", radicalName: "animal",        radicalChinese: "反犬旁" },
  { radical: "水", radicalName: "water",         radicalChinese: "水字底" },
  { radical: "火", radicalName: "fire",          radicalChinese: "火字旁" },
  { radical: "口", radicalName: "mouth",         radicalChinese: "口字旁" },
  { radical: "目", radicalName: "eye",           radicalChinese: "目字旁" },
  { radical: "月", radicalName: "moon/flesh",    radicalChinese: "月字旁" },
  { radical: "耂", radicalName: "old",           radicalChinese: "老字头" },
  { radical: "子", radicalName: "child",         radicalChinese: "子字旁" },
  { radical: "钅", radicalName: "metal",         radicalChinese: "金字旁" },
  { radical: "忄", radicalName: "heart",         radicalChinese: "竖心旁" },
  { radical: "氵", radicalName: "water",         radicalChinese: "三点水" },
  { radical: "虫", radicalName: "insect",        radicalChinese: "虫字旁" },
  { radical: "扌", radicalName: "hand",          radicalChinese: "提手旁" },
  { radical: "手", radicalName: "hand",          radicalChinese: "手字底" },
  { radical: "门", radicalName: "gate",          radicalChinese: "门字框" },
  { radical: "马", radicalName: "horse",         radicalChinese: "马字旁" },
  { radical: "甘", radicalName: "sweet",         radicalChinese: "甘字旁" },
  { radical: "夕", radicalName: "evening",       radicalChinese: "夕字旁" },
  { radical: "皿", radicalName: "dish",          radicalChinese: "皿字底" },
  { radical: "尸", radicalName: "body",          radicalChinese: "尸字头" },
  { radical: "刀", radicalName: "knife",         radicalChinese: "刀字旁" },
  { radical: "小", radicalName: "small",         radicalChinese: "小字头" },
  { radical: "止", radicalName: "stop/foot",     radicalChinese: "止字旁" },
  { radical: "文", radicalName: "script",        radicalChinese: "文字旁" },
  { radical: "王", radicalName: "king/jade",     radicalChinese: "王字旁" },
  { radical: "宀", radicalName: "roof",          radicalChinese: "宝盖头" },
  { radical: "田", radicalName: "field",         radicalChinese: "田字底" },
  { radical: "竹", radicalName: "bamboo",        radicalChinese: "竹字头" },
  { radical: "长", radicalName: "long/grow",     radicalChinese: "长字旁" },
  { radical: "生", radicalName: "life/birth",    radicalChinese: "生字旁" },
  { radical: "戈", radicalName: "spear",         radicalChinese: "戈字旁" },
  { radical: "攵", radicalName: "strike",        radicalChinese: "反文旁" },
  { radical: "木", radicalName: "wood",          radicalChinese: "木字旁" },
  { radical: "土", radicalName: "earth",         radicalChinese: "土字旁" },
  { radical: "山", radicalName: "mountain",      radicalChinese: "山字旁" },
  { radical: "女", radicalName: "woman",         radicalChinese: "女字旁" },
  { radical: "日", radicalName: "sun",           radicalChinese: "日字旁" },
  { radical: "心", radicalName: "heart",         radicalChinese: "心字底" },
  { radical: "走", radicalName: "walk",          radicalChinese: "走字旁" },
  { radical: "用", radicalName: "use",           radicalChinese: "用字旁" },
  { radical: "己", radicalName: "self",          radicalChinese: "己字旁" },
  { radical: "艹", radicalName: "grass/plant",   radicalChinese: "草字头" },
  { radical: "纟", radicalName: "silk/thread",   radicalChinese: "绞丝旁" },
  { radical: "辶", radicalName: "walk/movement", radicalChinese: "走之旁" },
  { radical: "电", radicalName: "electricity",   radicalChinese: "电字旁" },
  { radical: "饣", radicalName: "food",          radicalChinese: "食字旁" },
  { radical: "米", radicalName: "rice",          radicalChinese: "米字旁" },
  { radical: "乖", radicalName: "obedient",      radicalChinese: "乖字旁" },
  { radical: "面", radicalName: "face/surface",  radicalChinese: "面字旁" },
  { radical: "立", radicalName: "stand",         radicalChinese: "立字旁" },
  { radical: "彳", radicalName: "step",          radicalChinese: "双人旁" },
  { radical: "又", radicalName: "again/hand",    radicalChinese: "又字旁" },
  { radical: "力", radicalName: "strength",      radicalChinese: "力字旁" },
  { radical: "八", radicalName: "eight",         radicalChinese: "八字头" },
  { radical: "干", radicalName: "dry/stem",      radicalChinese: "干字旁" },
  { radical: "工", radicalName: "work",          radicalChinese: "工字旁" },
  { radical: "厂", radicalName: "cliff/factory", radicalChinese: "厂字头" },
  { radical: "亠", radicalName: "lid",           radicalChinese: "亠字头" },
  { radical: "人", radicalName: "person",        radicalChinese: "人字底" },
];

const TEACHER_STAGES = [
  { hp: 100, status: "smug",        taunt: "你的中文太差了！(Your Chinese is terrible!)" },
  { hp: 75,  status: "rattled",     taunt: "That was a fluke! You'll never master this!" },
  { hp: 50,  status: "dishevelled", taunt: "O-okay, maybe you're not totally hopeless…" },
  { hp: 25,  status: "defeated",    taunt: "Please… no more flashcards… I'm begging you…" },
  { hp: 0,   status: "obliterated", taunt: "你赢了！Fine. You win. I'm going home." },
];

const HIT_EFFECTS  = ["CRITICAL HIT!", "TONE PERFECT!", "DEVASTATING!", "BRUTAL!", "SAVAGE!", "MERCILESS!", "ANNIHILATED!"];
const MISS_EFFECTS = ["WRONG TONE!", "TEACHER LAUGHS", "DISHONOUR!", "SHAMEFUL!", "EMBARRASSING!"];
const MAX_HINTS = 3;

function TeacherSprite({ stage, isHit, isMiss, shake }) {
  const faces       = { smug:"😤", rattled:"😟", dishevelled:"😰", defeated:"😵", obliterated:"💀" };
  const accessories = { smug:"🎓", rattled:"🎓", dishevelled:"💫", defeated:"🩹", obliterated:"⭐" };
  return (
    <div style={{
      fontSize:"80px", lineHeight:1, transition:"transform 0.1s",
      transform: shake ? `translateX(${Math.random()>.5?12:-12}px) rotate(${Math.random()>.5?5:-5}deg)` : "none",
      filter: isHit ? "brightness(2) saturate(3)" : isMiss ? "hue-rotate(200deg)" : "none",
      display:"inline-block", userSelect:"none",
    }}>
      {faces[stage] || "😤"}
      <div style={{ fontSize:"14px", marginTop:"-10px", textAlign:"center" }}>{accessories[stage] || "🎓"}</div>
    </div>
  );
}

function HPBar({ hp }) {
  const pct = Math.max(0, hp);
  const color = pct > 60 ? "#4ade80" : pct > 30 ? "#facc15" : "#ef4444";
  return (
    <div style={{ width:"100%", background:"#1a1a2e", borderRadius:"999px", height:"18px", border:"2px solid #333", overflow:"hidden" }}>
      <div style={{ width:`${pct}%`, height:"100%", background:color, transition:"width 0.4s cubic-bezier(.22,1,.36,1), background 0.3s", boxShadow:`0 0 8px ${color}`, borderRadius:"999px" }} />
    </div>
  );
}

function FloatingText({ texts }) {
  return (
    <div style={{ position:"absolute", top:0, left:0, width:"100%", height:"100%", pointerEvents:"none", overflow:"hidden" }}>
      {texts.map(t => (
        <div key={t.id} style={{
          position:"absolute", left:`${t.x}%`, top:`${t.y}%`,
          color: t.hit ? "#facc15" : "#f87171",
          fontFamily:"'Bangers', cursive", fontSize: t.hit ? "22px" : "16px",
          fontWeight:"900", textShadow:"2px 2px 0 #000",
          animation:"floatUp 1.2s ease-out forwards", whiteSpace:"nowrap", letterSpacing:"1px",
        }}>{t.text}</div>
      ))}
    </div>
  );
}

function buildBlankQuestion(word, allWords, nightmare) {
  const firstChar = word.chinese[0];
  const correctSecond = word.chinese.slice(1);
  const siblings = allWords.filter(w => w.chinese[0] === firstChar && w.chinese !== word.chinese);
  const siblingSeconds = siblings.map(w => w.chinese.slice(1));
  const allSeconds = [...new Set(WORDS.filter(w => w.chinese.length >= 2).map(w => w.chinese.slice(1)))];

  let correctAnswers, wrongPool;
  if (!nightmare) {
    correctAnswers = [correctSecond];
    const sameFamilyWrongs = siblingSeconds.filter(s => s !== correctSecond);
    const otherWrongs = allSeconds.filter(s => s !== correctSecond && !sameFamilyWrongs.includes(s));
    wrongPool = [...sameFamilyWrongs.sort(() => Math.random()-.5), ...otherWrongs.sort(() => Math.random()-.5)].slice(0, 3);
  } else {
    correctAnswers = [correctSecond, ...siblingSeconds];
    const alreadyCorrect = new Set(correctAnswers);
    const nightmareWrongs = allSeconds.filter(s => !alreadyCorrect.has(s)).sort(() => Math.random()-.5);
    wrongPool = nightmareWrongs.slice(0, Math.max(0, 3 - siblings.length));
  }

  const displayed = [...new Set([correctSecond, ...wrongPool.slice(0, 3)])].sort(() => Math.random()-.5);
  if (displayed.length < 4) {
    const extras = allSeconds.filter(s => !displayed.includes(s)).sort(() => Math.random()-.5);
    while (displayed.length < 4 && extras.length) displayed.push(extras.shift());
  }
  return { prompt: firstChar, correctAnswers, options: displayed.slice(0, 4) };
}

// Voice clips are pre-generated with Fish Audio TTS (Chinese voice
// 9a941ae106cc4977ba37f21d2858e260). Run `node scripts/generate-tts.mjs`
// after changing any spoken text to refresh the manifest below.
// === FISH TTS MANIFEST START (auto-generated — do not edit by hand) ===
const TTS_BASE = "https://fish-audio-399049857363-ap-southeast-1-an.s3.ap-southeast-1.amazonaws.com/tts/";
const TTS_CLIPS = {
  "一": "3fe2e957caa35828",
  "一同": "15143857c4d84726",
  "上": "6234b58fe42d498b",
  "上面": "9f5e2e95f19982c8",
  "下": "d84c78f19c645322",
  "下面": "73d6efbac96670c6",
  "不": "7adc5413ca64c466",
  "不用": "4bd370e9e9322ba4",
  "不给": "ae7abd4865a56dc9",
  "中": "081d46a77a6c903a",
  "中文": "e3837ab4279cf925",
  "中饭": "ab0b96e977e5d462",
  "乖": "e40e405bb8f7f438",
  "乖乖": "866d37e03f9e3c55",
  "乖孩子": "18169fc8af867980",
  "乖宝贝": "16fa6f37c7e76542",
  "乖巧": "717001784e4e99bf",
  "书": "08bcf0f8f13dba4b",
  "产": "2e790bbf2264d505",
  "产品": "4a2080897e19001f",
  "今": "0c26700107774487",
  "今年": "d095810a8c06f5f5",
  "从": "589434aae356505f",
  "从前": "d3cd30667a560ae1",
  "从头": "79c60c4f155f492e",
  "从小": "8c3e1d21622e67f0",
  "从来": "9a27acbc778723f7",
  "住": "63c3d0fc60f57789",
  "住口": "685c85de5d27719e",
  "住家": "44dbbd7bd1ab8e2d",
  "住房": "148830051256b9a8",
  "住手": "f395e6fbb35f12f8",
  "你": "9e8fc3c561827b57",
  "你好": "403721f546de7bdf",
  "做": "008dad3ceb0e31d3",
  "做梦": "020ea9f225b19f17",
  "关": "9adbd6d7ca9e65fa",
  "关上": "a5e4369dab3d4e82",
  "关心": "393c0f50566c1918",
  "关系": "249eadadcab09f99",
  "关门": "d5c9081c6dec759e",
  "刀": "4af50b112dc41b92",
  "刀子": "891b2dfae8a74990",
  "刀尖": "0a1606ee3efd6e2a",
  "前": "125f9bb5082f86e0",
  "前后": "ed92f5b3130eab63",
  "前天": "32e29b567611aeea",
  "前头": "62823356cda34380",
  "前方": "bf11d546df5d63ef",
  "前边": "6b8e250a65ab360f",
  "前面": "e2685e9e4fba2822",
  "动": "cb369a400802a319",
  "动人": "cd5fcf6dd8181ccc",
  "动作": "9fc85870c2a92046",
  "动手": "51a1e63a5e85e1e6",
  "动物": "b069dfd8a9998f75",
  "去": "64e73ba212674fef",
  "去年": "1c27fa1bb4a6fa90",
  "吃": "b37282aa1e6019ee",
  "吃饭": "d06d726651a09ded",
  "同": "c01cc06621386edc",
  "同上": "a62172cc4e71a32d",
  "同学": "9a9d32fafe233d3d",
  "同时": "811c01a7b066a58f",
  "同班": "1988f6df004133fd",
  "后": "9c838840bdc27e63",
  "后边": "61c5225d078a428d",
  "后面": "244c9f8c2dced4dd",
  "听": "c14211fdf6269f28",
  "听见": "97257b760b5a2530",
  "听话": "a2a8609fbf9e2d47",
  "听说": "0ba675995bcee0c8",
  "告": "374c3082935cd1fd",
  "告诉": "a49d69847bc111f6",
  "哈": "10100b655370869d",
  "哈巴狗": "d087884dc812ba97",
  "天": "fe8012348a0799be",
  "天鹅": "c0338920d40c9c1a",
  "好": "0dafd0e0eee9d5d9",
  "好听": "2665a6b640a1cbe1",
  "学": "e949c2e5aa955733",
  "学生": "2c7c8abe634d8a7b",
  "宝": "134fe7809fa07dfd",
  "宝玉": "69308d23d5218afc",
  "家": "2228bfd7a276c04e",
  "家具": "fe411876b12499fd",
  "对": "a1b3a535b0ee3e77",
  "对面": "bc9e5e03e3c1af00",
  "小": "1d300fde3fb9bc68",
  "小刀": "24a8cba3e06baa69",
  "小时": "434f172992a3f465",
  "小苗": "b7374104d0b5e330",
  "尖": "d981ff1ec7cac2ad",
  "尖刀": "33da3adec2dfddba",
  "尖子": "b6637ee132641e32",
  "尖的": "6c8b2eb7e6e2756f",
  "尺": "24b39dd03702927a",
  "尺子": "b55902235a3ffcd3",
  "尾": "4c37c1697c63f194",
  "尾巴": "56fc0ea1f404d665",
  "工": "abcee45fb85204e0",
  "工人": "6311f05897e37ab0",
  "工作": "56261292884d5b19",
  "工厂": "3d52cf47fed3d6f4",
  "巴": "bab89b921e365a56",
  "巴不得": "42dabe33fd4866a7",
  "年": "d10a3ad822932032",
  "年头": "4d763f7d22f90df8",
  "年年": "3e74eb23ac617022",
  "快": "28a886709e48cfce",
  "快乐": "e232885d0b64863f",
  "念": "fea1f8663fb37e23",
  "念书": "fd3ac055083d2f78",
  "念头": "7c1faccd161df766",
  "总": "0b2649d5aa4f861c",
  "总是": "32f35c929cbd8d22",
  "想": "4cb54d698ce108eb",
  "想不到": "67a395f09ed56c85",
  "想你": "c84f8fd6f8061339",
  "想得到": "e4725f1d8e53db05",
  "想念": "d8ad035cfaf67965",
  "成": "a91368b16517125b",
  "成长": "ede4f927a301468d",
  "手": "55c9f4886df0d827",
  "扫": "08a4fd34ad6fef92",
  "扫把": "d0e074fb29b6f323",
  "找": "da56a7ae1513c06d",
  "找人": "bab4a7745d352a3f",
  "找到": "c7b86052c445c86f",
  "找来": "ace0f9c2fcf48f3f",
  "拿": "51ae868c203b87d5",
  "拿去": "259866a5025d3ed8",
  "拿来": "7f323a1cc7487bc1",
  "拿着": "70337ca7c3f61865",
  "按": "a8ead14575fda86c",
  "按时": "0ad4de179170aa5a",
  "按照": "ef01d1ecab3287f6",
  "放": "1822085be96c5cd6",
  "放大": "9da581952fa4632f",
  "放学": "0ec1a678ca270f9b",
  "放开": "73377f030198acc5",
  "放心": "ea4c419d5ef9e273",
  "放手": "499ee5e4ed916cd4",
  "放火": "fcde77088be55107",
  "放牛": "72f9767a7d6b554d",
  "放着": "89c8896f89f30c57",
  "放羊": "587d17957c7fdc4d",
  "放马": "a464c29cd509c6d5",
  "文": "d6ee398df7ca29cc",
  "文人": "2bcd5e4a485e127b",
  "文具": "1fed4861880c754c",
  "文具盒": "5320000002af1ed6",
  "文字": "358bb1e68e1882c0",
  "文学": "901195938cbd3e99",
  "文明": "1d9e1cb9c8ec15bd",
  "早": "98d2f6368c4d72e2",
  "早饭": "3f7ac7c6359ec096",
  "有": "3e28ad18dbec6fba",
  "有用": "5ce6557d1f9ed245",
  "朋": "c02a787c95900850",
  "朋友": "bf1aec7986054d5c",
  "果": "f7a8d345d46f4494",
  "果子": "f418bfce39d541f3",
  "果然": "4a7c0b3c5d7b8b42",
  "桃": "46e0c01d7377e04d",
  "桃子": "42f9f2a8af6cb7cb",
  "桃花": "e461cb072b115079",
  "梦": "49ba53b138ee974e",
  "梦游": "c582ffa5a986e83f",
  "梦见": "22b08e7c9dd1bc63",
  "正": "e70989ec4eaa0d47",
  "正在": "12dfbb4b34e86387",
  "正好": "efef1d9096d049a6",
  "正是": "5bd37f5613b8ad9e",
  "正面": "d1757d0e72ec276c",
  "水": "22365f44bccdfc8b",
  "水果": "bd66ac5c30c79980",
  "没": "4f5047b2773ae441",
  "没了": "bb9f0ba5f9e52f3b",
  "没去": "1813b233274a7ca6",
  "没有": "c4a01ab09015695f",
  "没来": "97c2ae232d2add02",
  "没用": "7cab91213a83a475",
  "河": "16a49a5c6e01b0c3",
  "河水": "0a016b39e988b355",
  "河马": "469062bb56b5394c",
  "游": "3498e1e2a9bf8ff6",
  "游戏": "f95e5378ed1ae8d2",
  "漂": "68d446d3d75977a7",
  "漂亮": "f0682ab1da97c247",
  "火": "60dd9add10179185",
  "照": "e1e32447909b983e",
  "照明": "a26fa82e5199325a",
  "照看": "e46b1a4a655b1eaa",
  "照着": "a297dc78f9c03150",
  "狗": "b0902f77669a89ec",
  "猩": "b7916e1f4d2e0631",
  "猩猩": "e2f55be51c85ec9d",
  "猫": "bec70ec092045da4",
  "猴": "7b2f28b58e286814",
  "猴子": "a3f0c65883ba70a0",
  "玉": "f34edf0d08bf7fee",
  "玉兔": "4918f443aa9d54c6",
  "玉石": "5c04b246c418be50",
  "玉米": "7b8f40b54d251546",
  "玩": "ba254653634f9901",
  "玩具": "efa101ce2a1f97e1",
  "甜": "6e1ecd1447e14f1d",
  "甜水": "b0e628a624763b2c",
  "甜的": "ad30a34e45693aea",
  "生": "70c7159714328075",
  "生产": "5d97a027881dfc8c",
  "生长": "980a2123caed4d1d",
  "用": "0ff030615b8e2dae",
  "用做": "2fbd7d0c64014fa7",
  "用心": "1c5f3ce7e657f7c6",
  "用来": "1a017b2c4a7c98b4",
  "电": "20767eb0ef0217c6",
  "电话": "e8a7663999b2fe00",
  "画": "1cb4581eb31eeebf",
  "画家": "68a010b063ce1e9b",
  "画画": "337244206b40eb9e",
  "画笔": "84300f2a2f060710",
  "白": "8c3d6ffd4eed604e",
  "白鹅": "9e0b259f35e59b8c",
  "盒": "e4d552a18cb12a36",
  "盒子": "99595bcd0b1f6f5c",
  "眼": "c88769b0c8510656",
  "眼前": "8cc242d3833f60ce",
  "睡": "4786780a128e4dfc",
  "睡觉": "8748ab8f25772de6",
  "站": "6a85b0907d8e3484",
  "站住": "06dce0085abec6f7",
  "竹": "60acca81cadf37dd",
  "竹叶": "73e58ea3ba26375a",
  "竹子": "46b48bfa40bd128a",
  "竹苗": "8752ca02f22c2a7c",
  "竹马": "772c5ac673444165",
  "笔": "0940f2a6e47d0d7d",
  "笔头": "0166f6eff5942a45",
  "笔尖": "9dd084a94d879b09",
  "米": "7f97d3924260f22f",
  "米饭": "110119d44b97ab80",
  "给": "4da970c92e209eca",
  "给他": "f03c0ac680caaacf",
  "给你": "d72a33892c40a052",
  "给我": "5c12cc19b8ec0472",
  "绿": "ea38151018b13bdd",
  "绿苗": "3491792132d51bd9",
  "老": "245b4989a2a3956d",
  "老人": "debc61df4a964e97",
  "老人家": "b7eb409638d47318",
  "老公公": "e1a1af163e0063c7",
  "老奶奶": "a35a949cd377dc7e",
  "老婆婆": "f4800d2c8fe7a722",
  "老家": "4381bd43510e863d",
  "老师": "4291266587e03eee",
  "老爷爷": "23563439b67f70e0",
  "背": "12d6dc460bae2280",
  "背上": "c8d30a89eabfc795",
  "背心": "096641dd499ce9d2",
  "背着": "0c5b8d07766ecb73",
  "节": "27bb5a0bec1642be",
  "节日": "2aa42f865dedd9e1",
  "苗": "5fa16b0323b77f2c",
  "苗儿": "e042ae96eec678d1",
  "苗子": "10424c7ae2304bfe",
  "荷": "2afdd8ece77f6997",
  "荷叶": "f3f1bb1edf5cf95d",
  "荷花": "b69919014621a5a9",
  "虫": "b6f8776acb6792f9",
  "虫子": "25205335a1c81f39",
  "说": "d09a21418da8dbbd",
  "说话": "92c1a00ba2f339f7",
  "谢": "0a7a65b5fd8f83d4",
  "谢谢": "769e7222d0699d5d",
  "过": "bf40daa346b07b37",
  "过节": "f5ecc2f74b72c5c5",
  "进": "a514230335691793",
  "进出": "f6d55c151c3615a8",
  "进去": "b5450bcae834be33",
  "进口": "672e2adcf33cdb8b",
  "进来": "d99288d81eb2092e",
  "进门": "2be0b3d3ca6c5b09",
  "送": "be273f08a442cd09",
  "送东西": "0cd6953aff355538",
  "送去": "7b6074d5b5d361f2",
  "送来": "461488e569a076fe",
  "送给": "f833b66f4e2f619b",
  "钱": "01c4119232473e22",
  "长": "2ea2151ec1f2a0e0",
  "长大": "9ea55a59af314abd",
  "长高": "7a885d608a7b696b",
  "门": "aaf172162ae44046",
  "青": "a4f578be83dc9d83",
  "青苗": "8cf44a1374ad8715",
  "面": "84fb070d58e3c595",
  "面具": "29946f982408a27f",
  "面前": "813e4815bb7f06ba",
  "饭": "de89d81b7078c713",
  "饭盒": "6d14ff1916177a21",
  "驮": "cbd4b0fa5eef9cb4",
  "驮着": "5e0764a6f4b1adeb",
  "黄": "4c6e16f406381ae2",
};
// === FISH TTS MANIFEST END ===
const ttsPlayer = typeof Audio !== "undefined" ? new Audio() : null;

export default function App() {
  const [phase, setPhase]           = useState("menu");        // menu | chapter | playing | win
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
  const [blankPrompt, setBlankPrompt]         = useState(null);
  const [blankCorrects, setBlankCorrects]     = useState([]);
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

  // Pools — computed based on chapter and mode
  function getPools(mode, chapId) {
    const chWords = getWordsForChapter(chapId);
    const allWords = WORDS;
    const RADICAL_WORDS = chWords.filter(w => w.radical);
    const BLANK_WORDS   = chWords.filter(w => w.chinese.length >= 2);
    const firstCharCounts = BLANK_WORDS.reduce((acc, w) => {
      acc[w.chinese[0]] = (acc[w.chinese[0]] || 0) + 1; return acc;
    }, {});
    // For nightmare: try chapter first, fall back to all if < 4 multi-sibling words
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
      // For blank: use chapter words as siblings; for nightmare use all words for richer distractors
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
      // pad with words from other chapters if needed
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

  function speak(text) {
    const key = TTS_CLIPS[text];
    if (key && ttsPlayer) {
      if (window.speechSynthesis) window.speechSynthesis.cancel();
      ttsPlayer.pause();
      ttsPlayer.src = TTS_BASE + key + ".mp3";
      ttsPlayer.play().catch(() => {});
      return;
    }
    // Fallback for text missing from the manifest
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const attempt = () => {
      const utt = new SpeechSynthesisUtterance(text);
      utt.lang = "zh-CN"; utt.rate = 0.8; utt.pitch = 1;
      const voices = window.speechSynthesis.getVoices();
      const zh = voices.find(v => v.lang === "zh-CN") || voices.find(v => v.lang === "zh_CN") || voices.find(v => v.lang.startsWith("zh"));
      if (zh) utt.voice = zh;
      if (window.speechSynthesis.paused) window.speechSynthesis.resume();
      setTimeout(() => window.speechSynthesis.speak(utt), 50);
    };
    if (window.speechSynthesis.getVoices().length === 0) {
      window.speechSynthesis.onvoiceschanged = () => { attempt(); window.speechSynthesis.onvoiceschanged = null; };
    } else { attempt(); }
  }

  const MODES = [
    { id:"english",   label:"ENGLISH MODE",    sub:"汉字 → ?",         desc:"See Chinese, pick English.", emoji:"🇬🇧", cls:"mode-card" },
    { id:"chinese",   label:"CHINESE MODE",    sub:"English → 汉字?",  desc:"See English, pick Chinese.", emoji:"🇨🇳", cls:"mode-card" },
    { id:"radical",   label:"RADICAL MODE",    sub:"偏旁部首",          desc:"Find the radical.",          emoji:"🏯", cls:"mode-card-radical" },
    { id:"blank",     label:"FILL THE BLANK",  sub:"总（＿）",          desc:"One correct answer.",        emoji:"✏️", cls:"mode-card-blank" },
    { id:"nightmare", label:"NIGHTMARE MODE",  sub:"噩梦 — 多答案",     desc:"Multiple correct answers.",  emoji:"💀", cls:"mode-card-nightmare", span:true },
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
