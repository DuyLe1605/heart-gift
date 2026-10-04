import { useState, useEffect, useRef } from 'react'
import { musicBox } from '../utils/musicBox'

export default function MusicPlayer({ isAutoPlayRequested }) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [useMp3, setUseMp3] = useState(false)
  const audioRef = useRef(null)

  // Kiểm tra xem có file /music.mp3 trong thư mục public không
  useEffect(() => {
    const audio = new Audio('/music.mp3')
    audio.loop = true
    audio.volume = 0.5

    audio.addEventListener('canplaythrough', () => {
      setUseMp3(true)
    })

    audio.addEventListener('error', () => {
      // Không có file MP3 -> Dùng Music Box Kalimba Synth
      setUseMp3(false)
    })

    audioRef.current = audio

    return () => {
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current = null
      }
      musicBox.stop()
    }
  }, [])

  // Bật nhạc khi có yêu cầu (ví dụ khi chạm vào trái tim lần đầu tiên)
  useEffect(() => {
    if (isAutoPlayRequested && !isPlaying) {
      startPlay()
    }
  }, [isAutoPlayRequested])

  const startPlay = () => {
    if (useMp3 && audioRef.current) {
      audioRef.current.play().then(() => {
        setIsPlaying(true)
      }).catch(() => {
        // Fallback sang Kalimba nếu MP3 bị chặn
        musicBox.start()
        setIsPlaying(true)
      })
    } else {
      musicBox.start()
      setIsPlaying(true)
    }
  }

  const stopPlay = () => {
    if (useMp3 && audioRef.current) {
      audioRef.current.pause()
    }
    musicBox.stop()
    setIsPlaying(false)
  }

  const toggleMusic = () => {
    if (isPlaying) {
      stopPlay()
    } else {
      startPlay()
    }
  }

  return (
    <div className="music-player-widget">
      <button
        className={`vinyl-disc-btn ${isPlaying ? 'spinning' : ''}`}
        onClick={toggleMusic}
        title={isPlaying ? 'Tạm dừng nhạc' : 'Bật nhạc hộp nhạc du dương'}
        aria-label="Toggle music"
      >
        {/* Nốt nhạc bay lơ lửng khi đang phát nhạc */}
        {isPlaying && (
          <div className="music-notes-container">
            <span className="note note-1">🎵</span>
            <span className="note note-2">🎶</span>
            <span className="note note-3">✨</span>
          </div>
        )}

        {/* Thiết kế Đĩa than Mini */}
        <div className="vinyl-grooves">
          <div className="vinyl-center-label">
            <span className="music-icon">{isPlaying ? '🎧' : '🎵'}</span>
          </div>
        </div>
      </button>

      {/* Label nhỏ tinh tế */}
      <span className="music-label-tag">
        {isPlaying ? 'Đang phát nhạc 🎶' : 'Bật nhạc 🎵'}
      </span>
    </div>
  )
}
