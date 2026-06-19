import Modal from '../Modal/Modal.jsx'

export default function AicConsentModal({ open, onAccept, onClose }) {
  return (
    <Modal open={open} onClose={onClose} labelledBy="aic-title">
      <h2 id="aic-title">Gợi ý mở lời từ AI</h2>
      <p style={{ color: 'var(--color-text-soft)', lineHeight: 1.5 }}>
        Chúng tôi dùng AI để gợi ý câu mở lời dựa trên hồ sơ của đối phương. Tin nhắn gợi ý chỉ
        mang tính tham khảo — bạn có thể chỉnh sửa trước khi gửi. Bằng việc tiếp tục, bạn đồng ý
        cho phép SameMess dùng AI xử lý nội dung hồ sơ công khai.
      </p>
      <div className="modal-actions">
        <button type="button" className="btn btn-ghost" onClick={onClose}>Để sau</button>
        <button type="button" className="btn btn-primary" onClick={onAccept}>Đồng ý</button>
      </div>
    </Modal>
  )
}
