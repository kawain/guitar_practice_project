const ChromaticScale = ['C', 'C#', 'D', 'Eb', 'E', 'F', 'F#', 'G', 'Ab', 'A', 'Bb', 'B']

// メジャースケール
const MajorScale = [1, 3, 5, 6, 8, 10, 12]

// ナチュラル・マイナー・スケール
const NaturalMinorScale = [1, 3, 4, 6, 8, 9, 11]

// ハーモニック・マイナー・スケール
const HarmonicMinorScale = [1, 3, 4, 6, 8, 9, 12]

// メロディック・マイナー・スケール
const MelodicMinorScale = [1, 3, 4, 6, 8, 10, 12]

// アイオニアン・スケール
const IonianScale = [1, 3, 5, 6, 8, 10, 12]

// ドリアン・スケール
const DorianScale = [1, 3, 4, 6, 8, 10, 11]

// フリジアン・スケール
const PhrygianScale = [1, 2, 4, 6, 8, 9, 11]

// リディアン・スケール
const LydianScale = [1, 3, 5, 7, 8, 10, 12]

// ミクソリディアン・スケール
const MixolydianScale = [1, 3, 5, 6, 8, 10, 11]

// エオリアン・スケール
const AeolianScale = [1, 3, 4, 6, 8, 9, 11]

// ロクリアン・スケール
const LocrianScale = [1, 2, 4, 6, 7, 9, 11]

// ホールトーン・スケール
const WholeToneScale = [1, 3, 5, 7, 9, 11]

// ディミニッシュト・スケール
const DiminishedScale = [1, 3, 4, 6, 7, 9, 10, 12]

// マイナー・ペンタトニック・スケール
const MinorPentatonicScale = [1, 4, 6, 8, 11]

// メジャー・ペンタトニック・スケール
const MajorPentatonicScale = [1, 3, 5, 8, 10]

// メジャー・ブルース・スケール
const MajorBluesScale = [1, 3, 4, 5, 8, 10]

// マイナー・ブルース・スケール
const MinorBluesScale = [1, 4, 6, 7, 8, 11]

// ブルー・ノート・スケール
const BlueNoteScale = [1, 3, 4, 5, 6, 7, 8, 10, 11, 12]

/**
 * 指定されたルート音とスケールインターバルに基づいて、スケールの構成音を生成する関数
 * @param {string} rootNote - スケールのルート音 (例: 'C', 'Eb')
 * @param {number[]} scaleIntervals - スケールを構成するインターバルの配列 (1-based)
 * @returns {string[]} スケールを構成する音名の配列
 */
function getScaleNotes (rootNote, scaleIntervals) {
  // ルート音のクロマチックスケール上のインデックスを見つける
  const rootIndex = ChromaticScale.indexOf(rootNote)

  if (rootIndex === -1) {
    console.error(`Error: ルート音 '${rootNote}' がクロマチックスケールに見つかりません。`)
    return []
  }

  const scaleNotes = []
  for (const interval of scaleIntervals) {
    // インターバルは1-basedなので、配列インデックスに合わせるために -1 する
    // クロマチックスケールの範囲を超える場合は % 12 で循環させる
    const noteIndex = (rootIndex + interval - 1) % 12
    scaleNotes.push(ChromaticScale[noteIndex])
  }

  return scaleNotes
}

export {
  getScaleNotes,
  ChromaticScale,
  MajorScale,
  NaturalMinorScale,
  HarmonicMinorScale,
  MelodicMinorScale,
  IonianScale,
  DorianScale,
  PhrygianScale,
  LydianScale,
  MixolydianScale,
  AeolianScale,
  LocrianScale,
  WholeToneScale,
  DiminishedScale,
  MinorPentatonicScale,
  MajorPentatonicScale,
  MajorBluesScale,
  MinorBluesScale,
  BlueNoteScale
}
