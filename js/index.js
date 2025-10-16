import { calculateFrequency, C4_BASE_FOR_GUITAR_WAV, A4_FREQUENCY, initAudioContext, loadSound, playSound, setMasterVolume } from './sound.js'
import { initFretboardSvg, showFretMark, hideFretMark } from './fretboard.js'
import { fretboardNotes } from './chord.js'

let guitarBuffer
let pianoBuffer
let lastClickedFret = null // 最後にクリックされたフレット情報 { stringIndex, fretIndex }
let hideTimer = null // 音名を非表示にするためのタイマーID
let selectedInstrument = 'guitar'

document.addEventListener('DOMContentLoaded', async () => {
  const fretboardSvg = document.getElementById('fretboard_svg')
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

  // フレットボードのクリックイベントリスナー (イベントデリゲーション)
  fretboardSvg.addEventListener('click', (event) => {
    // クリックされた要素が .fret-position-group またはその子要素かを確認
    const fretGroup = event.target.closest('.fret-position-group')

    if (fretGroup) {
      // 以前のタイマーをクリア
      if (hideTimer) {
        clearTimeout(hideTimer)
        hideTimer = null
      }
      // 以前の表示をクリア
      if (lastClickedFret) {
        hideFretMark(lastClickedFret.stringIndex, lastClickedFret.fretIndex)
      }

      const stringIndex = parseInt(fretGroup.dataset.stringIndex, 10)
      const fretIndex = parseInt(fretGroup.dataset.fretboardCxIndex, 10)

      const noteNameWithOctave = fretboardNotes[stringIndex][fretIndex]
      const displayNoteName = noteNameWithOctave.split('_')[0]

      // 音名を表示
      showFretMark(stringIndex, fretIndex, displayNoteName, 'red', 'white')

      // 音を鳴らす
      const noteFrequency = calculateFrequency(noteNameWithOctave)
      if (noteFrequency) {
        if (selectedInstrument === 'guitar' && guitarBuffer) {
          playSound(guitarBuffer, noteFrequency, C4_BASE_FOR_GUITAR_WAV)
        } else if (selectedInstrument === 'piano' && pianoBuffer) {
          playSound(pianoBuffer, noteFrequency, A4_FREQUENCY)
        }
      }

      // 最後にクリックされたフレット情報を更新
      lastClickedFret = { stringIndex, fretIndex }

      // 5秒後に非表示にするタイマーを設定
      hideTimer = setTimeout(() => {
        hideFretMark(stringIndex, fretIndex)
      }, 5000)
    }
  })
})
