import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Typography, Table, Tag, Button, List, Space } from 'antd';
import {
  InboxOutlined, DatabaseOutlined, WarningOutlined, FileTextOutlined, ArrowRightOutlined, DollarOutlined,
  FireOutlined, EyeOutlined, ShoppingCartOutlined
} from '@ant-design/icons';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';
import axios from 'axios';
import dayjs from 'dayjs';
import { useNavigate } from 'react-router-dom';

const { Title, Text } = Typography;

// --- COMPONENT THẺ THỐNG KÊ ---
const StatCard = ({ icon, title, value, color, bgColor }) => (
  <Card
    hoverable
    style={{
      borderRadius: '16px',
      border: 'none',
      boxShadow: '0 4px 20px rgba(0,0,0,0.04)',
      overflow: 'hidden',
      position: 'relative'
    }}
    bodyStyle={{ padding: '24px' }}
  >
    <div style={{
      position: 'absolute', top: '-20px', right: '-20px',
      width: '100px', height: '100px', borderRadius: '50%',
      background: bgColor, opacity: 0.4, zIndex: 0
    }} />
    <div style={{ display: 'flex', alignItems: 'center', gap: 16, position: 'relative', zIndex: 1 }}>
      <div style={{
        padding: '16px', borderRadius: '14px', background: bgColor, color: color, fontSize: '28px',
        display: 'flex', alignItems: 'center', justifyContent: 'center'
      }}>
        {icon}
      </div>
      <div>
        <Text type="secondary" style={{ fontSize: '14px', fontWeight: 500 }}>{title}</Text>
        <Title level={2} style={{ margin: 0, color: '#1E293B' }}>{value}</Title>
      </div>
    </div>
  </Card>
);

export default function Dashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  // State lưu con số tổng quan
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalStock: 0,
    lowStock: 0,
    todayTickets: 0,
    todayTotalAmount: 0
  });

  // State lưu dữ liệu
  const [recentActivities, setRecentActivities] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [topProducts, setTopProducts] = useState([]);

  axios.defaults.withCredentials = true;

  // --- GỌI API LẤY DỮ LIỆU THỰC ---
  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        const [resProds, resTickets] = await Promise.all([
          axios.get('/api/Products'),
          axios.get('/api/InventoryTickets')
        ]);

        const products = resProds.data || [];
        const tickets = resTickets.data || [];

        // 1. Tính toán con số cho Sản phẩm
        let totalStock = 0;
        let lowStockCount = 0;
        products.forEach(p => {
          const qty = p.Quantity ?? p.quantity ?? p.CurrentStock ?? p.currentStock ?? 0;
          totalStock += qty;
          if (qty > 0 && qty < 10) lowStockCount++;
        });

        // 2. Tính toán con số cho Phiếu & Doanh thu Hôm nay
        const today = dayjs().startOf('day').valueOf();
        const todayTicketsList = tickets.filter(t => dayjs(t.CreatedAt || t.createdAt).valueOf() >= today);
        
        const totalAmountToday = todayTicketsList.reduce((sum, ticket) => {
          const amount = ticket.TotalAmount || ticket.totalAmount || 0;
          return sum + amount;
        }, 0);

        setStats({
          totalProducts: products.length,
          totalStock: totalStock,
          lowStock: lowStockCount,
          todayTickets: todayTicketsList.length,
          todayTotalAmount: totalAmountToday
        });

        // 3. Lấy 5 giao dịch gần nhất cho Bảng
        const sortedTickets = [...tickets].sort((a, b) => new Date(b.CreatedAt || b.createdAt) - new Date(a.CreatedAt || a.createdAt));
        setRecentActivities(sortedTickets.slice(0, 5));

        // 🌟 4. XỬ LÝ DỮ LIỆU TOP SẢN PHẨM BÁN CHẠY (Giả lập lượt xem & lượt mua dựa trên DB thật)
        const productsWithSalesData = products.map((p) => ({
          ...p,
          soldCount: Math.floor(Math.random() * 300) + 50,
          views: Math.floor(Math.random() * 2000) + 150
        }));
        
        const sortedTop = productsWithSalesData.sort((a, b) => b.soldCount - a.soldCount).slice(0, 5);
        setTopProducts(sortedTop);

        // 5. Fake Data Biểu đồ Nhập Xuất
        const mockChartData = Array.from({ length: 7 }).map((_, i) => {
          const d = dayjs().subtract(6 - i, 'day').format('DD/MM');
          return {
            name: d,
            Nhap: Math.floor(Math.random() * 50) + 10,
            Xuat: Math.floor(Math.random() * 40) + 5,
          };
        });
        setChartData(mockChartData);

      } catch (error) {
        console.error("Lỗi tải Dashboard:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // --- Dữ liệu Biểu đồ Tròn ---
  const pieData = [
    { name: 'Còn nhiều', value: stats.totalProducts - stats.lowStock, color: '#10B981' },
    { name: 'Sắp hết (Dưới 10)', value: stats.lowStock, color: '#F59E0B' },
  ];

  // --- Cấu hình Cột cho Bảng Giao Dịch ---
  const columns = [
    { title: 'Mã Phiếu', dataIndex: 'TicketCode', render: (_, r) => <strong>{r.TicketCode || r.ticketCode}</strong> },
    {
      title: 'Loại',
      render: (_, r) => {
        const type = r.Type || r.type || 'Nhập';
        return <Tag color={type.toLowerCase() === 'nhập' ? 'green' : 'volcano'}>{type.toUpperCase()}</Tag>;
      }
    },
    { title: 'Ngày Lập', render: (_, r) => dayjs(r.CreatedAt || r.createdAt).format('DD/MM/YYYY HH:mm') },
    { title: 'Tổng Tiền', render: (_, r) => <Text type="success">{(r.TotalAmount || r.totalAmount || 0).toLocaleString()} đ</Text> }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

      {/* 1. HÀNG THỐNG KÊ (5 STAT CARDS) */}
      <Row gutter={[24, 24]}>
        <Col flex="1 1 200px">
          <StatCard icon={<InboxOutlined />} title="Tổng Sản Phẩm" value={stats.totalProducts} color="#3B82F6" bgColor="#E0E7FF" />
        </Col>
        <Col flex="1 1 200px">
          <StatCard icon={<DatabaseOutlined />} title="Tổng Tồn Kho" value={stats.totalStock.toLocaleString()} color="#10B981" bgColor="#D1FAE5" />
        </Col>
        <Col flex="1 1 200px">
          <StatCard icon={<WarningOutlined />} title="Cảnh Báo Sắp Hết" value={stats.lowStock} color="#F59E0B" bgColor="#FEF3C7" />
        </Col>
        <Col flex="1 1 200px">
          <StatCard icon={<FileTextOutlined />} title="Phiếu Hôm Nay" value={stats.todayTickets} color="#EF4444" bgColor="#FEE2E2" />
        </Col>
        <Col flex="1 1 200px">
          <StatCard
            icon={<DollarOutlined />}
            title="Tổng Tiền Hôm Nay"
            value={`${stats.todayTotalAmount.toLocaleString()} đ`}
            color="#8B5CF6"
            bgColor="#EDE9FE"
          />
        </Col>
      </Row>

      {/* 2. HÀNG BIỂU ĐỒ (CHARTS) */}
      <Row gutter={[24, 24]}>
        {/* Biểu đồ Đường - Nhập Xuất */}
        <Col xs={24} lg={16}>
          <Card title={<Title level={5} style={{ margin: 0 }}>Thống Kê Nhập / Xuất (7 Ngày Qua)</Title>} bordered={false} style={{ borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.02)' }}>
            <div style={{ height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748B' }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748B' }} />
                  <RechartsTooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                  <Legend verticalAlign="top" height={36} />
                  <Line type="monotone" name="Nhập Kho" dataKey="Nhap" stroke="#10B981" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
                  <Line type="monotone" name="Xuất Kho" dataKey="Xuat" stroke="#EF4444" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </Col>

        {/* Biểu đồ Tròn - Tỷ lệ Tồn Kho */}
        <Col xs={24} lg={8}>
          <Card title={<Title level={5} style={{ margin: 0 }}>Tình Trạng Hàng Hóa</Title>} bordered={false} style={{ borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.02)', height: '100%' }}>
            <div style={{ height: 260, display: 'flex', justifyContent: 'center' }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={5} dataKey="value">
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <RechartsTooltip />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </Col>
      </Row>

      {/* 3. HÀNG DỮ LIỆU: BẢNG GIAO DỊCH & TOP BÁN CHẠY */}
      <Row gutter={[24, 24]}>
        {/* Bảng Giao Dịch Gần Đây */}
        <Col xs={24} lg={15}>
          <Card
            title={<Title level={5} style={{ margin: 0 }}>Giao Dịch Mới Nhất</Title>}
            extra={<Button type="link" onClick={() => navigate('/tickets')}>Xem tất cả <ArrowRightOutlined /></Button>}
            bordered={false}
            style={{ borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.02)', height: '100%' }}
          >
            <Table
              columns={columns}
              dataSource={recentActivities}
              rowKey={(r) => r.Id || r.id}
              pagination={false}
              loading={loading}
              size="middle"
            />
          </Card>
        </Col>

        {/* 🌟 Bảng Xếp Hạng Top Bán Chạy */}
        <Col xs={24} lg={9}>
          <Card
            title={<Space><FireOutlined style={{ color: '#ef4444' }}/><Title level={5} style={{ margin: 0 }}>Top Sản Phẩm Bán Chạy</Title></Space>}
            bordered={false}
            style={{ borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.02)', height: '100%' }}
          >
            <List
              loading={loading}
              itemLayout="horizontal"
              dataSource={topProducts}
              renderItem={(item, index) => (
                <List.Item>
                  <List.Item.Meta
                    avatar={
                      <div style={{ 
                        width: 40, height: 40, borderRadius: 8, 
                        background: index === 0 ? '#FEF2F2' : index === 1 ? '#FFFBEB' : index === 2 ? '#F0FDF4' : '#F8FAFC',
                        color: index === 0 ? '#EF4444' : index === 1 ? '#F59E0B' : index === 2 ? '#10B981' : '#64748B',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: 16
                      }}>
                        #{index + 1}
                      </div>
                    }
                    title={<Text strong ellipsis style={{ width: '150px' }}>{item.ProductName || item.productName}</Text>}
                    description={
                      <Space size="middle" style={{ fontSize: '12px' }}>
                        <span style={{ color: '#64748B' }}><EyeOutlined /> {item.views} lượt xem</span>
                      </Space>
                    }
                  />
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ color: '#10B981', fontWeight: 'bold' }}><ShoppingCartOutlined /> {item.soldCount}</div>
                    <div style={{ fontSize: '12px', color: '#94A3B8' }}>đã bán</div>
                  </div>
                </List.Item>
              )}
            />
          </Card>
        </Col>
      </Row>

    </div>
  );
}