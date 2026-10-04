import { useState, useEffect } from 'react'

export default function FortuneModal({ card, isOpen, onClose, onReroll }) {
  const [isFlipping, setIsFlipping] = useState(false)

  // Hiệu ứng lật thẻ khi đổi quẻ mới
  useEffect(() => {
    if (isOpen) {
      setIsFlipping(true)
      const timer = setTimeout(() => setIsFlipping(false), 450)
      return () => clearTimeout(timer)
    }
  }, [card, isOpen])

  if (!isOpen || !card) return null

  return (
    <div className="fortune-backdrop" onClick={onClose}>
      <div
        className={`fortune-card-container ${isFlipping ? 'flipping' : ''}`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Hào quang lấp lánh xung quanh thẻ */}
        <div className="card-aura-glow"></div>

        {/* Nội dung chính của Thẻ bài */}
        <div className="fortune-card">
          {/* Nút đóng góc phải */}
          <button className="card-close-btn" onClick={onClose} aria-label="Close">
            ✕
          </button>

          {/* Badge độ hiếm */}
          <div className={`card-badge badge-${card.badgeColor}`}>
            {card.badge}
          </div>

          {/* Icon đại diện to tròn, phát sáng */}
          <div className="card-icon-wrapper">
            <span className="card-main-icon">{card.icon}</span>
          </div>

          {/* Tên danh hiệu */}
          <h2 className="card-title">{card.title}</h2>

          {/* Chỉ số hôm nay */}
          <div className="card-stats-grid">
            <div className="stat-box">
              <span className="stat-label">Sắc đẹp</span>
              <span className="stat-value">{card.stats.beauty}</span>
            </div>
            <div className="stat-box">
              <span className="stat-label">May mắn</span>
              <span className="stat-value">{card.stats.luck}</span>
            </div>
            <div className="stat-box">
              <span className="stat-label">Tâm trạng</span>
              <span className="stat-value">{card.stats.mood}</span>
            </div>
          </div>

          {/* Lời tiên tri */}
          <div className="card-quote-box">
            <p className="card-quote">"{card.quote}"</p>
          </div>

          {/* Lời khuyên bí kíp */}
          <div className="card-tip-box">
            <p className="card-tip">{card.tip}</p>
          </div>

          {/* Hàng nút tương tác */}
          <div className="card-actions">
            <button className="card-btn reroll-btn" onClick={onReroll}>
              🎲 Bốc quẻ khác
            </button>
            <button className="card-btn accept-btn" onClick={onClose}>
              💖 Nhận vía may mắn
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
