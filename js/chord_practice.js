import { calculateFrequency, C4_BASE_FOR_GUITAR_WAV, A4_FREQUENCY, initAudioContext, loadSound, playSound, setMasterVolume } from './sound.js'
import { initFretboardSvg, showFretMark, hideFretMark } from './fretboard.js'
import { ChromaticScale } from './scale.js'
import { generateDiatonicChords } from './diatonic.js'
import { getChordNotes } from './chord.js'

let guitarBuffer
let pianoBuffer
let hihatBuffer
let isPracticing = false
let practiceIntervalId = null
let tempo = 120
let currentBeat = 0
let currentChordIndex = 0
let randomChordProgression = []
let lastDisplayedFretMarks = []
let selectedInstrument = 'guitar'

document.addEventListener('DOMContentLoaded', async () => {
  const fretboardSvg = document.getElementById('fretboard_svg')
  const actionButton = document.getElementById('actionButton')
  const volumeSlider = document.getElementById('volumeSlider')
  const tempoSlider = document.getElementById('tempoSlider')
  const tempoValue = document.getElementById('tempoValue')

  initAudioContext()
  setMasterVolume(volumeSlider.value / 100) // 初期音量をスライダーの値に設定
  tempo = parseInt(tempoSlider.value, 10)
  tempoValue.textContent = tempo

  initFretboardSvg(fretboardSvg)

  // サウンドファイルの読み込み
  try {
    [guitarBuffer, pianoBuffer, hihatBuffer] = await Promise.all([
      loadSound('./sound/Guitar-C4.wav'),
      loadSound('./sound/PianoA4.wav'),
      loadSound('./sound/Closed-Hi-Hat.wav')
    ])
    console.log('Sound files loaded successfully.')
  } catch (error) {
    console.error('Failed to load sound files:', error)
    actionButton.disabled = true
    actionButton.textContent = '音源読込失敗'
  }

  // 音量スライダーのイベントリスナー
  volumeSlider.addEventListener('input', event => {
    setMasterVolume(parseFloat(event.target.value) / 100)
  })

  // テンポスライダーのイベントリスナー
  tempoSlider.addEventListener('input', event => {
    tempo = parseInt(event.target.value, 10)
    tempoValue.textContent = tempo
  })

  // 楽器選択ラジオボタンのイベントリスナー
  document.querySelectorAll('input[name="instrument"]').forEach(radio => {
    radio.addEventListener('change', (event) => {
      selectedInstrument = event.target.value
    })
  })

  actionButton.addEventListener('click', handleActionButtonClick)
})

function handleActionButtonClick () {
  const actionButton = document.getElementById('actionButton')
  isPracticing = !isPracticing

  if (isPracticing) {
    actionButton.textContent = '停止'
    startPractice()
  } else {
    actionButton.textContent = '開始'
    stopPractice()
  }
}

function generateProgression () {
  randomChordProgression = []
  // ChromaticScaleからランダムに一つ音を選ぶ
  const rootNote = ChromaticScale[Math.floor(Math.random() * ChromaticScale.length)]

  // 選んだ音からメジャーキーのダイアトニックコード (4和音)を作る
  const diatonicChords = generateDiatonicChords(rootNote, 'major')
  if (diatonicChords.length === 0) {
    console.error(`ダイアトニックコードの生成に失敗しました。Key: ${rootNote}`)
    return false
  }

  // IIm7, V7, Imaj7 をインデックスで取得
  const twoChordInfo = diatonicChords[1] // IIm7
  const fiveChordInfo = diatonicChords[4] // V7
  const oneChordInfo = diatonicChords[0] // Imaj7

  // ランダム蓄積配列が16個になるまでループ
  while (randomChordProgression.length < 17) { // 16小節 + 次のコード表示用に1つ
    // ダイアトニックコードの中からランダムに一つ選ぶ
    const randomChord = diatonicChords[Math.floor(Math.random() * diatonicChords.length)]

    // もしIIm7であれば、次はV7、その次はImaj7にする
    if (randomChord.degree === 'IIm7') {
      randomChordProgression.push(twoChordInfo)
      randomChordProgression.push(fiveChordInfo)
      randomChordProgression.push(oneChordInfo)
    } else {
      randomChordProgression.push(randomChord)
    }
  }

  console.log(`Key: ${rootNote} Major`)
  console.log('ランダム蓄積配列:', randomChordProgression)
  return true
}

function startPractice () {
  if (!generateProgression()) {
    // コード進行の生成に失敗した場合
    isPracticing = false
    document.getElementById('actionButton').textContent = '開始'
    return
  }

  currentBeat = -4 // -4から-1までがカウントイン
  currentChordIndex = 0

  const intervalTime = (60 / tempo) * 1000 // 1拍あたりのミリ秒

  practiceIntervalId = setInterval(practiceLoop, intervalTime)
}

function practiceLoop () {
  const isCountIn = currentBeat < 0

  // 毎拍ハイハットを鳴らす
  if (hihatBuffer) {
    playSound(hihatBuffer)
  }

  // 1小節の1拍目 (またはカウントイン終了後の最初の拍)
  if (currentBeat % 4 === 0) {
    if (!isCountIn) {
      // --- 演奏処理 ---
      const chordInfo = randomChordProgression[currentChordIndex]

      // フレットマークをクリア
      clearFretboard()

      // 6弦ルートまたは5弦ルートのコードフォームをランダムに取得
      const rootString = Math.random() < 0.5 ? 6 : 5
      let chordNotes = getChordNotes(chordInfo.chordName, rootString)
      // 取得できなかった場合、もう一方の弦で試す
      if (!chordNotes || chordNotes.length === 0) {
        const otherRootString = rootString === 6 ? 5 : 6
        chordNotes = getChordNotes(chordInfo.chordName, otherRootString)
      }

      // コードの音を鳴らし、フレットボードに表示
      if (chordNotes && chordNotes.length > 0) {
        lastDisplayedFretMarks = []
        chordNotes.forEach(noteInfo => {
          const noteFrequency = calculateFrequency(noteInfo.note)
          if (noteFrequency) {
            if (selectedInstrument === 'guitar' && guitarBuffer) {
              playSound(guitarBuffer, noteFrequency, C4_BASE_FOR_GUITAR_WAV)
            } else if (selectedInstrument === 'piano' && pianoBuffer) {
              playSound(pianoBuffer, noteFrequency, A4_FREQUENCY)
            }
          }
          showFretMark(noteInfo.stringIndex, noteInfo.fretIndex, noteInfo.degree, 'red', 'white')
          lastDisplayedFretMarks.push({ stringIndex: noteInfo.stringIndex, fretIndex: noteInfo.fretIndex })
        })
      }
    }

    // --- UI更新 ---
    const currentChordName = isCountIn ? '(Count In)' : randomChordProgression[currentChordIndex].chordName
    const nextChordIndex = (currentChordIndex + 1) % 16 // 16小節でループ
    const nextChordName = randomChordProgression[isCountIn ? 0 : nextChordIndex].chordName

    document.getElementById('currentChord').textContent = currentChordName
    document.getElementById('nextChord').textContent = nextChordName

    // 次のコードへ
    if (!isCountIn) {
      currentChordIndex = (currentChordIndex + 1) % 16 // 16小節でループ
    }
  }

  currentBeat++
}

function stopPractice () {
  if (practiceIntervalId) {
    clearInterval(practiceIntervalId)
    practiceIntervalId = null
  }
  resetUI()
  console.log('練習が停止されました。')
}

function clearFretboard () {
  if (lastDisplayedFretMarks.length > 0) {
    lastDisplayedFretMarks.forEach(mark => {
      hideFretMark(mark.stringIndex, mark.fretIndex)
    })
    lastDisplayedFretMarks = []
  }
}

function resetUI () {
  clearFretboard()
  document.getElementById('currentChord').textContent = '--'
  document.getElementById('nextChord').textContent = '--'
}
