import React, { useState, useEffect } from 'react';
import { Card, Typography, Table, Tag, message } from 'antd';
import axios from 'axios';
import moment from 'moment';

const { Title, Text } = Typography;

export default function StockCards() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  // Quản lý phân trang chuẩn Ant Design
  const [pagination, setPagination] = useState({ 
    current: 1, 
    pageSize: 10, 
    total: 0,
    showSizeChanger: true 
  });

  // Cấu hình axios gửi kèm Cookie Session
  axios.defaults.withCredentials = true;

  // 1. HÀM TẢI DỮ LIỆU "FIX TẬN GỐC"
  const fetchStockCards = async (page = 1, pageSize = 10) => {
    setLoading(true);
    try {
      // Gửi request kèm theo withCredentials để không bị lỗi 401/403
      const response = await axios.get(
        `/api/StockCards?page=${page}&pageSize=${pageSize}`,
        { withCredentials: true }
      );

      // Cấu trúc trả về từ Backend (thường là { data: [], totalItems: 100, page: 1 })
      const resData = response.data;
      const records = resData.Data || resData.data || [];
      const total = resData.TotalItems || resData.totalItems || 0;

      // MAP DỮ LIỆU: Ép tất cả về một kiểu để tránh lỗi PascalCase/camelCase từ C#
      const formattedData = records.map((item, index) => ({
        key: item.Id || item.id || index,
        id: item.Id || item.id,
        transactionDate: item.TransactionDate || item.transactionDate,
        referenceCode: item.ReferenceCode || item.referenceCode || 'N/A',
        // Xử lý object lồng nhau (Product)
        productName: item.Product?.Name || item.product?.name || 'Sản phẩm đã xóa',
        productSku: item.Product?.SKU || item.product?.sku || '',
        beforeQty: item.BeforeQty || item.beforeQty || 0,
        changeQty: item.ChangeQty || item.changeQty || 0,
        afterQty: item.AfterQty || item.afterQty || 0,
        note: item.Note || item.note || ''
      }));

      setData(formattedData);
      setPagination(prev => ({ ...prev, current: page, total: total, pageSize: pageSize }));
    } catch (error) {
      console.error("StockCard Error:", error);
      message.error("Không thể tải lịch sử thẻ kho. Hãy kiểm tra quyền Admin!");
    } finally {
      setLoading(false);
    }
  };

  // Chạy lần đầu khi vào trang
  useEffect(() => { 
    fetchStockCards(1, pagination.pageSize); 
  }, []);

  // Xử lý khi người dùng chuyển trang hoặc đổi số lượng dòng/trang
  const handleTableChange = (newPagination) => {
    fetchStockCards(newPagination.current, newPagination.pageSize);
  };

  // 2. ĐỊNH NGHĨA CỘT (UI CHUẨN NGHIỆP VỤ)
  const columns = [
    {
      title: 'Thời gian',
      dataIndex: 'transactionDate',
      key: 'transactionDate',
      width: 180,
      render: date => <Text type="secondary">{moment(date).format('DD/MM/YYYY HH:mm:ss')}</Text>
    },
    { 
      title: 'Tham chiếu', 
      dataIndex: 'referenceCode', 
      key: 'referenceCode',
      render: text => <Tag color="blue" style={{ fontWeight: 'bold' }}>{text}</Tag> 
    },
    { 
      title: 'Sản phẩm', 
      key: 'product',
      render: (_, record) => (
        <div>
          <Text strong>{record.productName}</Text>
          <br />
          <Text type="secondary" style={{ fontSize: '12px' }}>SKU: {record.productSku}</Text>
        </div>
      )
    },
    { 
      title: 'Tồn đầu', 
      dataIndex: 'beforeQty', 
      align: 'center',
      render: qty => <Text>{qty}</Text>
    },
    {
      title: 'Biến động',
      dataIndex: 'changeQty',
      align: 'center',
      render: qty => {
        if (qty > 0) return <Text type="success" strong>+{qty}</Text>;
        if (qty < 0) return <Text type="danger" strong>{qty}</Text>;
        return <Text>{qty}</Text>;
      }
    },
    { 
      title: 'Tồn cuối', 
      dataIndex: 'afterQty', 
      align: 'center',
      render: qty => <Text strong style={{ color: '#1890ff' }}>{qty}</Text> 
    },
    { 
      title: 'Ghi chú', 
      dataIndex: 'note',
      ellipsis: true,
      render: text => <Text type="secondary">{text || '---'}</Text>
    },
  ];

  return (
    <div style={{ padding: '0px' }}>
      <div style={{ marginBottom: '20px' }}>
        <Text type="secondary">Quản lý kho / Thẻ kho</Text>
      </div>

      <Card 
        style={{ borderRadius: '15px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}
        title={<Title level={4} style={{ margin: 0 }}>Nhật Ký Biến Động Kho (Stock Cards)</Title>}
      >
        <Table
          columns={columns}
          dataSource={data}
          pagination={pagination}
          loading={loading}
          onChange={handleTableChange}
          locale={{ emptyText: 'Chưa có giao dịch nào được ghi lại' }}
          bordered
        />
      </Card>
    </div>
  );
}