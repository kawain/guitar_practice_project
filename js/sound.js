const A4_FREQUENCY = 440 // 基準となるA4の周波数 (Hz)
const SEMITONE_RATIO = Math.pow(2, 1 / 12) // 半音ごとの周波数比

// 音名とオクターブを半音数にマッピングするためのオフセット
// G#, D#, A# はそれぞれ Ab, Eb, Bb に統一
const NOTE_TO_SEMITONE_OFFSET = {
  C: 0,
  'C#': 1,
  D: 2,
  Eb: 3,
  E: 4,
  F: 5,
  'F#': 6,
  G: 7,
  Ab: 8,
  A: 9,
  Bb: 10,
  B: 11
}

/**
 * 音名 (例: 'C_4', 'A#_5') から周波数を計算します。
 * @param {string} noteName - 音名とオクターブ (例: 'C_4', 'A#_5')
 * @returns {number} 計算された周波数 (Hz)
 */
function calculateFrequency (noteName) {
  const match = noteName.match(/([A-G][b#]?)_?([0-9])/)
  if (!match) {
    console.error('Invalid note name format:', noteName)
    return 0
  }

  const baseNote = match[1] // 例: 'A', 'C#'
  const octave = parseInt(match[2], 10) // 例: 4, 5

  // NOTE_TO_SEMITONE_OFFSET に存在しない音名が渡された場合の対応
  if (NOTE_TO_SEMITONE_OFFSET[baseNote] === undefined) {
    console.error('Note name not found in offset map:', baseNote)
    return 0
  }

  // C0を基準とした半音数を計算 (C0 = 0, C#0 = 1, D0 = 2, ..., A4 = 57, C6 = 72)
  // オクターブ番号が0から始まるため、(octave * 12) + NOTE_TO_SEMITONE_OFFSET[baseNote]
  // 例: A4の場合: (4 * 12) + 9 = 48 + 9 = 57
  const semitonesFromC0 = octave * 12 + NOTE_TO_SEMITONE_OFFSET[baseNote]

  // A4 (440Hz) は C0 から数えて 57 半音目
  const semitonesFromA4 = semitonesFromC0 - (4 * 12 + NOTE_TO_SEMITONE_OFFSET['A']) // A4はC0から57半音

  return A4_FREQUENCY * Math.pow(SEMITONE_RATIO, semitonesFromA4)
}

// Guitar-C4.wavの基本周波数を動的に計算して定義
const C4_BASE_FOR_GUITAR_WAV = calculateFrequency('C_4')

let audioContext = null
let masterGainNode = null
const audioBuffers = {} // 読み込んだAudioBufferをキャッシュする

/**
 * AudioContextを初期化し、マスターゲインノードを設定します。
 * ユーザーのインタラクション後に呼び出す必要があります。
 */
function initAudioContext () {
  if (!audioContext) {
    audioContext = new (window.AudioContext || window.webkitAudioContext)()
    masterGainNode = audioContext.createGain()
    masterGainNode.connect(audioContext.destination)
    masterGainNode.gain.value = 0.5 // デフォルト音量
    console.log('AudioContext initialized.')
  }
}

/**
 * 指定されたサウンドファイルを読み込み、AudioBufferとしてキャッシュします。
 * @param {string} url - サウンドファイルのURL
 * @returns {Promise<AudioBuffer>} AudioBufferを解決するPromise
 */
async function loadSound (url) {
  if (audioBuffers[url]) {
    return audioBuffers[url]
  }

  if (!audioContext) {
    console.warn('AudioContext has not been initialized. It will be initialized now. Ensure this is triggered by user interaction.')
    initAudioContext()
  }

  try {
    const response = await fetch(url)
    const arrayBuffer = await response.arrayBuffer()
    const audioBuffer = await audioContext.decodeAudioData(arrayBuffer)
    audioBuffers[url] = audioBuffer
    console.log(`Sound loaded: ${url}`)
    return audioBuffer
  } catch (error) {
    console.error(`Failed to load sound from ${url}:`, error)
    throw error
  }
}

/**
 * 指定されたAudioBufferを再生します。
 * @param {AudioBuffer} buffer - 再生するAudioBuffer
 * @param {number} targetFrequency - 再生する音の目標周波数 (ピッチ調整用)
 * @param {number} baseFrequency - AudioBufferの元の音の周波数 (例: C4_BASE_FOR_GUITAR_WAV)
 */
function playSound (buffer, targetFrequency, baseFrequency) {
  if (!audioContext || !masterGainNode) {
    console.error('AudioContext or MasterGainNode is not initialized. Call initAudioContext() first.')
    return
  }

  if (!buffer) {
    console.warn('No audio buffer provided for playback.')
    return
  }

  const source = audioContext.createBufferSource()
  source.buffer = buffer
  source.connect(masterGainNode)

  // ピッチ調整: playbackRate = targetFrequency / baseFrequency
  if (baseFrequency && targetFrequency && baseFrequency !== 0) {
    source.playbackRate.value = targetFrequency / baseFrequency
  } else {
    source.playbackRate.value = 1 // ピッチ調整なし
  }

  source.start(0)
}

/**
 * マスター音量を設定します。
 * @param {number} volume - 0.0から1.0までの音量値
 */
function setMasterVolume (volume) {
  if (masterGainNode) {
    masterGainNode.gain.value = volume
  } else {
    console.warn('MasterGainNode is not initialized. Volume cannot be set.')
  }
}

export { calculateFrequency, C4_BASE_FOR_GUITAR_WAV, A4_FREQUENCY, initAudioContext, loadSound, playSound, setMasterVolume }
