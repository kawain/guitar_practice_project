import { getScaleNotes, MajorScale, ChromaticScale } from './scale.js'

// メジャーキーのダイアトニックセブンスコードのクオリティとディグリー名
const MAJOR_SEVENTH_QUALITIES = ['maj7', 'm7', 'm7', 'maj7', '7', 'm7', 'm7b5']
const MAJOR_SEVENTH_DEGREE_NAMES = ['Imaj7', 'IIm7', 'IIIm7', 'IVmaj7', 'V7', 'VIm7', 'VIIm7(b5)']

// マイナーキー（ナチュラルマイナー）のダイアトニックセブンスコードのクオリティとディグリー名
const MINOR_SEVENTH_QUALITIES = ['m7', 'm7b5', 'maj7', 'm7', 'm7', 'maj7', '7']
const MINOR_SEVENTH_DEGREE_NAMES = ['Im7', 'IIm7(b5)', 'bIIImaj7', 'IVm7', 'Vm7', 'bVImaj7', 'bVII7']

/**
 * 指定されたルート音とスケールタイプからダイアトニックコード（4和音限定）を生成する関数
 *
 * @param {string} rootNote - スケールのルートとなる音名 (例: "C", "F", "G", "Db")
 * @param {string} scaleType - 生成したいスケールのタイプ ("major" または "minor")
 * @returns {Array<Object>} 生成されたダイアトニックコードの配列
 *   - 各オブジェクトは { degree: string, chordName: string, notes: string[] } の形式
 */
function generateDiatonicChords (rootNote, scaleType) {
  let baseScaleNotes // コードの構成音を取得するための基準となるスケール
  let chordQualities // 各ディグリーのコードクオリティ
  let degreeNames // 各ディグリーのローマ数字表記

  if (scaleType === 'major') {
    baseScaleNotes = getScaleNotes(rootNote, MajorScale)
    chordQualities = MAJOR_SEVENTH_QUALITIES
    degreeNames = MAJOR_SEVENTH_DEGREE_NAMES

    if (baseScaleNotes.length === 0) {
      console.error(`エラー: ${rootNote}メジャースケールが生成できませんでした。`)
      return []
    }
  } else if (scaleType === 'minor') {
    // 相対メジャーキーのルート音を計算で求める
    // マイナールートから短3度上（半音3つ上）が相対メジャールート
    const minorRootIndex = ChromaticScale.indexOf(rootNote)
    if (minorRootIndex === -1) {
      console.error(`エラー: ルート音 '${rootNote}' がクロマチックスケールに見つかりません。`)
      return []
    }
    const relativeMajorRootIndex = (minorRootIndex + 3) % 12
    const relativeMajorRoot = ChromaticScale[relativeMajorRootIndex]

    baseScaleNotes = getScaleNotes(relativeMajorRoot, MajorScale)

    if (baseScaleNotes.length === 0) {
      console.error(`エラー: ${relativeMajorRoot}メジャースケールが生成できませんでした。`)
      return []
    }

    chordQualities = MINOR_SEVENTH_QUALITIES
    degreeNames = MINOR_SEVENTH_DEGREE_NAMES

    // マイナールート音の相対メジャースケール内での開始インデックスを見つける
    // 例: Aマイナーの場合、Cメジャースケール ['C', 'D', 'E', 'F', 'G', 'A', 'B'] の 'A' はインデックス 5
    // getScaleNotes の実装は1-based intervalなので、rootNote自体が最初の音として含まれることに注意
    const minorRootIndexInMajorScale = baseScaleNotes.indexOf(rootNote)
    if (minorRootIndexInMajorScale === -1) {
      console.error(`エラー: 相対メジャースケール内にマイナールート音 (${rootNote}) が見つかりませんでした。`)
      // このエラーは、例えばChromaticScaleがC#を持っていても、
      // C# MajorスケールがF# majorスケールとして扱われ、F#スケールにC#が含まれていない場合などに起こる。
      // 現在のChromaticScaleの定義であれば、このエラーは発生しにくいはず。
      return []
    }

    // baseScaleNotes をマイナールートから始まるようにローテーション
    // 例: Cメジャーの場合 ['C', 'D', 'E', 'F', 'G', 'A', 'B'] と Aマイナーの場合
    // 'A'はインデックス 5なので、[ 'A', 'B', 'C', 'D', 'E', 'F', 'G' ] のようになる
    baseScaleNotes = [...baseScaleNotes.slice(minorRootIndexInMajorScale), ...baseScaleNotes.slice(0, minorRootIndexInMajorScale)]
  } else {
    console.error("エラー: 無効なスケールタイプが指定されました。'major' または 'minor' を指定してください。")
    return []
  }

  const diatonicChords = []

  for (let i = 0; i < baseScaleNotes.length; i++) {
    const root = baseScaleNotes[i]
    const third = baseScaleNotes[(i + 2) % baseScaleNotes.length]
    const fifth = baseScaleNotes[(i + 4) % baseScaleNotes.length]
    const seventh = baseScaleNotes[(i + 6) % baseScaleNotes.length]
    let notes = [root, third, fifth, seventh]
    let chordSuffix = chordQualities[i]
    let degree = degreeNames[i]

    const chordName = root + chordSuffix

    diatonicChords.push({
      degree: degree,
      chordName: chordName,
      notes: notes
    })
  }

  return diatonicChords
}

export { generateDiatonicChords }
