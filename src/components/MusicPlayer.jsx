import { useState, useEffect, useRef } from 'react'
import { musicBox } from '../utils/musicBox'

export default function MusicPlayer({ isAutoPlayRequested }) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [useMp3, setUseMp3] = useState(false)
  const audioRef = useRef(null)

  // Khởi tạo audio từ file /music.mp3
  useEffect(() => {
    const audio = new Audio('/music.mp3')
    audio.loop = true
    audio.volume = 0.55

    const handleCanPlay = () => {
      setUseMp3(true)
    }

    const handleError = () => {
      // Nếu file MP3 lỗi hoặc không tải được -> chuyển sang Hộp nhạc Kalimba
      setUseMp3(false)
    }

    audio.addEventListener('canplay', handleCanPlay)
    audio.addEventListener('loadeddata', handleCanPlay)
    audio.addEventListener('error', handleError)
    audio.load()

    audioRef.current = audio

    return () => {
      audio.removeEventListener('canplay', handleCanPlay)
      audio.removeEventListener('loadeddata', handleCanPlay)
      audio.removeEventListener('error', handleError)
      audio.pause()
      audioRef.current = null
      musicBox.stop()
    }
  }, [])

  // Tự động bật nhạc khi chạm vào trái tim lần đầu tiên
  useEffect(() => {
    if (isAutoPlayRequested && !isPlaying) {
      startPlay()
    }
  }, [isAutoPlayRequested])

  const startPlay = () => {
    if (audioRef.current) {
      audioRef.current.play().then(() => {
        setIsPlaying(true)
      }).catch(() => {
        // Fallback sang Kalimba nếu trình duyệt chặn phát MP3 tự động
        musicBox.start()
        setIsPlaying(true)
      })
    } else {
      musicBox.start()
      setIsPlaying(true)
    }
  }

  const stopPlay = () => {
    if (audioRef.current) {
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
        title={isPlaying ? 'Tạm dừng nhạc' : 'Bật nhạc lãng mạn'}
        aria-label="Toggle music"
      >
        {/* Nốt nhạc bay lơ lửng khi phát nhạc */}
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
        {isPlaying ? 'Giai điệu lãng mạn 🎶' : 'Bật nhạc 🎵'}
      </span>
    </div>
  )
}
