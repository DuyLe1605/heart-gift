import { useState, useEffect, useRef } from 'react'
import { musicBox } from '../utils/musicBox'

export default function MusicPlayer({ isAutoPlayRequested, onMusicStateChange }) {
  const [isPlaying, setIsPlaying] = useState(false)
  const audioRef = useRef(null)

  // Khởi tạo audio từ file /music.mp3
  useEffect(() => {
    const audio = new Audio('/music.mp3')
    audio.loop = true
    audio.volume = 0.55
    audio.preload = 'auto'
    audioRef.current = audio

    // Thử autoplay ngay khi load trang
    const tryAutoplay = () => {
      audio.play().then(() => {
        setIsPlaying(true)
        if (onMusicStateChange) onMusicStateChange(true)
      }).catch(() => {
        // Trình duyệt chặn autoplay -> Đợi cú chạm đầu tiên bất kỳ trên màn hình
        const unlockAudio = () => {
          audio.play().then(() => {
            setIsPlaying(true)
            if (onMusicStateChange) onMusicStateChange(true)
          }).catch(() => {
            musicBox.start()
            setIsPlaying(true)
            if (onMusicStateChange) onMusicStateChange(true)
          })
          window.removeEventListener('click', unlockAudio)
          window.removeEventListener('touchstart', unlockAudio)
          window.removeEventListener('keydown', unlockAudio)
        }

        window.addEventListener('click', unlockAudio, { once: true })
        window.addEventListener('touchstart', unlockAudio, { once: true })
        window.addEventListener('keydown', unlockAudio, { once: true })
      })
    }

    tryAutoplay()

    return () => {
      audio.pause()
      audioRef.current = null
      musicBox.stop()
    }
  }, [onMusicStateChange])

  // Khi có trigger từ ngoài (ví dụ bấm nút Mở quà hoặc chạm tim)
  useEffect(() => {
    if (isAutoPlayRequested && !isPlaying) {
      startPlay()
    }
  }, [isAutoPlayRequested])

  const startPlay = () => {
    if (audioRef.current) {
      audioRef.current.play().then(() => {
        setIsPlaying(true)
        if (onMusicStateChange) onMusicStateChange(true)
      }).catch(() => {
        musicBox.start()
        setIsPlaying(true)
        if (onMusicStateChange) onMusicStateChange(true)
      })
    } else {
      musicBox.start()
      setIsPlaying(true)
      if (onMusicStateChange) onMusicStateChange(true)
    }
  }

  const stopPlay = () => {
    if (audioRef.current) {
      audioRef.current.pause()
    }
    musicBox.stop()
    setIsPlaying(false)
    if (onMusicStateChange) onMusicStateChange(false)
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
