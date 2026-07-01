import { useCallback, useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { datePassService } from '../../../api'
import './Voucher.css'

const vnd = (n) => (n ?? 0).toLocaleString('vi-VN') + 'đ'
const fmtDate = (d) => (d ? new Date(d).toLocaleDateString('vi-VN') : '—')
const fmtDateTime = (d) => (d ? new Date(d).toLocaleString('vi-VN') : '—')

/**
 * Trang voucher CÔNG KHAI — quán quét QR mở ra (không cần đăng nhập).
 * Hiển thị đầy đủ thông tin buổi hẹn + nút để quán xác nhận "đã sử dụng".
 */
export default function Voucher() {
  const { orderId } = useParams()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [redeeming, setRedeeming] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)

  const load = useCallback(async () => {
    setLoading(true); setError('')
    try {
      setData(await datePassService.getVoucher(orderId))
    } catch (err) {
      setError(err?.message || 'Không tìm thấy voucher này.')
    } finally {
      setLoading(false)
    }
  }, [orderId])

  useEffect(() => { load() }, [load])

  const doRedeem = async () => {
    setRedeeming(true)
    try {
      const updated = await datePassService.redeemVoucher(orderId)
      setData(updated)
      setConfirmOpen(false)
    } catch (err) {
      setError(err?.message || 'Không xác nhận được voucher.')
    } finally {
      setRedeeming(false)
    }
  }

  const STATUS = {
    Pending: { label: 'Chưa thanh toán', cls: 'is-pending', icon: '⏳' },
    Paid: { label: 'Còn hiệu lực', cls: 'is-paid', icon: '✅' },
    Redeemed: { label: 'Đã sử dụng', cls: 'is-redeemed', icon: '🎉' },
    Cancelled: { label: 'Đã huỷ', cls: 'is-cancelled', icon: '⛔' },
  }

  return (
    <div className="vch-root">
      <div className="vch-card">
        <div className="vch-brand">
          <span className="vch-logo">SameMess</span>
          <span className="vch-brand-sub">Voucher hẹn hò</span>
        </div>

        {loading ? (
          <div className="vch-loading"><span className="spinner" /></div>
        ) : error && !data ? (
          <div className="vch-error">
            <div className="vch-error-icon">🔍</div>
            <p>{error}</p>
          </div>
        ) : data ? (
          <>
            {(() => {
              const st = STATUS[data.status] || STATUS.Pending
              const expiredNotUsed = data.isExpired && data.status !== 'Redeemed'
              return (
                <>
                  <div className={`vch-status ${expiredNotUsed ? 'is-cancelled' : st.cls}`}>
                    <span className="vch-status-icon">{expiredNotUsed ? '⛔' : st.icon}</span>
                    {expiredNotUsed ? 'Đã hết hạn' : st.label}
                  </div>

                  <div className="vch-combo">{data.comboTitle}</div>
                  <div className="vch-venue">📍 {data.venueName}</div>

                  <div className="vch-amount">{vnd(data.amountVnd)}</div>

                  <div className="vch-code-box">
                    <span className="vch-code-label">Mã voucher</span>
                    <span className="vch-code">{data.voucherCode}</span>
                  </div>

                  <div className="vch-rows">
                    <div className="vch-row">
                      <span>Cặp đôi</span>
                      <strong>{data.buyerName} &amp; {data.partnerName}</strong>
                    </div>
                    <div className="vch-row">
                      <span>Ngày đặt</span>
                      <strong>{fmtDate(data.createdAt)}</strong>
                    </div>
                    <div className="vch-row">
                      <span>Hạn sử dụng</span>
                      <strong className={data.isExpired ? 'vch-expired' : ''}>{fmtDate(data.expiresAt)}</strong>
                    </div>
                    {data.status === 'Redeemed' && (
                      <div className="vch-row">
                        <span>Đã dùng lúc</span>
                        <strong>{fmtDateTime(data.redeemedAt)}</strong>
                      </div>
                    )}
                  </div>

                  {error && <div className="vch-inline-error">{error}</div>}

                  {/* Khu vực dành cho QUÁN */}
                  {data.canRedeem ? (
                    <div className="vch-venue-zone">
                      <div className="vch-venue-hint">Nhân viên quán xác nhận sau khi khách dùng combo:</div>
                      <button className="vch-redeem-btn" onClick={() => setConfirmOpen(true)}>
                        Xác nhận đã sử dụng
                      </button>
                    </div>
                  ) : data.status === 'Redeemed' ? (
                    <div className="vch-done">🎉 Voucher này đã được sử dụng</div>
                  ) : data.status === 'Pending' ? (
                    <div className="vch-note">Voucher chưa được thanh toán.</div>
                  ) : expiredNotUsed ? (
                    <div className="vch-note">Voucher đã quá hạn sử dụng.</div>
                  ) : null}
                </>
              )
            })()}
          </>
        ) : null}
      </div>

      <div className="vch-footer">Được bảo vệ bởi SameMess · Chỉ quán đối tác xác nhận</div>

      {/* Xác nhận trước khi redeem (tránh bấm nhầm) */}
      {confirmOpen && (
        <div className="vch-modal-backdrop" onClick={() => !redeeming && setConfirmOpen(false)}>
          <div className="vch-modal" onClick={(e) => e.stopPropagation()}>
            <h3>Xác nhận sử dụng?</h3>
            <p>Sau khi xác nhận, voucher <strong>{data?.voucherCode}</strong> sẽ được đánh dấu <strong>đã sử dụng</strong> và không thể dùng lại.</p>
            <div className="vch-modal-actions">
              <button className="vch-btn-ghost" disabled={redeeming} onClick={() => setConfirmOpen(false)}>Huỷ</button>
              <button className="vch-btn-primary" disabled={redeeming} onClick={doRedeem}>
                {redeeming ? <span className="spinner" /> : 'Xác nhận'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
