import React, { useState, useEffect } from 'react';
import { Card, Typography, Input, Row, Col, Table, Tag, Tabs, Space, Button } from 'antd';
import { SearchOutlined, AppstoreOutlined, UserOutlined, FileTextOutlined, ArrowRightOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import moment from 'moment';

const { Title, Text } = Typography;

export default function GlobalSearchPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  // Raw data từ Backend
  const [products, setProducts] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [tickets, setTickets] = useState([]);

  // State lưu từ khóa tìm kiếm cho từng ô
  const [prodSku, setProdSku] = useState('');
  const [prodName, setProdName] = useState('');
  
  const [custName, setCustName] = useState('');
  const [custPhone, setCustPhone] = useState('');
  
  const [ticketCode, setTicketCode] = useState('');
  const [ticketType, setTicketType] = useState('');

  axios.defaults.withCredentials = true;

  // Tải toàn bộ dữ liệu hệ thống về để lọc
  const fetchAllData = async () => {
    setLoading(true);
    try {
      const [resProds, resCusts, resTickets] = await Promise.all([
        axios.get('/api/Products'),
        axios.get('/api/Customers').catch(() => ({ data: [] })),
        axios.get('/api/InventoryTickets').catch(() => ({ data: [] }))
      ]);
      setProducts(resProds.data || []);
      setCustomers(resCusts.data || []);
      setTickets(resTickets.data || []);
    } catch (error) {
      console.error("Lỗi tải dữ liệu tìm kiếm:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  // ==========================================
  // LOGIC LỌC DỮ LIỆU (SEARCH FILTERS)
  // ==========================================
  const filteredProducts = products.filter(p => {
    return (p.SKU || p.sku || '').toLowerCase().includes(prodSku.toLowerCase()) &&
           (p.Name || p.name || '').toLowerCase().includes(prodName.toLowerCase());
  });

  const filteredCustomers = customers.filter(c => {
    return (c.Name || c.name || '').toLowerCase().includes(custName.toLowerCase()) &&
           (c.Phone || c.phone || '').includes(custPhone);
  });

  const filteredTickets = tickets.filter(t => {
    const code = t.TicketCode || t.ticketCode || '';
    const type = t.Type || t.type || '';
    return code.toLowerCase().includes(ticketCode.toLowerCase()) &&
           type.toLowerCase().includes(ticketType.toLowerCase());
  });

  // ==========================================
  // ĐỊNH NGHĨA CỘT CHO TỪNG BẢNG
  // ==========================================
  const productColumns = [
    { title: 'Mã SKU', dataIndex: 'sku', render: (text, r) => <Tag color="blue">{r.SKU || r.sku || text}</Tag> },
    { title: 'Tên Linh Kiện', dataIndex: 'name', render: (text, r) => <strong>{r.Name || r.name || text}</strong> },
    { title: 'Giá Bán', dataIndex: 'price', render: (_, r) => <Text type="danger">{(r.AveragePrice || r.averagePrice || 0).toLocaleString()} đ</Text> },
    { title: 'Kho Còn', dataIndex: 'stock', render: (_, r) => <Tag color="green">{r.Quantity ?? r.quantity ?? r.CurrentStock ?? r.currentStock ?? 0}</Tag> },
    {
      title: 'Hành động',
      align: 'right',
      render: (_, r) => (
        <Button type="link" icon={<ArrowRightOutlined />} onClick={() => navigate(`/stockcards?sku=${r.SKU || r.sku}`)}>
          Xem chi tiết kho
        </Button>
      )
    }
  ];

  const customerColumns = [
    { title: 'Tên Khách Hàng', dataIndex: 'name', render: (text, r) => <strong>{r.Name || r.name || text}</strong> },
    { title: 'Số Điện Thoại', dataIndex: 'phone', render: (text, r) => r.Phone || r.phone || text || '---' },
    { title: 'Thanh Toán Mặc Định', dataIndex: 'method', render: (_, r) => <Tag color="cyan">{(r.PaymentMethod || r.paymentMethod || 'Tiền mặt').toUpperCase()}</Tag> },
    {
      title: 'Hành động',
      align: 'right',
      render: () => (
        <Button type="link" icon={<ArrowRightOutlined />} onClick={() => navigate('/customers')}>
          Đi đến Quản lý khách
        </Button>
      )
    }
  ];

  const ticketColumns = [
    { title: 'Mã Phiếu', dataIndex: 'code', render: (_, r) => <strong>{r.TicketCode || r.ticketCode}</strong> },
    {
      title: 'Loại Phiếu',
      render: (_, r) => {
        const type = r.Type || r.type || 'Nhập';
        return <Tag color={type.toLowerCase() === 'nhập' ? 'green' : 'volcano'}>{type.toUpperCase()}</Tag>;
      }
    },
    { title: 'Ngày Lập', render: (_, r) => moment(r.CreatedAt || r.createdAt).format('DD/MM/YYYY HH:mm') },
    { title: 'Tổng Tiền', render: (_, r) => <Text type="success">{(r.TotalAmount || r.totalAmount || 0).toLocaleString()} đ</Text> },
    {
      title: 'Hành động',
      align: 'right',
      render: () => (
        <Button type="link" icon={<ArrowRightOutlined />} onClick={() => navigate('/tickets')}>
          Đi đến Chứng từ
        </Button>
      )
    }
  ];

  // Cấu hình các Tabs hiển thị kết quả
  const tabItems = [
    {
      key: '1',
      label: <Space><AppstoreOutlined />Linh Kiện ({filteredProducts.length})</Space>,
      children: (
        <>
          <Row gutter={16} style={{ marginBottom: '20px' }}>
            <Col span={6}>
              <Input placeholder="Mã SKU (Ví dụ: MCU)" allowClear value={prodSku} onChange={e => setProdSku(e.target.value)} prefix={<SearchOutlined />} />
            </Col>
            <Col span={10}>
              <Input placeholder="Tên linh kiện cần tìm..." allowClear value={prodName} onChange={e => setProdName(e.target.value)} prefix={<SearchOutlined />} />
            </Col>
          </Row>
          <Table columns={productColumns} dataSource={filteredProducts} loading={loading} pagination={{ pageSize: 5 }} rowKey={r => r.Id || r.id} />
        </>
      )
    },
    {
      key: '2',
      label: <Space><UserOutlined />Khách Hàng ({filteredCustomers.length})</Space>,
      children: (
        <>
          <Row gutter={16} style={{ marginBottom: '20px' }}>
            <Col span={8}>
              <Input placeholder="Tên khách hàng..." allowClear value={custName} onChange={e => setCustName(e.target.value)} prefix={<SearchOutlined />} />
            </Col>
            <Col span={8}>
              <Input placeholder="Số điện thoại..." allowClear value={custPhone} onChange={e => setCustPhone(e.target.value)} prefix={<SearchOutlined />} />
            </Col>
          </Row>
          <Table columns={customerColumns} dataSource={filteredCustomers} loading={loading} pagination={{ pageSize: 5 }} rowKey={r => r.Id || r.id} />
        </>
      )
    },
    {
      key: '3',
      label: <Space><FileTextOutlined />Phiếu Nhập/Xuất ({filteredTickets.length})</Space>,
      children: (
        <>
          <Row gutter={16} style={{ marginBottom: '20px' }}>
            <Col span={8}>
              <Input placeholder="Mã phiếu (Ví dụ: BH-)" allowClear value={ticketCode} onChange={e => setTicketCode(e.target.value)} prefix={<SearchOutlined />} />
            </Col>
            <Col span={8}>
              <Input placeholder="Loại phiếu (Nhập / Xuất)..." allowClear value={ticketType} onChange={e => setTicketType(e.target.value)} prefix={<SearchOutlined />} />
            </Col>
          </Row>
          <Table columns={ticketColumns} dataSource={filteredTickets} loading={loading} pagination={{ pageSize: 5 }} rowKey={r => r.Id || r.id} />
        </>
      )
    }
  ];

  return (
    <>
      <div style={{ marginBottom: '20px' }}>
        <Text type="secondary">Dashboard / Trung tâm tìm kiếm</Text>
      </div>
      
      <Card style={{ borderRadius: '15px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
        <Title level={4} style={{ marginBottom: '25px' }}>🔍 Tìm Kiếm Nâng Cao Toàn Hệ Thống</Title>
        <Tabs defaultActiveKey="1" items={tabItems} size="large" />
      </Card>
    </>
  );
}