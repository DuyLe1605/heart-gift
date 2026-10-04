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
              Dành tặng cô gái ngành Du lịch & Khách sạn một góc nhỏ thật dịu dàng giữa những ngày bận rộn. 
              Biết là công việc ngành dịch vụ nhiều lúc vất vả lắm: những ca làm đứng mỏi rã rời đôi chân, 
              phải luôn giữ nụ cười thân thiện đón tiếp từng vị khách, cả những ngày vừa đi làm vừa ôn thi nhiều áp lực nữa.
            </p>

            <p className="letter-paragraph">
              Nhưng em biết không, sự ân cần, chu đáo và nụ cười rạng rỡ của em chính là điều tuyệt vời nhất 
              mang lại sự ấm áp cho mọi người xung quanh. 
              Người làm du lịch là người đem lại niềm vui và kỷ niệm đẹp cho bao hành trình của người khác, 
              nên em cũng xứng đáng nhận lại gấp mười lần niềm vui và sự dịu dàng như thế! ✨
            </p>

            <p className="letter-paragraph">
              Sau những giờ đứng ca mệt nhoài, về nhà nhớ ngâm chân nước ấm, ăn món thật ngon và ngủ một giấc thật sâu nhé. 
              Mong rằng mỗi ca làm của em đều trôi qua êm ả, gặp toàn khách dễ thương và được đánh giá 5 sao. 
              Chúc cô quản lý khách sạn tương lai luôn vững tin, xinh đẹp và tỏa sáng trên con đường em đã chọn! 🌷✈️🏨
            </p>

            <div className="letter-signature">
              <span className="signature-date">— Luôn ủng hộ và cổ vũ em —</span>
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
