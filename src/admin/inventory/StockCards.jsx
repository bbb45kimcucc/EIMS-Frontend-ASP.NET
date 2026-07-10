import React, { useState, useEffect } from 'react';
// Sửa dòng import antd thành như vầy nè:
// Cúc sửa dòng import antd thành như thế này nhé (đảm bảo có đủ tất cả các chữ này):
import { Card, Typography, message, Modal, Tag, Row, Col, Divider, Descriptions } from 'antd';
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import moment from 'moment';

// Import component cái Bảng mà bạn vừa sửa ở tin nhắn trước
import StockCardTable from './StockCardTable';

const { Text, Title } = Typography;

export default function StockCards() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  // --- STATE CHO MODAL CHI TIẾT ---
  const [isDetailVisible, setIsDetailVisible] = useState(false);
  const [detailData, setDetailData] = useState(null);

  // Lấy tham số SKU từ URL (ví dụ chuyển từ trang Tồn kho sang)
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const skuParam = queryParams.get('sku');

  axios.defaults.withCredentials = true;

  // Hàm tải dữ liệu thẻ kho
  // Hàm tải dữ liệu thẻ kho
  const fetchStockCards = async (sku = '') => {
    setLoading(true);
    try {
      const url = sku ? `/api/StockCards?sku=${sku}` : '/api/StockCards';
      const response = await axios.get(url, { withCredentials: true });

      // In ra Console để xem chính xác Backend trả về cái gì
      console.log("Dữ liệu Backend trả về:", response.data);

      // XỬ LÝ AN TOÀN: Tìm xem mảng dữ liệu thực sự nằm ở đâu
      let rawArray = [];
      if (Array.isArray(response.data)) {
        rawArray = response.data; // Nếu nó đã là mảng sẵn
      } else if (response.data && Array.isArray(response.data.data)) {
        rawArray = response.data.data; // Nếu nó bọc trong object { data: [...] }
      } else if (response.data && Array.isArray(response.data.items)) {
        rawArray = response.data.items; // Nếu nó bọc trong object { items: [...] }
      } else {
        console.error("Không tìm thấy mảng dữ liệu hợp lệ từ API", response.data);
      }

      // Lúc này dùng rawArray.map sẽ không bao giờ bị lỗi nữa
      // ... (các phần trên giữ nguyên)

      const formattedData = rawArray.map((item, index) => ({
        key: item.Id || item.id || index,
        transactionDate: item.CreatedAt || item.createdAt || item.transactionDate,
        referenceCode: item.TicketCode || item.ticketCode || item.referenceCode,
        productName: item.Product?.Name || item.product?.name || item.productName,
        productSku: item.Product?.SKU || item.product?.sku || item.productSku || sku,
        beforeQty: item.BeforeQty || item.beforeQty || 0,
        changeQty: item.ChangeQty || item.changeQty || 0,
        afterQty: item.AfterQty || item.afterQty || 0,
        note: item.Note || item.note || '',

        // CÁC TRƯỜNG LẤY THÊM CHO MODAL CHI TIẾT
        type: item.Ticket?.Type || item.ticket?.type || item.Type || item.type || (item.ChangeQty < 0 ? 'Xuất kho' : 'Nhập kho'),
        warehouse: item.Ticket?.Warehouse?.Name || item.ticket?.warehouse?.name || 'Kho chính',
        creator: item.Ticket?.User?.FullName || item.ticket?.user?.fullName || item.Ticket?.User?.Username || item.ticket?.user?.username || 'admin',
        source: item.Source || item.source || '---'
      }));

      setData(formattedData);

    } catch (error) {
      console.error(error);
      message.error("Lỗi khi tải dữ liệu Thẻ Kho!");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStockCards(skuParam);
  }, [skuParam]);

  return (
    <>
      <div style={{ marginBottom: '20px' }}>
        <Text type="secondary">Quản lý kho / Thẻ kho</Text>
      </div>

      <Card style={{ borderRadius: '15px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
        <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Title level={4} style={{ margin: 0 }}>Nhật Ký Biến Động Kho (Stock Cards)</Title>
        </div>

        {/* --- GỌI COMPONENT BẢNG --- */}
        <StockCardTable
          dataSource={data}
          loading={loading}
          onViewDetail={(record) => {
            setDetailData(record);       // Lưu data dòng hiện tại
            setIsDetailVisible(true);    // Bật Popup lên
          }}
        />
      </Card>

      {/* --- MODAL XEM CHI TIẾT --- */}
      {/* --- MODAL XEM CHI TIẾT GIAO DIỆN MỚI --- */}
      {/* --- MODAL XEM CHI TIẾT --- */}
      <Modal
        title={<b>Chi Tiết Phiếu Biến Động</b>}
        open={isDetailVisible}
        onCancel={() => setIsDetailVisible(false)}
        footer={null}
        width={500}
        centered
      >
        {detailData && (
          <div style={{ marginTop: '15px' }}>

            {/* PHẦN 1: TÊN SẢN PHẨM */}
            <div style={{ textAlign: 'center', marginBottom: '20px', padding: '12px', background: '#f0f5ff', borderRadius: '8px' }}>
              <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#1d39c4' }}>
                {detailData.productName}
              </div>
              <div style={{ fontSize: '13px', color: '#8c8c8c', marginTop: '4px' }}>
                SKU: {detailData.productSku}
              </div>
            </div>

            {/* PHẦN 2: KHỐI SỐ LƯỢNG (Làm nổi bật biến động) */}
            <div style={{ background: '#fafafa', border: '1px solid #f0f0f0', borderRadius: '8px', padding: '15px 20px', marginBottom: '20px' }}>
              <Row align="middle" justify="space-between" style={{ textAlign: 'center' }}>
                <Col span={7}>
                  <div style={{ color: '#8c8c8c', fontSize: '12px', marginBottom: '4px' }}>TỒN ĐẦU</div>
                  <div style={{ fontSize: '22px', fontWeight: 'bold', color: '#595959' }}>{detailData.beforeQty}</div>
                </Col>
                <Col span={10}>
                  <div style={{
                    fontSize: '18px', fontWeight: '900',
                    color: detailData.changeQty > 0 ? '#52c41a' : '#ff4d4f',
                    background: detailData.changeQty > 0 ? '#f6ffed' : '#fff2f0',
                    border: `1px solid ${detailData.changeQty > 0 ? '#b7eb8f' : '#ffa39e'}`,
                    borderRadius: '20px', padding: '4px 12px', display: 'inline-block'
                  }}>
                    {detailData.changeQty > 0 ? `+${detailData.changeQty}` : detailData.changeQty}
                  </div>
                  <div style={{ color: '#8c8c8c', fontSize: '12px', marginTop: '6px' }}>BIẾN ĐỘNG</div>
                </Col>
                <Col span={7}>
                  <div style={{ color: '#8c8c8c', fontSize: '12px', marginBottom: '4px' }}>TỒN CUỐI</div>
                  <div style={{ fontSize: '22px', fontWeight: 'bold', color: '#1890ff' }}>{detailData.afterQty}</div>
                </Col>
              </Row>
            </div>

            {/* PHẦN 3: DANH SÁCH THÔNG TIN CHI TIẾT */}
            <Descriptions column={1} size="small" labelStyle={{ color: '#8c8c8c', width: '130px' }}>
              <Descriptions.Item label="Thời gian">
                <span style={{ fontWeight: 500 }}>{moment(detailData.transactionDate).format('DD/MM/YYYY HH:mm:ss')}</span>
              </Descriptions.Item>

              <Descriptions.Item label="Mã tham chiếu">
                <Tag color="blue" style={{ margin: 0, fontWeight: 'bold' }}>{detailData.referenceCode}</Tag>
              </Descriptions.Item>

              <Descriptions.Item label="Loại giao dịch">
                <Tag color={detailData.changeQty > 0 ? "success" : "error"} style={{ margin: 0 }}>
                  {detailData.type}
                </Tag>
              </Descriptions.Item>

              <Descriptions.Item label="Kho">
                {detailData.warehouse}
              </Descriptions.Item>

              <Descriptions.Item label="Người lập">
                {detailData.creator}
              </Descriptions.Item>

              <Descriptions.Item label="Nguồn">
                {detailData.source}
              </Descriptions.Item>

              <Descriptions.Item label="Ghi chú">
                <span style={{ fontStyle: 'italic', color: '#595959' }}>{detailData.note || 'Không có ghi chú'}</span>
              </Descriptions.Item>
            </Descriptions>

          </div>
        )}
      </Modal>
    </>
  );
}