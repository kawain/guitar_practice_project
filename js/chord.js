import { ChromaticScale } from './scale.js'
// 各弦の音名配列 (1フレットから22フレットまで)
// fretboardNotes[stringArrayIndex][fretArrayIndex]
// stringArrayIndex: 0=1弦(高音E), 1=2弦(B), ..., 5=6弦(低音E)
// fretArrayIndex: 0=1フレット, 1=2フレット, ..., 21=22フレット
const fretboardNotes = [
  ['F_4', 'F#_4', 'G_4', 'Ab_4', 'A_4', 'Bb_4', 'B_4', 'C_5', 'C#_5', 'D_5', 'Eb_5', 'E_5', 'F_5', 'F#_5', 'G_5', 'Ab_5', 'A_5', 'Bb_5', 'B_5', 'C_6', 'C#_6', 'D_6'],
  ['C_4', 'C#_4', 'D_4', 'Eb_4', 'E_4', 'F_4', 'F#_4', 'G_4', 'Ab_4', 'A_4', 'Bb_4', 'B_4', 'C_5', 'C#_5', 'D_5', 'Eb_5', 'E_5', 'F_5', 'F#_5', 'G_5', 'Ab_5', 'A_5'],
  ['Ab_3', 'A_3', 'Bb_3', 'B_3', 'C_4', 'C#_4', 'D_4', 'Eb_4', 'E_4', 'F_4', 'F#_4', 'G_4', 'Ab_4', 'A_4', 'Bb_4', 'B_4', 'C_5', 'C#_5', 'D_5', 'Eb_5', 'E_5', 'F_5'],
  ['Eb_3', 'E_3', 'F_3', 'F#_3', 'G_3', 'Ab_3', 'A_3', 'Bb_3', 'B_3', 'C_4', 'C#_4', 'D_4', 'Eb_4', 'E_4', 'F_4', 'F#_4', 'G_4', 'Ab_4', 'A_4', 'Bb_4', 'B_4', 'C_5'],
  ['Bb_2', 'B_2', 'C_3', 'C#_3', 'D_3', 'Eb_3', 'E_3', 'F_3', 'F#_3', 'G_3', 'Ab_3', 'A_3', 'Bb_3', 'B_3', 'C_4', 'C#_4', 'D_4', 'Eb_4', 'E_4', 'F_4', 'F#_4', 'G_4'],
  ['F_2', 'F#_2', 'G_2', 'Ab_2', 'A_2', 'Bb_2', 'B_2', 'C_3', 'C#_3', 'D_3', 'Eb_3', 'E_3', 'F_3', 'F#_3', 'G_3', 'Ab_3', 'A_3', 'Bb_3', 'B_3', 'C_4', 'C#_4', 'D_4']
]

// 0: 弾かない, 'R': Root, '3': Major 3rd, 'b3': Minor 3rd, '5': Perfect 5th, 'b5': Diminished 5th, '7': Major 7th, 'b7': Minor 7th

const root6 = {
  '': [
    [0, 'R', 0, 0], // 1弦
    [0, '5', 0, 0], // 2弦
    [0, 0, '3', 0], // 3弦
    [0, 0, 0, 'R'], // 4弦
    [0, 0, 0, '5'], // 5弦
    [0, 'R', 0, 0] // 6弦
  ],
  maj7: [
    [0, 0, 0, 0],
    [0, '5', 0, 0],
    [0, 0, '3', 0],
    [0, 0, '7', 0],
    [0, 0, 0, 0],
    [0, 'R', 0, 0]
  ],
  m7: [
    [0, 0, 0, 0],
    [0, '5', 0, 0],
    [0, 'b3', 0, 0],
    [0, 'b7', 0, 0],
    [0, 0, 0, 0],
    [0, 'R', 0, 0]
  ],
  7: [
    [0, 0, 0, 0],
    [0, '5', 0, 0],
    [0, 0, '3', 0],
    [0, 'b7', 0, 0],
    [0, 0, 0, 0],
    [0, 'R', 0, 0]
  ],
  m7b5: [
    [0, 0, 0, 0],
    ['b5', 0, 0, 0],
    [0, 'b3', 0, 0],
    [0, 'b7', 0, 0],
    [0, 0, 0, 0],
    [0, 'R', 0, 0]
  ]
}

const root5 = {
  '': [
    [0, '5', 0, 0], // 1弦
    [0, 0, 0, '3'], // 2弦
    [0, 0, 0, 'R'], // 3弦
    [0, 0, 0, '5'], // 4弦
    [0, 'R', 0, 0], // 5弦
    [0, '5', 0, 0] // 6弦
  ],
  maj7: [
    [0, 0, 0, 0],
    [0, 0, 0, '3'],
    [0, 0, '7', 0],
    [0, 0, 0, '5'],
    [0, 'R', 0, 0],
    [0, 0, 0, 0]
  ],
  m7: [
    [0, 0, 0, 0],
    [0, 0, 'b3', 0],
    [0, 'b7', 0, 0],
    [0, 0, 0, '5'],
    [0, 'R', 0, 0],
    [0, 0, 0, 0]
  ],
  7: [
    [0, 0, 0, 0],
    [0, 0, 0, '3'],
    [0, 'b7', 0, 0],
    [0, 0, 0, '5'],
    [0, 'R', 0, 0],
    [0, 0, 0, 0]
  ],
  m7b5: [
    [0, 0, 0, 0],
    [0, 0, 'b3', 0],
    [0, 'b7', 0, 0],
    [0, 0, 'b5', 0],
    [0, 'R', 0, 0],
    [0, 0, 0, 0]
  ]
}

/**
 * コード名とルート弦から、構成音の情報を取得する
 * @param {string} chordName - コード名 (例: "C", "Am7", "F#m7b5")
 * @param {number} rootStringNum - ルート音が存在する弦の番号 (6 or 5)
 * @returns {Array<Object>} 構成音の情報の配列。各オブジェクトは { note, stringIndex, fretIndex, degree } を持つ。
 */
function getChordNotes (chordName, rootStringNum) {
  const validQualities = ['', 'maj7', 'm7', '7', 'm7b5']
  const quality = validQualities.find(q => chordName.endsWith(q) && (q !== '' || !validQualities.some(vq => vq !== '' && chordName.endsWith(vq))))
  if (quality === undefined) {
    console.error(`エラー: ${chordName} に対応するコードクオリティが見つかりません。`)
    return []
  }
  const rootNote = chordName.slice(0, -quality.length || undefined)
  if (!ChromaticScale.includes(rootNote)) {
    console.error(`エラー: ルート音 '${rootNote}' が ChromaticScale に存在しません。`)
    return []
  }

  const shapeObject = rootStringNum === 6 ? root6 : root5
  const shape = shapeObject[quality]
  if (!shape) {
    console.error(`エラー: root${rootStringNum} にクオリティ '${quality}' のシェイプ定義がありません。`)
    return []
  }

  // シェイプ定義の中から 'R' の位置を探す
  let rootShapeStringIndex = -1
  let rootShapeFretOffset = -1
  for (let i = 0; i < shape.length; i++) {
    const j = shape[i].indexOf('R')
    if (j !== -1) {
      rootShapeStringIndex = i
      rootShapeFretOffset = j
      break
    }
  }

  if (rootShapeStringIndex === -1) {
    console.error(`エラー: シェイプ内にルート音('R')の定義が見つかりません。 Quality: ${quality}`)
    return []
  }

  // フレットボード上で、シェイプのルート音に対応するフレットを探す
  const baseFretIndex = fretboardNotes[rootShapeStringIndex].findIndex((note, index) => index >= 0 && note.startsWith(rootNote + '_'))
  if (baseFretIndex === -1) {
    console.warn(`警告: ${rootShapeStringIndex + 1}弦上にルート音 ${rootNote} が見つかりません。`)
    return []
  }

  const notes = []
  shape.forEach((stringShape, stringIndex) => {
    stringShape.forEach((degree, offset) => {
      if (degree !== 0) {
        // 基準となるフレットからの相対位置でフレットを計算
        const fretIndex = baseFretIndex - rootShapeFretOffset + offset
        const note = fretboardNotes[stringIndex]?.[fretIndex]
        if (note) {
          notes.push({
            note: note,
            stringIndex: stringIndex,
            fretIndex: fretIndex,
            degree: degree
          })
        }
      }
    })
  })
  return notes
}

export { fretboardNotes, getChordNotes }
