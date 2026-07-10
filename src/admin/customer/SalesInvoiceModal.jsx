import React from 'react';
import { Modal, Button, Row, Col } from 'antd';
import { PrinterOutlined } from '@ant-design/icons';

export default function SalesInvoiceModal({
  visible,
  onCancel,
  invoiceData,
  ticketToPrint,
  users = []
}) {
  return (
    <Modal
      title="Xuất Hóa Đơn Thành Công"
      open={visible}
      onCancel={onCancel}
      footer={[
        <Button key="close" onClick={onCancel}>Đóng (Tiếp tục bán)</Button>,
        <Button key="print" type="primary" icon={<PrinterOutlined />} onClick={() => window.print()}>
          In Hóa Đơn Đưa Khách
        </Button>
      ]}
      width={750}
      maskClosable={false}
    >
      <style>
        {`
          @media print {
            body * { visibility: hidden; }
            #printable-invoice, #printable-invoice * { visibility: visible; }
            #printable-invoice { position: absolute; left: 0; top: 0; width: 100%; padding: 20px; }
            .ant-modal-footer, .ant-modal-close, .ant-modal-header { display: none !important; }
          }
        `}
      </style>

      {invoiceData && (
        <div id="printable-invoice" style={{ padding: '20px', fontFamily: 'Arial, sans-serif', color: '#000' }}>
          <div style={{ textAlign: 'center', borderBottom: '2px dashed #ccc', paddingBottom: '15px', marginBottom: '20px' }}>
            <h1 style={{ margin: 0, fontSize: '22px', textTransform: 'uppercase' }}>CÔNG TY TNHH LINH KIỆN ĐIỆN TỬ WMS</h1>
            <p style={{ margin: '5px 0', fontSize: '13px' }}>Địa chỉ: Làng Đại Học, Tp. Thủ Đức, TP. HCM | Hotline: 1900.8888</p>
            <h2 style={{ margin: '20px 0 5px 0' }}>HÓA ĐƠN BÁN HÀNG</h2>
            <p style={{ margin: 0 }}>Mã đơn: <strong>{invoiceData.ticketCode}</strong></p>
          </div>

          <Row style={{ marginBottom: '20px', fontSize: '14px' }}>
            <Col span={12}>
              <p style={{ margin: '5px 0' }}><strong>Khách hàng:</strong> {invoiceData.customerName}</p>
              <p style={{ margin: '5px 0' }}><strong>Thanh toán:</strong> {invoiceData.paymentMethod}</p>
            </Col>
            <Col span={12} style={{ textAlign: 'right' }}>
              <p style={{ margin: '5px 0' }}><strong>Ngày bán:</strong> {invoiceData.createdAt}</p>
              <p style={{ margin: '5px 0' }}>
                <strong>Người lập: </strong>
                {(() => {
                  // 1. Kiểm tra ticketToPrint có tồn tại không
                  if (!ticketToPrint) return "Không xác định";

                  // 2. Ưu tiên dò ID trong danh sách users
                  const userId = ticketToPrint.userId || ticketToPrint.UserId;
                  const creator = users?.find(u => (u.Id || u.id) === userId);
                  if (creator) return creator.FullName || creator.fullName || creator.Username || creator.username;

                  // 3. Fallback về các trường tên có sẵn
                  return ticketToPrint.userName || ticketToPrint.UserName || ticketToPrint.user?.fullName || "Không xác định";
                })()}
              </p>            </Col>
          </Row>

          {/* HIỂN THỊ GHI CHÚ NẾU CÓ */}
          {invoiceData.note && (
            <div style={{ marginBottom: '15px', fontSize: '14px', fontStyle: 'italic' }}>
              <strong>Ghi chú:</strong> {invoiceData.note}
            </div>
          )}

          <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '20px', fontSize: '14px' }}>
            <thead>
              <tr style={{ backgroundColor: '#f0f0f0' }}>
                <th style={{ border: '1px solid #000', padding: '8px', textAlign: 'center' }}>STT</th>
                <th style={{ border: '1px solid #000', padding: '8px', textAlign: 'left' }}>Tên Sản Phẩm</th>
                <th style={{ border: '1px solid #000', padding: '8px', textAlign: 'center' }}>SL</th>
                <th style={{ border: '1px solid #000', padding: '8px', textAlign: 'right' }}>Đơn Giá</th>
                <th style={{ border: '1px solid #000', padding: '8px', textAlign: 'right' }}>Thành Tiền</th>
              </tr>
            </thead>
            <tbody>
              {invoiceData.items.map((detail, index) => (
                <tr key={index}>
                  <td style={{ border: '1px solid #000', padding: '8px', textAlign: 'center' }}>{index + 1}</td>
                  <td style={{ border: '1px solid #000', padding: '8px' }}>{detail.productName}</td>
                  <td style={{ border: '1px solid #000', padding: '8px', textAlign: 'center' }}>{detail.quantity}</td>
                  <td style={{ border: '1px solid #000', padding: '8px', textAlign: 'right' }}>{(detail.unitPrice || 0).toLocaleString()} đ</td>
                  <td style={{ border: '1px solid #000', padding: '8px', textAlign: 'right' }}>
                    {((detail.quantity || 0) * (detail.unitPrice || 0)).toLocaleString()} đ
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div style={{ textAlign: 'right', fontSize: '15px' }}>
            <p style={{ margin: '5px 0' }}>Tổng số lượng: {invoiceData.totalQuantity}</p>
            <h3 style={{ margin: '10px 0', fontSize: '20px' }}>
              TỔNG THANH TOÁN: <span style={{ color: 'red' }}>{(invoiceData.totalAmount || 0).toLocaleString()} VNĐ</span>
            </h3>
          </div>

          <Row style={{ marginTop: '50px', textAlign: 'center', fontSize: '14px' }}>
            <Col span={12}>
              <strong>Khách Hàng</strong>
              <p style={{ fontSize: '12px', fontStyle: 'italic', marginTop: '5px' }}>(Ký, ghi rõ họ tên)</p>
            </Col>
            <Col span={12}>
              <strong>Người Bán Hàng</strong>
              <p style={{ fontSize: '12px', fontStyle: 'italic', marginTop: '5px' }}>(Ký, ghi rõ họ tên)</p>
            </Col>
          </Row>

          <div style={{ textAlign: 'center', marginTop: '60px', fontStyle: 'italic', fontSize: '12px', color: '#666' }}>
            Cảm ơn quý khách đã mua sắm tại WMS. Hẹn gặp lại!
          </div>
        </div>
      )}
    </Modal>
  );
}