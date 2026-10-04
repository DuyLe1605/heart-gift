/**
 * Hộp nhạc Kalimba / Music Box du dương bằng Web Audio API
 * Tự động chơi giai điệu êm ái, chữa lành, không phụ thuộc vào mạng internet
 */

// Giai điệu Canon in D / Lofi lãng mạn nhẹ nhàng
const melodyNotes = [
  // Đoạn 1
  { note: 'E5', duration: 0.8 },
  { note: 'D5', duration: 0.8 },
  { note: 'C5', duration: 0.8 },
  { note: 'B4', duration: 0.8 },
  { note: 'A4', duration: 0.8 },
  { note: 'G4', duration: 0.8 },
  { note: 'A4', duration: 0.8 },
  { note: 'B4', duration: 0.8 },

  // Đoạn 2
  { note: 'C5', duration: 0.6 },
  { note: 'E5', duration: 0.6 },
  { note: 'G5', duration: 0.8 },
  { note: 'E5', duration: 0.4 },
  { note: 'D5', duration: 0.6 },
  { note: 'F5', duration: 0.6 },
  { note: 'A5', duration: 0.8 },
  { note: 'F5', duration: 0.4 },

  // Đoạn 3 - Cao trào ngọt ngào
  { note: 'G5', duration: 0.6 },
  { note: 'E5', duration: 0.4 },
  { note: 'F5', duration: 0.4 },
  { note: 'G5', duration: 0.8 },
  { note: 'A5', duration: 0.6 },
  { note: 'G5', duration: 0.4 },
  { note: 'F5', duration: 0.4 },
  { note: 'E5', duration: 0.8 },

  // Đoạn 4 - Lắng dịu
  { note: 'D5', duration: 0.8 },
  { note: 'C5', duration: 0.8 },
  { note: 'B4', duration: 0.8 },
  { note: 'C5', duration: 1.4 },
]

// Nốt đệm trầm (Bass chords)
const bassNotes = [
  { note: 'C3', duration: 3.2 },
  { note: 'G3', duration: 3.2 },
  { note: 'A3', duration: 3.2 },
  { note: 'E3', duration: 3.2 },
  { note: 'F3', duration: 3.2 },
  { note: 'C3', duration: 3.2 },
  { note: 'F3', duration: 3.2 },
  { note: 'G3', duration: 3.2 },
]

const noteFrequencies = {
  C3: 130.81, G3: 196.00, A3: 220.00, E3: 164.81, F3: 174.61,
  G4: 392.00, A4: 440.00, B4: 493.88,
  C5: 523.25, D5: 587.33, E5: 659.25, F5: 698.46, G5: 783.99, A5: 880.00,
}

class MusicBoxPlayer {
  constructor() {
    this.ctx = null
    this.isPlaying = false
    this.melodyTimer = null
    this.bassTimer = null
    this.melodyIndex = 0
    this.bassIndex = 0
  }

  init() {
    if (!this.ctx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext
      if (AudioContext) {
        this.ctx = new AudioContext()
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume()
    }
  }

  // Chơi 1 nốt Kalimba trong trẻo
  playKalimbaNote(freq, isBass = false) {
    if (!this.ctx || !freq) return

    const now = this.ctx.currentTime

    // Tạo bộ dao động chính (sine wave)
    const osc1 = this.ctx.createOscillator()
    osc1.type = 'sine'
    osc1.frequency.setValueAtTime(freq, now)

    // Họa âm leng keng đặc trưng của hộp nhạc (harmonic overtone)
    const osc2 = this.ctx.createOscillator()
    osc2.type = 'triangle'
    osc2.frequency.setValueAtTime(freq * (isBass ? 2 : 3), now)

    // Bộ khuếch đại (Gain Envelope)
    const gain1 = this.ctx.createGain()
    const gain2 = this.ctx.createGain()

    const volume = isBass ? 0.05 : 0.08
    const decay = isBass ? 2.5 : 1.8

    gain1.gain.setValueAtTime(volume, now)
    gain1.gain.exponentialRampToValueAtTime(0.0001, now + decay)

    gain2.gain.setValueAtTime(volume * 0.35, now)
    gain2.gain.exponentialRampToValueAtTime(0.0001, now + decay * 0.6)

    // Kết nối
    osc1.connect(gain1)
    gain1.connect(this.ctx.destination)

    osc2.connect(gain2)
    gain2.connect(this.ctx.destination)

    osc1.start(now)
    osc1.stop(now + decay)

    osc2.start(now)
    osc2.stop(now + decay)
  }

  start() {
    this.init()
    if (this.isPlaying) return
    this.isPlaying = true
    this.melodyIndex = 0
    this.bassIndex = 0

    this.playNextMelody()
    this.playNextBass()
  }

  playNextMelody() {
    if (!this.isPlaying) return

    const current = melodyNotes[this.melodyIndex]
    const freq = noteFrequencies[current.note]
    this.playKalimbaNote(freq, false)

    this.melodyIndex = (this.melodyIndex + 1) % melodyNotes.length

    this.melodyTimer = setTimeout(() => {
      this.playNextMelody()
    }, current.duration * 1000)
  }

  playNextBass() {
    if (!this.isPlaying) return

    const current = bassNotes[this.bassIndex]
    const freq = noteFrequencies[current.note]
    this.playKalimbaNote(freq, true)

    this.bassIndex = (this.bassIndex + 1) % bassNotes.length

    this.bassTimer = setTimeout(() => {
      this.playNextBass()
    }, current.duration * 1000)
  }

  stop() {
    this.isPlaying = false
    if (this.melodyTimer) clearTimeout(this.melodyTimer)
    if (this.bassTimer) clearTimeout(this.bassTimer)
  }

  toggle() {
    if (this.isPlaying) {
      this.stop()
      return false
    } else {
      this.start()
      return true
    }
  }
}

export const musicBox = new MusicBoxPlayer()
