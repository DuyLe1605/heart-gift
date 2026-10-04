import { useState, useEffect, useRef } from 'react'
import { musicBox } from '../utils/musicBox'

export default function MusicPlayer({ isAutoPlayRequested, onMusicStateChange }) {
  const [isPlaying, setIsPlaying] = useState(false)
  const audioRef = useRef(null)

  // Đảm bảo dừng hoàn toàn tiếng synth cũ nếu còn sót lại
  useEffect(() => {
    musicBox.stop()
  }, [])

  // Khởi tạo audio duy nhất từ file /music.mp3
  useEffect(() => {
    const audio = new Audio('/music.mp3')
    audio.loop = true
    audio.volume = 0.55
    audio.preload = 'auto'
    audioRef.current = audio

    const handlePlaySuccess = () => {
      setIsPlaying(true)
      if (onMusicStateChange) onMusicStateChange(true)
    }

    // Lắng nghe sự kiện chạm đầu tiên bất kỳ trên màn hình để mở khóa phát nhạc MP3
    const unlockAndPlay = () => {
      if (audioRef.current) {
        audioRef.current.play().then(handlePlaySuccess).catch(() => {})
      }
      window.removeEventListener('click', unlockAndPlay)
      window.removeEventListener('touchstart', unlockAndPlay)
    }

    window.addEventListener('click', unlockAndPlay, { once: true })
    window.addEventListener('touchstart', unlockAndPlay, { once: true })

    return () => {
      window.removeEventListener('click', unlockAndPlay)
      window.removeEventListener('touchstart', unlockAndPlay)
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current = null
      }
    }
  }, [onMusicStateChange])

  // Khi người dùng chạm vào trái tim
  useEffect(() => {
    if (isAutoPlayRequested && !isPlaying && audioRef.current) {
      audioRef.current.play().then(() => {
        setIsPlaying(true)
        if (onMusicStateChange) onMusicStateChange(true)
      }).catch(() => {})
    }
  }, [isAutoPlayRequested, isPlaying, onMusicStateChange])

  const toggleMusic = () => {
    if (!audioRef.current) return

    if (isPlaying) {
      audioRef.current.pause()
      setIsPlaying(false)
      if (onMusicStateChange) onMusicStateChange(false)
    } else {
      audioRef.current.play().then(() => {
        setIsPlaying(true)
        if (onMusicStateChange) onMusicStateChange(true)
      }).catch(() => {})
    }
  }

  // Bỏ UI theo yêu cầu của người dùng, toàn bộ logic phát nhạc chạy ngầm mượt mà
  return null
}
