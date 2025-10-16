import { calculateFrequency, C4_BASE_FOR_GUITAR_WAV, A4_FREQUENCY, initAudioContext, loadSound, playSound, setMasterVolume } from './sound.js'
import { initFretboardSvg, showFretMark, hideFretMark } from './fretboard.js'
import { fretboardNotes } from './chord.js'

let guitarBuffer
let pianoBuffer
// currentQuizPosition の fretIndex は fretboardNotes 配列のインデックス (0-21) を保持する
let currentQuizPosition = { stringIndex: -1, fretIndex: -1, noteName: '' }
let isAnswerShown = false // 答えが表示されているかどうかのフラグ
let selectedInstrument = 'guitar'

document.addEventListener('DOMContentLoaded', async () => {
  const fretboardSvg = document.getElementById('fretboard_svg')
  const quizButton = document.getElementById('quizButton')
  const volumeSlider = document.getElementById('volumeSlider')

  initAudioContext()
  setMasterVolume(volumeSlider.value / 100) // 初期音量をスライダーの値に設定

  initFretboardSvg(fretboardSvg)

  // Guitar-C4.wav の読み込み
  try {
    [guitarBuffer, pianoBuffer] = await Promise.all([
      loadSound('./sound/Guitar-C4.wav'),
      loadSound('./sound/PianoA4.wav')
    ])
    console.log('Sound files loaded successfully.')
  } catch (error) {
    console.error('Failed to load sound files:', error)
  }

  // 音量スライダーのイベントリスナー
  volumeSlider.addEventListener('input', event => {
    setMasterVolume(parseFloat(event.target.value) / 100)
  })

  // 楽器選択ラジオボタンのイベントリスナー
  document.querySelectorAll('input[name="instrument"]').forEach(radio => {
    radio.addEventListener('change', (event) => {
      selectedInstrument = event.target.value
    })
  })

  // クイズボタンのイベントリスナー
  quizButton.addEventListener('click', handleQuizButtonClick)
})

/**
 * 「問題」/「答え」ボタンのクリックハンドラ
 */
function handleQuizButtonClick () {
  const quizButton = document.getElementById('quizButton')

  if (!isAnswerShown) {
    // 「問題」モード: 新しい問題を表示する
    // 前回の表示をクリア
    if (currentQuizPosition.stringIndex !== -1) {
      // fretboardNotesのfretIndex (0-21) はそのままfret.jsのfretboardCxIndexに渡せる
      hideFretMark(currentQuizPosition.stringIndex, currentQuizPosition.fretIndex)
    }

    // ランダムなポジションを選択 (fretboardNotes配列のインデックスは0-21)
    const randomStringIndex = Math.floor(Math.random() * fretboardNotes.length)
    const randomFretIndex = Math.floor(Math.random() * fretboardNotes[randomStringIndex].length) // 0から21までの値をランダムに生成

    currentQuizPosition = {
      stringIndex: randomStringIndex, // 0=1弦, 5=6弦
      fretIndex: randomFretIndex, // 0=1フレット, 21=22フレット
      noteName: fretboardNotes[randomStringIndex][randomFretIndex]
    }

    // 赤い丸で表示し、音名は隠す (テキスト色も赤にして見えなくする)
    // fretboardNotesのfretIndex (0-21) はそのままfret.jsのfretboardCxIndexに渡せる
    showFretMark(currentQuizPosition.stringIndex, currentQuizPosition.fretIndex, '', 'red', 'red')
    quizButton.textContent = '答え'
    isAnswerShown = true
  } else {
    // 「答え」モード: 答えを表示し、音を鳴らす
    // 音名を表示
    // 例: 'A_4' から 'A' のようにオクターブ表記を削除して表示
    // fretboardNotesのfretIndex (0-21) はそのままfret.jsのfretboardCxIndexに渡せる
    const displayNoteName = currentQuizPosition.noteName.split('_')[0]
    showFretMark(currentQuizPosition.stringIndex, currentQuizPosition.fretIndex, displayNoteName, 'red', 'white')

    // 音を鳴らす
    const noteFrequency = calculateFrequency(currentQuizPosition.noteName) // 計算で周波数を取得
    if (noteFrequency) {
      if (selectedInstrument === 'guitar' && guitarBuffer) {
        playSound(guitarBuffer, noteFrequency, C4_BASE_FOR_GUITAR_WAV)
      } else if (selectedInstrument === 'piano' && pianoBuffer) {
        playSound(pianoBuffer, noteFrequency, A4_FREQUENCY)
      }
    } else {
      console.warn(`Could not play sound for note: ${currentQuizPosition.noteName}. Buffer or frequency not available.`)
    }

    quizButton.textContent = '問題'
    isAnswerShown = false
  }
}
