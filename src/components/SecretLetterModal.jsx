import { useState } from 'react'

export default function SecretLetterModal({ isOpen, onClose }) {
  const [isOpening, setIsOpening] = useState(false)

  if (!isOpen) return null

  return (
    <div className="letter-backdrop" onClick={onClose}>
      <div className="letter-modal-container" onClick={(e) => e.stopPropagation()}>
        {/* Nút đóng góc trên */}
        <button className="letter-close-btn" onClick={onClose} aria-label="Đóng thư">
          ✕
        </button>

        {/* Bức thư giấy hoa văn vintage mở ra */}
        <div className="letter-paper">
          {/* Con dấu sáp niêm phong trang trí trên đầu thư */}
          <div className="letter-wax-seal">
            <span>💌</span>
          </div>

          <div className="letter-content-scroll">
            <h3 className="letter-greeting">Gửi Mphuong,</h3>

            <p className="letter-paragraph">
              Dành tặng em một góc nhỏ thật dịu dàng giữa những ngày bận rộn. 
              Chúc em luôn giữ được nụ cười tươi tắn và năng lượng tích cực, 
              vì nụ cười của em thực sự rất tỏa sáng đấy! ✨
            </p>

            <p className="letter-paragraph">
              Mong rằng mỗi ngày thức dậy, em đều tìm thấy thật nhiều niềm vui nhỏ bé: 
              một buổi sáng mát mẻ, một ly đồ uống ngọt ngào, hay chỉ đơn giản là một ngày mọi thứ đều suôn sẻ. 
              Nếu có những lúc thấy mệt mỏi hay áp lực, nhớ cho bản thân được nghỉ ngơi, 
              ăn món mình thích và ngủ thật ngon nhé. 🌸
            </p>

            <p className="letter-paragraph">
              Cứ tự tin là chính mình, phiên bản rạng rỡ và đáng yêu nhất. 
              Chúc Mphuong luôn bình yên, may mắn và ngập tràn hạnh phúc! 🌷
            </p>

            <div className="letter-signature">
              <span className="signature-date">— Một ngày thật đẹp —</span>
              <span className="signature-name">From someone who cares ✨</span>
            </div>
          </div>

          {/* Nút gấp thư lại */}
          <div className="letter-actions">
            <button className="letter-fold-btn" onClick={onClose}>
              💌 Gấp thư lại & cất giữ
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
