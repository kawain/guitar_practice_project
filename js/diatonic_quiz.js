import { ChromaticScale } from './scale.js'
import { generateDiatonicChords } from './diatonic.js'

// DOM要素の取得
const questionTextElement = document.getElementById('questionText')
const optionsContainer = document.getElementById('optionsContainer')
const actionButton = document.getElementById('actionButton')
const feedbackArea = document.getElementById('feedbackArea')
const attemptCountElement = document.getElementById('attemptCount')
const correctCountElement = document.getElementById('correctCount')
const accuracyRateElement = document.getElementById('accuracyRate')

// 定数
const scaleTypes = ['major', 'minor']

// クイズの状態を保持する変数
let currentQuizState = {
  rootNote: '',
  scaleType: '',
  degreeIndex: -1,
  degreeName: '', // "Imaj7", "V7" など
  correctChordName: '', // "Cmaj7", "G7" など
  allDiatonicChords: [], // そのキーの全ダイアトニックコード
  options: [] // 選択肢
}

let attemptCount = 0
let correctCount = 0

// ------------------------------------------
// ヘルパー関数
// ------------------------------------------

/**
 * 統計情報を表示します。
 */
function displayStats () {
  attemptCountElement.textContent = attemptCount
  correctCountElement.textContent = correctCount
  const accuracy = attemptCount === 0 ? 0 : (correctCount / attemptCount) * 100
  accuracyRateElement.textContent = `${accuracy.toFixed(2)}%`
}

/**
 * 配列をシャッフルします（フィッシャー・イェーツ・シャッフル）。
 * @param {Array} array - シャッフルする配列
 * @returns {Array} シャッフルされた配列
 */
function shuffleArray (array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[array[i], array[j]] = [array[j], array[i]]
  }
  return array
}

// ------------------------------------------
// クイズの主要なロジック
// ------------------------------------------

/**
 * 新しい問題を生成し、画面に表示します。
 */
function generateNewQuestion () {
  // 状態のリセット
  feedbackArea.innerHTML = '' // 前回のフィードバックをクリア
  optionsContainer.innerHTML = '' // 前回の選択肢をクリア
  actionButton.textContent = '解答' // ボタンを「解答」に設定
  actionButton.onclick = submitAnswer // クリックイベントを回答処理に設定

  // ランダムなルート音、スケールタイプ、ディグリーを選択
  const rootNote = ChromaticScale[Math.floor(Math.random() * ChromaticScale.length)]
  const scaleType = scaleTypes[Math.floor(Math.random() * scaleTypes.length)]
  const degreeIndex = Math.floor(Math.random() * 7) // 0-6 で I-VII のディグリーを選択

  // 指定されたキーと音数でダイアトニックコードを生成
  const allChords = generateDiatonicChords(rootNote, scaleType)
  if (allChords.length === 0) {
    console.error('ダイアトニックコードの生成に失敗しました。')
    questionTextElement.textContent = 'エラー: 問題を生成できませんでした。'
    return
  }

  const correctDiatonicChord = allChords[degreeIndex] // 正解となるディグリーのコード
  const degreeName = correctDiatonicChord.degree // 例: "Imaj7", "V7"
  const correctChordName = correctDiatonicChord.chordName // 例: "Cmaj7", "G7"

  // 質問文を生成
  const scaleTypeName = scaleType === 'major' ? 'メジャー' : 'マイナー'
  questionTextElement.textContent = `${rootNote}${scaleTypeName}キーのダイアトニックコードの${degreeName}は何ですか？`

  // 選択肢を生成: 正解のコードのクオリティ（例: "7"）を保ちつつ、12種類のルート音を持つコード
  // 例: 正解がG7なら、C7, C#7, D7, ..., G7, ..., B7 が選択肢となる
  const correctQuality = correctChordName.replace(correctDiatonicChord.notes[0], '') // 例: "G7" -> "7"
  let options = ChromaticScale.map(note => note + correctQuality)
  options = shuffleArray(options) // 選択肢をシャッフル

  // currentQuizStateを更新
  currentQuizState = {
    rootNote,
    scaleType,
    degreeIndex,
    degreeName,
    correctChordName,
    allDiatonicChords: allChords,
    options
  }

  // 選択肢をDOMにレンダリング
  options.forEach((option, index) => {
    const radioDiv = document.createElement('div')
    radioDiv.classList.add('option-item') // スタイリング用クラス
    const radioInput = document.createElement('input')
    radioInput.type = 'radio'
    radioInput.name = 'chordOption' // 全てのラジオボタンで同じname属性を使う
    radioInput.id = `option${index}`
    radioInput.value = option

    const radioLabel = document.createElement('label')
    radioLabel.htmlFor = `option${index}`
    radioLabel.textContent = option

    radioDiv.appendChild(radioInput)
    radioDiv.appendChild(radioLabel)
    optionsContainer.appendChild(radioDiv)
  })

  displayStats() // 統計情報を更新表示
}

/**
 * ユーザーの回答を処理し、結果を表示します。
 */
function submitAnswer () {
  const selectedOption = document.querySelector('input[name="chordOption"]:checked')

  if (!selectedOption) {
    feedbackArea.textContent = '選択肢を選んでください。'
    return
  }

  attemptCount++ // 試行回数をインクリメント
  const userAnswer = selectedOption.value
  const isCorrect = userAnswer === currentQuizState.correctChordName

  if (isCorrect) {
    correctCount++ // 正解数をインクリメント
    feedbackArea.innerHTML = `<p class="correct">正解！</p>`
  } else {
    feedbackArea.innerHTML = `<p class="incorrect">不正解！ 正解は <span>${currentQuizState.correctChordName}</span> でした。</p>`
  }

  // ダイアトニックコードの一覧を表示
  const chordListDiv = document.createElement('div')
  chordListDiv.classList.add('diatonic-chord-list') // スタイリング用のクラスを追加
  chordListDiv.innerHTML += `<h3>${currentQuizState.rootNote}${currentQuizState.scaleType === 'major' ? 'メジャー' : 'ナチュラルマイナー'}キーのダイアトニックコード (4和音)</h3>`

  const table = document.createElement('table')
  table.classList.add('chord-table') // スタイリング用のクラスを追加

  // テーブルヘッダーを作成
  const thead = table.createTHead()
  const headerRow = thead.insertRow()
  headerRow.innerHTML = '<th>ディグリー</th><th>コード名</th><th>構成音</th>'

  // テーブルボディを作成
  const tbody = table.createTBody()
  currentQuizState.allDiatonicChords.forEach(chord => {
    const row = tbody.insertRow()
    const cellDegree = row.insertCell()
    const cellChordName = row.insertCell()
    const cellNotes = row.insertCell()
    cellDegree.textContent = chord.degree
    cellChordName.textContent = chord.chordName
    cellNotes.textContent = chord.notes.join(', ')
  })
  chordListDiv.appendChild(table)
  feedbackArea.appendChild(chordListDiv)

  displayStats() // 統計情報を更新表示

  // ボタンを「次の問題」に変更
  actionButton.textContent = '次の問題'
  actionButton.onclick = generateNewQuestion // クリックイベントを次の問題生成に設定
  optionsContainer.innerHTML = '' // 回答後は選択肢をクリア
}

// ------------------------------------------
// 初期化処理
// ------------------------------------------

// ページロード時に実行
document.addEventListener('DOMContentLoaded', () => {
  displayStats() // 初期統計情報を表示
  questionTextElement.textContent = '「問題を開始」ボタンを押してクイズを始めましょう！'
  actionButton.onclick = generateNewQuestion // 初回は問題を生成する関数を割り当てる
})
