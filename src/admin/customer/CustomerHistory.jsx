import React from 'react';
import { Modal, Table, Button, Typography } from 'antd';
import { PrinterOutlined } from '@ant-design/icons';
import moment from 'moment';

const { Text } = Typography;

export default function CustomerHistory({
  isHistoryVisible, onHistoryCancel, customerTickets, currentCustomer,
  isPrintVisible, onPrintCancel, ticketToPrint, setTicketToPrint, setIsPrintVisible
}) {
  const historyColumns = [
    { title: 'Mã Phiếu', dataIndex: 'ticketCode', render: text => <strong>{text}</strong> },
    { title: 'Ngày Mua', dataIndex: 'createdAt', render: date => moment(date).format('DD/MM/YYYY HH:mm') },
    { title: 'Tổng Tiền', dataIndex: 'totalAmount', render: amt => <Text type="success">{(amt || 0).toLocaleString()} đ</Text> },
    {
      title: 'In Hóa Đơn',
      align: 'center',
      render: (_, record) => (
        <Button 
          type="primary" 
          ghost 
          icon={<PrinterOutlined />} 
          size="small"
          onClick={() => {
            setTicketToPrint(record);
            setIsPrintVisible(true);
          }}
        >
          In Lại
        </Button>
      )
    }
  ];

  return (
    <>
      {/* Modal Lịch Sử */}
      <Modal
        title={`Lịch Sử Mua Hàng - ${currentCustomer?.name}`}
        open={isHistoryVisible}
        onCancel={onHistoryCancel}
        footer={[<Button key="close" onClick={onHistoryCancel}>Đóng</Button>]}
        width={700}
      >
        <Table 
          columns={historyColumns} 
          dataSource={customerTickets} 
          pagination={{ pageSize: 5 }} 
          locale={{ emptyText: 'Khách hàng này chưa mua món nào.' }}
        />
      </Modal>

      {/* Modal In Hóa Đơn */}
      <Modal
        title="In Hóa Đơn Khách Hàng"
        open={isPrintVisible}
        onCancel={onPrintCancel}
        footer={[
          <Button key="close" onClick={onPrintCancel}>Đóng</Button>,
          <Button key="print" type="primary" icon={<PrinterOutlined />} onClick={() => window.print()}>
            In / Xuất PDF
          </Button>
        ]}
        width={750}
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

        {ticketToPrint && (
          <div id="printable-invoice" style={{ padding: '20px', fontFamily: 'Arial, sans-serif', color: '#000' }}>
            <div style={{ textAlign: 'center', borderBottom: '2px solid #000', paddingBottom: '10px', marginBottom: '20px' }}>
              <h1 style={{ margin: 0, fontSize: '24px' }}>CÔNG TY LINH KIỆN ĐIỆN TỬ WMS</h1>
              <p style={{ margin: '5px 0' }}>Địa chỉ: 123 Đường Điện Tử, Q.1, TP. HCM | SĐT: 0123.456.789</p>
              <h2 style={{ margin: '15px 0 5px 0' }}>HÓA ĐƠN BÁN HÀNG</h2>
              <p style={{ margin: 0 }}>Mã phiếu: <strong>{ticketToPrint.ticketCode || ticketToPrint.TicketCode}</strong></p>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
              <div>
                <p style={{ margin: '5px 0' }}><strong>Khách hàng:</strong> {currentCustomer?.name}</p>
                <p style={{ margin: '5px 0' }}><strong>Số điện thoại:</strong> {currentCustomer?.phone || '---'}</p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <p style={{ margin: '5px 0' }}><strong>Ngày lập:</strong> {moment(ticketToPrint.createdAt || ticketToPrint.CreatedAt).format('DD/MM/YYYY')}</p>
                <p style={{ margin: '5px 0' }}><strong>Người bán:</strong> {ticketToPrint.User?.FullName || ticketToPrint.user?.fullName || 'Nhân viên WMS'}</p>
              </div>
            </div>

            <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '20px' }}>
              <thead>
                <tr>
                  <th style={{ border: '1px solid #000', padding: '8px', textAlign: 'center' }}>STT</th>
                  <th style={{ border: '1px solid #000', padding: '8px', textAlign: 'left' }}>Tên Linh Kiện</th>
                  <th style={{ border: '1px solid #000', padding: '8px', textAlign: 'center' }}>SL</th>
                  <th style={{ border: '1px solid #000', padding: '8px', textAlign: 'right' }}>Đơn Giá</th>
                  <th style={{ border: '1px solid #000', padding: '8px', textAlign: 'right' }}>Thành Tiền</th>
                </tr>
              </thead>
              <tbody>
                {(ticketToPrint.TicketDetails || ticketToPrint.ticketDetails || []).map((detail, index) => (
                  <tr key={index}>
                    <td style={{ border: '1px solid #000', padding: '8px', textAlign: 'center' }}>{index + 1}</td>
                    <td style={{ border: '1px solid #000', padding: '8px' }}>
                      {detail.Product?.Name || detail.product?.name || `Sản phẩm #${detail.ProductId || detail.productId}`}
                    </td>
                    <td style={{ border: '1px solid #000', padding: '8px', textAlign: 'center' }}>{detail.Quantity || detail.quantity}</td>
                    <td style={{ border: '1px solid #000', padding: '8px', textAlign: 'right' }}>{(detail.UnitPrice || detail.unitPrice || 0).toLocaleString()} đ</td>
                    <td style={{ border: '1px solid #000', padding: '8px', textAlign: 'right' }}>
                      {((detail.Quantity || detail.quantity || 0) * (detail.UnitPrice || detail.unitPrice || 0)).toLocaleString()} đ
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div style={{ textAlign: 'right', fontSize: '16px' }}>
              <p style={{ margin: '5px 0' }}><strong>Tổng số lượng:</strong> {ticketToPrint.TotalQuantity || ticketToPrint.totalQuantity}</p>
              <p style={{ margin: '5px 0', fontSize: '18px' }}>
                <strong>Tổng thanh toán: <span style={{ color: 'red' }}>{(ticketToPrint.TotalAmount || ticketToPrint.totalAmount || 0).toLocaleString()} VNĐ</span></strong>
              </p>
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'space-around', marginTop: '40px', paddingBottom: '30px' }}>
              <div style={{ textAlign: 'center' }}>
                <strong>Khách hàng</strong>
                <p style={{ fontSize: '12px', fontStyle: 'italic', marginTop: '5px' }}>(Ký, họ tên)</p>
              </div>
              <div style={{ textAlign: 'center' }}>
                <strong>Người bán hàng</strong>
                <p style={{ fontSize: '12px', fontStyle: 'italic', marginTop: '5px' }}>(Ký, họ tên)</p>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
}