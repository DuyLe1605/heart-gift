import { useState, useEffect, useCallback, useRef } from 'react'
import Scene from './components/Scene'
import FortuneModal from './components/FortuneModal'
import MusicPlayer from './components/MusicPlayer'
import { fortuneCards } from './data/fortuneCards'

/**
 * Hiệu ứng âm thanh ngọt ngào tinh thể bằng Web Audio API
 */
function playChimeSound(freqMultiplier = 1) {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext
    if (!AudioContext) return
    const ctx = new AudioContext()

    const baseNotes = [523.25, 587.33, 659.25, 783.99, 880.00, 1046.50, 1174.66, 1318.51]
    const note = baseNotes[Math.floor(Math.random() * baseNotes.length)] * freqMultiplier

    const osc = ctx.createOscillator()
    const gain = ctx.createGain()

    osc.type = 'sine'
    osc.frequency.setValueAtTime(note, ctx.currentTime)
    osc.frequency.exponentialRampToValueAtTime(note * 1.35, ctx.currentTime + 0.22)

    gain.gain.setValueAtTime(0.12, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.45)

    osc.connect(gain)
    gain.connect(ctx.destination)

    osc.start()
    osc.stop(ctx.currentTime + 0.45)
  } catch (err) {}
}

function playCardMagicSound() {
  // Tắt hợp âm synth để tránh bị lẫn vào bản nhạc piano MP3 chính
}


const gentleStickers = ['🌸', '✨', '💖', '🌷', '🦋', '⭐', '💫', '🎀']

const cuteStickers = [
  '💖', '🌸', '🎀', '🧸', '🍓', '🌷', '✨', '🍰', '🐱', '💫', '🍭', '🌻',
  '🎈', '🐇', '🌼', '⭐', '🌈', '🍒', '🧋', '💌'
]

const cuteFloatingTexts = [
  '🌸 Mphuong xinkk',
  '✨ Xinh xỉuuu',
  '💯 10 điểm!',
  '🎀 Siêu đáng yêu',
  '☀️ Cười lên nèee',
  '🌟 Tỏa sáng nha',
  '🌷 Xinh tươi rạng rỡ',
  '🍀 May mắn ngập tràn',
  '🧸 Dễ thương x100',
  '💖 Rạng rỡ mỗi ngày',
  '🦋 Xinh nhất quả đất',
  '🍓 Năng lượng tích cực',
  '🍰 Ngọt ngào cute',
  '🥰 Mphuong number 1',
  '🧋 Uống trà sữa hông?',
  '🎉 Vui vẻ cả ngày nha',
  '💐 Mãi luôn yêu đời',
  '🌈 Bình yên & rực rỡ',
]

export default function App() {
  const [loading, setLoading] = useState(true)
  const [floatingItems, setFloatingItems] = useState([])
  const [hasTappedHeart, setHasTappedHeart] = useState(false)
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [musicPlayTrigger, setMusicPlayTrigger] = useState(false)
  
  // State quản lý Modal Bốc quẻ may mắn
  const [isFortuneOpen, setIsFortuneOpen] = useState(false)
  const [currentCard, setCurrentCard] = useState(fortuneCards[0])

  const itemIdRef = useRef(0)

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1200)
    return () => clearTimeout(timer)
  }, [])

  // Hàm sinh item (thông điệp hoặc sticker)
  const createItem = useCallback((forceType = null, isAmbient = false) => {
    const id = itemIdRef.current++
    
    const isText = forceType 
      ? forceType === 'text' 
      : isAmbient 
        ? Math.random() < 0.15 
        : Math.random() < 0.55

    if (isText) {
      const text = cuteFloatingTexts[Math.floor(Math.random() * cuteFloatingTexts.length)]
      return {
        id,
        type: 'text',
        content: text,
        x: 8 + Math.random() * 78,
        duration: 6.5 + Math.random() * 3.5,
        delay: Math.random() * 0.2,
        scale: 0.85 + Math.random() * 0.2,
        drift: (Math.random() - 0.5) * 30,
      }
    } else {
      const stickersPool = isAmbient ? gentleStickers : cuteStickers
      const sticker = stickersPool[Math.floor(Math.random() * stickersPool.length)]
      return {
        id,
        type: 'sticker',
        content: sticker,
        x: 10 + Math.random() * 75,
        duration: 5.8 + Math.random() * 3.0,
        delay: Math.random() * 0.2,
        scale: 1.15 + Math.random() * 0.35,
        drift: (Math.random() - 0.5) * 30,
      }
    }
  }, [])

  // Sinh item bay lơ lửng êm đềm
  useEffect(() => {
    const intervalTime = hasTappedHeart ? 1400 : 2400

    const interval = setInterval(() => {
      const newItem = createItem(null, !hasTappedHeart)
      const maxCount = hasTappedHeart ? 16 : 6

      setFloatingItems((prev) => [...prev.slice(-maxCount), newItem])

      setTimeout(() => {
        setFloatingItems((prev) => prev.filter((i) => i.id !== newItem.id))
      }, (newItem.duration + newItem.delay + 0.5) * 1000)
    }, intervalTime)

    return () => clearInterval(interval)
  }, [createItem, hasTappedHeart])

  // CHẠM VÀO TRÁI TIM: TỰ ĐỘNG BẬT NHẠC + MỞ THẺ BÀI GACHA
  const handleHeartTap = useCallback(() => {
    setHasTappedHeart(true)
    setMusicPlayTrigger(true) // Tự động phát nhạc ngay khi người dùng bấm trái tim!

    // Bắn nhẹ chùm hạt sao & sticker lấp lánh
    for (let i = 0; i < 6; i++) {
      setTimeout(() => {
        const item = createItem(i % 2 === 0 ? 'text' : 'sticker', false)
        setFloatingItems((prev) => [...prev.slice(-18), item])
        setTimeout(() => {
          setFloatingItems((prev) => prev.filter((it) => it.id !== item.id))
        }, (item.duration + 0.5) * 1000)
      }, i * 70)
    }

    // Chọn ngẫu nhiên 1 quẻ may mắn
    const randomIndex = Math.floor(Math.random() * fortuneCards.length)
    setCurrentCard(fortuneCards[randomIndex])

    // Sau nhịp tim nảy lên thì mở thẻ bài ma thuật
    setTimeout(() => {
      setIsFortuneOpen(true)
      if (soundEnabled) {
        playCardMagicSound()
      }
    }, 280)
  }, [createItem, soundEnabled])

  // Bốc quẻ khác trong modal
  const handleReroll = () => {
    if (soundEnabled) playChimeSound(1.3)
    let nextIndex
    do {
      nextIndex = Math.floor(Math.random() * fortuneCards.length)
    } while (fortuneCards.length > 1 && fortuneCards[nextIndex].id === currentCard.id)
    
    setCurrentCard(fortuneCards[nextIndex])
  }

  const handleCloseFortune = () => {
    setIsFortuneOpen(false)
  }

  // Chạm vào sticker/thông điệp đang bay
  const handleItemClick = (e, id) => {
    e.stopPropagation()
    if (soundEnabled) playChimeSound(1.4)
    setFloatingItems((prev) => prev.filter((item) => item.id !== id))
  }

  return (
    <>
      {/* Loading Screen nhẹ nhàng ban đầu */}
      <div className={`loading-screen ${!loading ? 'hidden' : ''}`}>
        <div className="loading-heart" />
        <div className="loading-text">Đang chuẩn bị điều bất ngờ... ✨</div>
      </div>

      {/* 3D Canvas - Vào thẳng không gian trái tim */}
      <div className="canvas-container">
        <Scene onHeartTap={handleHeartTap} />
      </div>

      {/* Tiêu đề chính trang web */}
      <div className="title-text">
        <h1>Mphuong xinkk</h1>
        <div className="subtitle">✨ A Special Gift For You ✨</div>
      </div>

      {/* Trình phát nhạc Mini Đĩa Than Siêu Cute */}
      <MusicPlayer isAutoPlayRequested={musicPlayTrigger} />

      {/* Thông điệp & Sticker bay lên êm dịu */}
      <div className="floating-items-container">
        {floatingItems.map((item) => (
          <div
            key={item.id}
            className={`floating-item ${item.type === 'text' ? 'floating-text-bubble' : 'floating-sticker'}`}
            style={{
              left: `${item.x}%`,
              animationDuration: `${item.duration}s`,
              animationDelay: `${item.delay}s`,
              transform: `scale(${item.scale})`,
              '--drift-x': `${item.drift}px`,
            }}
            onClick={(e) => handleItemClick(e, item.id)}
          >
            {item.content}
          </div>
        ))}
      </div>

      {/* HƯỚNG DẪN CHẠM VÀO TRÁI TIM ĐỂ BỐC QUẺ & NGHE NHẠC */}
      <div className="interactive-cue-wrapper">
        <div
          className={`heart-tap-guide ${isFortuneOpen ? 'fade-out' : ''}`}
          onClick={handleHeartTap}
        >
          <span className="sparkle-icon">🔮</span>
          <span className="guide-text">Chạm vào tim để bốc quẻ may mắn nè</span>
          <span className="pulse-beacon"></span>
        </div>
      </div>

      {/* MODAL THẺ BÀI MA THUẬT GACHA MAY MẮN */}
      <FortuneModal
        card={currentCard}
        isOpen={isFortuneOpen}
        onClose={handleCloseFortune}
        onReroll={handleReroll}
      />

      {/* Gợi ý xoay màn hình ở đáy */}
      <div className="tap-hint">
        <span>Vuốt xoay 360° để ngắm trái tim pha lê</span>
      </div>
    </>
  )
}
