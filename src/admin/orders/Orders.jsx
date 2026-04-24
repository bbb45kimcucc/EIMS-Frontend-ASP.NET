import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Typography, Button, Table, Tag, Select, Input, Space, message, Popconfirm } from 'antd';
import {
  ShoppingCartOutlined, UserOutlined, SearchOutlined,
  FilterOutlined, ShareAltOutlined, PlusOutlined, DeleteOutlined
} from '@ant-design/icons';
import axios from 'axios';
import moment from 'moment';

const { Title, Text } = Typography;
const { Option } = Select;

export default function Orders() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  const [stats, setStats] = useState({
    totalOrders: 0, pending: 0, completed: 0, canceled: 0, totalRevenue: 0
  });

  // 1. TẢI DỮ LIỆU ĐƠN HÀNG THẬT TỪ C#
  const fetchOrders = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/api/Orders');
      // Thêm key cho từng dòng để Ant Design không báo lỗi
      const realData = response.data.map(item => ({ ...item, key: item.id }));
      setData(realData);

      // Thống kê tự động
      const pendingCount = realData.filter(o => o.status === 'Pending').length;
      const completedCount = realData.filter(o => o.status === 'Completed').length;
      const canceledCount = realData.filter(o => o.status === 'Canceled').length;
      const revenue = realData.reduce((sum, o) => sum + (o.totalAmount || 0), 0);

      setStats({
        totalOrders: realData.length,
        pending: pendingCount,
        completed: completedCount,
        canceled: canceledCount,
        totalRevenue: revenue
      });

    } catch (error) {
      message.error("Lỗi khi tải dữ liệu đơn hàng!");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchOrders(); }, []);

  // 2. GỌI API ĐỔI TRẠNG THÁI
  const handleStatusChange = async (id, newStatus) => {
    try {
      await axios.patch(`/api/Orders/${id}/status`, JSON.stringify(newStatus), {
        headers: { 'Content-Type': 'application/json' }
      });
      message.success(`Đã đổi trạng thái đơn hàng thành: ${newStatus}`);
      fetchOrders(); 
    } catch (error) {
      message.error("Lỗi khi cập nhật trạng thái!");
    }
  };

  // 3. XÓA ĐƠN HÀNG
  const handleDelete = async (id) => {
    try {
      await axios.delete(`/api/Orders/${id}`);
      message.success("Đã xóa đơn hàng!");
      fetchOrders();
    } catch (error) {
      message.error("Lỗi khi xóa đơn hàng!");
    }
  };

  // Cột cho BẢNG CHÍNH (Đơn Hàng)
  const columns = [
    {
      title: 'Tên Khách Hàng',
      dataIndex: ['customer', 'name'],
      render: text => <strong>{text || 'Khách vãng lai'}</strong>,
    },
    {
      title: 'Ngày Đặt',
      dataIndex: 'orderDate',
      render: date => moment(date).format('DD/MM/YYYY - HH:mm'),
    },
    {
      title: 'Loại Đơn',
      dataIndex: 'type',
    },
    {
      title: 'Mã Vận Đơn',
      dataIndex: 'trackingId',
      render: text => <Text copyable>{text}</Text>, 
    },
    {
      title: 'Tổng Tiền',
      dataIndex: 'totalAmount',
      render: amt => <strong style={{ color: '#5570F1' }}>{amt?.toLocaleString()} đ</strong>,
    },
    {
      title: 'Trạng Thái',
      dataIndex: 'status',
      render: (status) => {
        let color = status === 'Completed' ? 'success' : status === 'In-Progress' ? 'processing' : status === 'Canceled' ? 'error' : 'warning';
        return <Tag color={color} style={{ borderRadius: '10px', padding: '2px 10px' }}>{status}</Tag>;
      },
    },
    {
      title: 'Hành động',
      render: (_, record) => (
        <Space>
          <Select 
            value={record.status} 
            style={{ width: 130 }} 
            bordered={false}
            onChange={(value) => handleStatusChange(record.id, value)}
          >
            <Option value="Pending">Pending</Option>
            <Option value="In-Progress">In-Progress</Option>
            <Option value="Completed">Completed</Option>
            <Option value="Canceled">Canceled</Option>
          </Select>
          <Popconfirm title="Xóa đơn hàng này?" onConfirm={() => handleDelete(record.id)}>
            <Button type="text" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  // ==========================================
  // ĐÂY CHÍNH LÀ BẢNG ORDER_DETAILS NÈ CÚC:
  // Cột cho BẢNG PHỤ (Bảng này xổ ra khi bấm dấu +)
  // ==========================================
  const expandedRowRender = (record) => {
    const detailColumns = [
      { title: 'Tên Linh Kiện', dataIndex: ['product', 'name'], key: 'name', render: text => <Text strong>{text}</Text> },
      { title: 'Mã SKU', dataIndex: ['product', 'sku'], key: 'sku' },
      { title: 'Số lượng mua', dataIndex: 'quantity', key: 'quantity' },
      { title: 'Đơn giá lúc mua', dataIndex: 'unitPrice', key: 'unitPrice', render: price => `${price?.toLocaleString()} đ` },
      { 
        title: 'Thành tiền', 
        key: 'total', 
        render: (_, detail) => <strong style={{ color: '#ff4d4f' }}>{(detail.quantity * detail.unitPrice)?.toLocaleString()} đ</strong> 
      },
    ];

    // Nó lấy record.orderDetails từ C# gửi qua đó
    return <Table columns={detailColumns} dataSource={record.orderDetails} pagination={false} rowKey="id" style={{ margin: '10px 0', border: '1px dashed #d9d9d9' }} />;
  };

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <Text type="secondary">Dashboard / Orders</Text>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <Title level={4} style={{ margin: 0 }}>Quản Lý Đơn Hàng</Title>
        <Button type="primary" icon={<PlusOutlined />} style={{ background: '#5570F1', borderRadius: '8px' }}>
          Tạo Đơn Hàng Mới
        </Button>
      </div>
      
      {/* Thẻ thống kê */}
      <Row gutter={24} style={{ marginBottom: '24px' }}>
        <Col span={8}>
          <Card style={{ borderRadius: '15px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
              <div style={{ background: '#eef2ff', padding: '8px', borderRadius: '8px', color: '#5570F1' }}><ShoppingCartOutlined /></div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <div><Text type="secondary">Tổng Đơn</Text><Title level={3} style={{ margin: 0 }}>{stats.totalOrders}</Title></div>
              <div><Text type="secondary">Chờ Xử Lý</Text><Title level={3} style={{ margin: 0 }}>{stats.pending}</Title></div>
              <div><Text type="secondary">Hoàn Thành</Text><Title level={3} style={{ margin: 0 }}>{stats.completed}</Title></div>
            </div>
          </Card>
        </Col>

        <Col span={8}>
          <Card style={{ borderRadius: '15px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
              <div style={{ background: '#fff1f0', padding: '8px', borderRadius: '8px', color: '#ff4d4f' }}><ShoppingCartOutlined /></div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <div><Text type="secondary">Đã Hủy</Text><Title level={3} style={{ margin: 0 }}>{stats.canceled}</Title></div>
              <div><Text type="secondary">Trả Hàng</Text><Title level={3} style={{ margin: 0 }}>0</Title></div>
              <div><Text type="secondary">Hư Hỏng</Text><Title level={3} style={{ margin: 0 }}>0</Title></div>
            </div>
          </Card>
        </Col>

        <Col span={8}>
          <Card style={{ borderRadius: '15px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
              <div style={{ background: '#fff7e6', padding: '8px', borderRadius: '8px', color: '#ffa940' }}><UserOutlined /></div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <div><Text type="secondary">Tổng Doanh Thu</Text><Title level={3} style={{ margin: 0, color: '#5570F1' }}>{stats.totalRevenue.toLocaleString()} đ</Title></div>
            </div>
          </Card>
        </Col>
      </Row>

      {/* BẢNG DỮ LIỆU ĐƠN HÀNG */}
      <Card style={{ borderRadius: '15px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
          <Title level={5} style={{ margin: 0 }}>Danh Sách Đơn</Title>
          <Space>
            <Input placeholder="Tìm mã vận đơn..." prefix={<SearchOutlined />} style={{ borderRadius: '8px' }} />
            <Button icon={<FilterOutlined />}>Lọc</Button>
            <Button icon={<ShareAltOutlined />}>Xuất File</Button>
          </Space>
        </div>
        
        {/* Khúc này gài hàm expandedRowRender vô nè */}
        <Table 
          columns={columns} 
          dataSource={data} 
          pagination={{ pageSize: 8 }} 
          loading={loading}
          expandable={{ expandedRowRender }}
        />
      </Card>
    </>
  );
}