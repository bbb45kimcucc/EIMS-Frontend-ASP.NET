import React, { useState, useEffect } from 'react';
import { Layout, Menu, Typography, Avatar, Badge, Dropdown, Space, message, Tag } from 'antd';
import {
  DashboardOutlined,
  InboxOutlined,
  TagsOutlined,
  TeamOutlined,
  DatabaseOutlined,
  BellOutlined,
  UserOutlined,
  LogoutOutlined,
  ShopOutlined,
  HomeOutlined,
  FileTextOutlined,
  HistoryOutlined,
  SettingOutlined
} from '@ant-design/icons';
import { useNavigate, Outlet, useLocation } from 'react-router-dom';
import axios from 'axios';

const { Header, Sider, Content } = Layout;
const { Title, Text } = Typography;

export default function MainLayout() {
  const navigate = useNavigate();
  const location = useLocation();

  const storedUser = localStorage.getItem('user');
  const userData = (storedUser && storedUser !== "undefined")
    ? JSON.parse(storedUser)
    : {};

  const isAdmin = userData.Role === 'Admin' || userData.role === 'Admin';
  const [pendingCount, setPendingCount] = useState(0);

  // Vẫn giữ logic đếm thông báo cho Admin để giao diện chuyên nghiệp
  const fetchPendingCount = async () => {
    if (!isAdmin) return;
    try {
      const res = await axios.get('https://localhost:7033/api/ActionRequests', { withCredentials: true });
      const count = res.data.filter(item => item.Status === 'Pending' || item.status === 'Pending').length;
      setPendingCount(count);
    } catch (error) {
      console.log("Không tải được thông báo");
    }
  };

  useEffect(() => {
    fetchPendingCount();
  }, [location.pathname]);

  const handleMenuClick = (e) => {
    if (e.key === 'logout') {
      localStorage.removeItem('user');
      message.success("Hẹn gặp lại Cúc nhé!");
      navigate('/login');
    }
  };

  const getPageTitle = (path) => {
    const titles = {
      '/': 'Dashboard',
      '/products': 'Products',
      '/categories': 'Categories',
      '/brands': 'Brands',
      '/suppliers': 'Suppliers',
      '/customers': 'Customers',
      '/users': 'System Users',
      '/warehouses': 'Warehouses',
      '/inventory': 'Inventory',
      '/tickets': 'Inventory Tickets',
      '/stockcards': 'Stock Cards',
      '/approvals': 'System Approvals',
    };
    return titles[path] || 'WMS System';
  };

  // ==========================================
  // CẬP NHẬT: Mở hết tất cả Menu cho tất cả Role
  // ==========================================
  const menuItems = [
    { key: '/', icon: <DashboardOutlined />, label: 'Dashboard' },
    { key: '/products', icon: <InboxOutlined />, label: 'Products' },
    { key: '/categories', icon: <TagsOutlined />, label: 'Categories' },
    { key: '/brands', icon: <TagsOutlined />, label: 'Brands' },
    { key: '/salesorders', icon: <TagsOutlined />, label: 'SalesOrder' },

    { key: '/inventory', icon: <DatabaseOutlined />, label: 'Inventory' },
    { key: '/tickets', icon: <FileTextOutlined />, label: 'Inventory Tickets' },
    { key: '/stockcards', icon: <HistoryOutlined />, label: 'Stock Cards' },

    { type: 'divider' },

    { key: '/suppliers', icon: <ShopOutlined />, label: 'Suppliers' },
    { key: '/customers', icon: <TeamOutlined />, label: 'Customers' },
    { key: '/warehouses', icon: <HomeOutlined />, label: 'Warehouses' },

    { type: 'divider' },

    // TRƯỚC ĐÂY BỊ KHÓA, GIỜ ĐÃ MỞ CHO STAFF XEM LUÔN
    { key: '/users', icon: <UserOutlined />, label: 'Users' },
    { key: '/approvals', icon: <SettingOutlined />, label: 'Approvals' },
  ];

  const userMenu = {
    items: [
      { key: 'profile', icon: <UserOutlined />, label: 'Profile' },
      { type: 'divider' },
      { key: 'logout', icon: <LogoutOutlined />, danger: true, label: 'Logout' },
    ],
    onClick: handleMenuClick,
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider
        theme="dark"
        width={240}
        style={{ position: 'fixed', height: '100vh', left: 0, background: '#1E293B' }}
      >
        <div
          style={{ padding: '20px', fontSize: '20px', fontWeight: '700', color: '#fff', cursor: 'pointer' }}
          onClick={() => navigate('/')}
        >
          📦 WMS System
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[location.pathname]}
          onClick={(e) => navigate(e.key)}
          items={menuItems}
        />
      </Sider>

      <Layout style={{ marginLeft: 240 }}>
        <Header style={{
          background: '#fff',
          padding: '0 24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: '1px solid #E2E8F0',
          height: '64px', // Cố định chiều cao
          position: 'sticky', // Cho nó dính lên đầu luôn
          top: 0,
          zIndex: 1,
          width: '100%'
        }}>
          {/* BÊN TRÁI: TIÊU ĐỀ TRANG */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <Title level={4} style={{ margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {getPageTitle(location.pathname)}
            </Title>
            <Text type="secondary" style={{ fontSize: '12px', display: 'block' }}>
              WMS System
            </Text>
          </div>

          {/* BÊN PHẢI: THÔNG BÁO & USER (CHỈNH LẠI CHỖ NÀY) */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '24px', flexShrink: 0 }}>
            {/* CHUÔNG THÔNG BÁO */}
            <Badge count={isAdmin ? pendingCount : 0} size="small">
              <BellOutlined
                style={{ fontSize: '20px', cursor: 'pointer', padding: '4px' }}
                onClick={() => navigate('/approvals')}
              />
            </Badge>

            {/* CỤM USER INFO */}
            <Dropdown menu={userMenu} placement="bottomRight" trigger={['click']}>
              <Space style={{ cursor: 'pointer', padding: '4px 8px', borderRadius: '8px', transition: 'all 0.3s' }} className="user-dropdown-hover">
                <Avatar
                  style={{ backgroundColor: isAdmin ? '#f56a00' : '#7265e6', verticalAlign: 'middle' }}
                  size="default"
                >
                  {userData.FullName?.charAt(0).toUpperCase() || "U"}
                </Avatar>

                {/* Đảm bảo phần này không bị che */}
                <div style={{ display: 'flex', flexDirection: 'column', lineHeight: '1.2' }}>
                  {/* Chỗ hiện tên User nè Cúc */}
                  <Text strong style={{ display: 'block', maxWidth: '150px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    Hi {userData.FullName || userData.fullName || "User"}
                  </Text>
                  <Tag color={isAdmin ? "gold" : "blue"} style={{ fontSize: '10px', margin: 0, width: 'fit-content' }}>
                    {userData.Role || userData.role || "Staff"}
                  </Tag>
                </div>
              </Space>
            </Dropdown>
          </div>
        </Header>

        <Content style={{ margin: '20px', padding: '20px', background: '#fff', borderRadius: '10px', minHeight: 'calc(100vh - 100px)' }}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
}