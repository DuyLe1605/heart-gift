import { useState, useEffect, useCallback, useRef } from 'react'
import Scene from './components/Scene'

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

// Sticker nhẹ nhàng lúc bình thường
const gentleStickers = ['🌸', '✨', '💖', '🌷', '🦋', '⭐', '💫', '🎀']

// Bộ sticker phong phú khi bấm tim
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

const bigMessages = [
  'Mphuong xinh xỉuuu! ✨',
  'Hôm nay vui vẻ nha! 🌸',
  'Xinh xắn, đáng yêu 10 điểm! 💯',
  'Nụ cười tỏa nắng luôn nè ☀️',
  'Chúc Mphuong luôn rạng rỡ & may mắn 🍀',
  'Xinh đẹp tuyệt vời ông mặt trời 🌟',
  'Mphuong xinkk nhất quả đất! ✌️',
  'Luôn tự tin và tỏa sáng nha! 💫',
  'Hôm nay có ai khen Mphuong xinh chưa? Chưa thì đây khen nè! 😆💖',
  'Ăn ngon ngủ ngoan, không thức khuya nha! 🌙',
  'Cô gái siêu cute và nhiều năng lượng 🌷',
  'Mong mọi điều dễ thương nhất sẽ đến với bạn! 🎀',
]

export default function App() {
  const [loading, setLoading] = useState(true)
  const [floatingItems, setFloatingItems] = useState([])
  const [bigMsg, setBigMsg] = useState(bigMessages[0])
  const [hasTappedHeart, setHasTappedHeart] = useState(false)
  const [bigMsgVisible, setBigMsgVisible] = useState(false)
  const [soundEnabled, setSoundEnabled] = useState(true)
  const itemIdRef = useRef(0)
  const idleTimerRef = useRef(null)

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1600)
    return () => clearTimeout(timer)
  }, [])

  // Hàm sinh item (thông điệp hoặc sticker)
  const createItem = useCallback((forceType = null, isAmbient = false) => {
    const id = itemIdRef.current++
    
    // Nếu là lúc chưa bấm (ambient): 85% là sticker nhẹ, chỉ 15% là text ngắn
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
        duration: 6.5 + Math.random() * 3.5, // Bay êm đềm, chậm rãi
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

  // KHI CHƯA BẤM TRÁI TIM: Thả rất ít và thưa thớt (2.2s mới sinh 1 cái, tối đa 5-6 cái trên màn hình)
  useEffect(() => {
    const intervalTime = hasTappedHeart ? 1200 : 2200

    const interval = setInterval(() => {
      // Khi chưa bấm: sinh dạng ambient nhẹ nhàng
      const newItem = createItem(null, !hasTappedHeart)
      const maxCount = hasTappedHeart ? 16 : 6

      setFloatingItems((prev) => [...prev.slice(-maxCount), newItem])

      setTimeout(() => {
        setFloatingItems((prev) => prev.filter((i) => i.id !== newItem.id))
      }, (newItem.duration + newItem.delay + 0.5) * 1000)
    }, intervalTime)

    return () => clearInterval(interval)
  }, [createItem, hasTappedHeart])

  // CHẠM VÀO TRÁI TIM: BÙNG NỔ THÔNG ĐIỆP + STICKER BẤT NGỜ
  const handleHeartTap = useCallback(() => {
    setHasTappedHeart(true)

    if (soundEnabled) {
      playChimeSound(1.2)
    }

    // Bắn chùm 8 item rực rỡ bay lên
    for (let i = 0; i < 8; i++) {
      setTimeout(() => {
        const item = createItem(i % 2 === 0 ? 'text' : 'sticker', false)
        setFloatingItems((prev) => [...prev.slice(-20), item])
        setTimeout(() => {
          setFloatingItems((prev) => prev.filter((it) => it.id !== item.id))
        }, (item.duration + 0.5) * 1000)
      }, i * 80)
    }

    // Hiện câu chúc mới
    const newMsg = bigMessages[Math.floor(Math.random() * bigMessages.length)]
    setBigMsg(newMsg)
    setBigMsgVisible(true)

    // Tự ẩn câu chúc sau 3.8s
    if (idleTimerRef.current) clearTimeout(idleTimerRef.current)
    idleTimerRef.current = setTimeout(() => {
      setBigMsgVisible(false)
      // Sau 2s trở về trạng thái yên ả ban đầu
      setTimeout(() => setHasTappedHeart(false), 2000)
    }, 3800)
  }, [createItem, soundEnabled])

  // Chạm vào sticker/thông điệp đang bay: nổ bụp vui tai
  const handleItemClick = (e, id) => {
    e.stopPropagation()
    if (soundEnabled) playChimeSound(1.4)
    setFloatingItems((prev) => prev.filter((item) => item.id !== id))
  }

  return (
    <>
      {/* Loading Screen */}
      <div className={`loading-screen ${!loading ? 'hidden' : ''}`}>
        <div className="loading-heart" />
        <div className="loading-text">Đang chuẩn bị điều bất ngờ... ✨</div>
      </div>

      {/* 3D Canvas */}
      <div className="canvas-container">
        <Scene onHeartTap={handleHeartTap} />
      </div>

      {/* Tiêu đề chính trang web */}
      <div className="title-text">
        <h1>Mphuong xinkk</h1>
        <div className="subtitle">✨ A Special Gift For You ✨</div>
      </div>

      {/* Nút bật/tắt âm thanh chuông */}
      <button
        className="music-toggle"
        onClick={() => setSoundEnabled((prev) => !prev)}
        title={soundEnabled ? 'Tắt âm thanh' : 'Bật âm thanh'}
        aria-label="Toggle sound"
      >
        {soundEnabled ? '🔔' : '🔕'}
      </button>

      {/* Thông điệp & Sticker bay lên */}
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

      {/* HƯỚNG DẪN CHẠM VÀO TRÁI TIM TINH TẾ */}
      <div className="interactive-cue-wrapper">
        <div
          className={`heart-tap-guide ${hasTappedHeart || bigMsgVisible ? 'fade-out' : ''}`}
          onClick={handleHeartTap}
        >
          <span className="sparkle-icon">✨</span>
          <span className="guide-text">Chạm khẽ vào trái tim nè</span>
          <span className="pulse-beacon"></span>
        </div>

        {/* Hộp câu chúc ngẫu nhiên (nổi bật lên khi chạm tim) */}
        <div
          className={`bottom-message ${bigMsgVisible ? 'visible' : ''}`}
          onClick={handleHeartTap}
        >
          <div className="message-badge">
            <p>{bigMsg}</p>
          </div>
        </div>
      </div>

      {/* Gợi ý xoay màn hình ở đáy */}
      <div className="tap-hint">
        <span>Vuốt xoay 360° để ngắm trái tim pha lê</span>
      </div>
    </>
  )
}
