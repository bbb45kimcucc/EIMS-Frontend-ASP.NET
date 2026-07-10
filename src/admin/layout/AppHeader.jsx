import React, { useState, useEffect } from 'react';
import { Layout, Typography, Avatar, Badge, Dropdown, Space, Tag, message } from 'antd';
import { BellOutlined, UserOutlined, LogoutOutlined } from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';

import GlobalSearch from './GlobalSearch';

// Import component Tìm kiếm toàn cục

const { Header } = Layout;
const { Title, Text } = Typography;

export default function AppHeader() {
  const navigate = useNavigate();
  const location = useLocation();
const storedUser = localStorage.getItem("user");

const userData =
  storedUser && storedUser !== "undefined"
    ? JSON.parse(storedUser)
    : {};

const userRole = userData.Role || userData.role || "Staff";

const displayFullName =
  userData.FullName ||
  userData.fullName ||
  "User";

const displayRole = userRole;

const isAdmin = userRole === "Admin";
  const [pendingCount, setPendingCount] = useState(0);

const fetchPendingCount = async () => {
    if (!isAdmin) return;
    try {
      const res = await axios.get('/api/ActionRequests', { withCredentials: true });
      
      // BƯỚC PHÒNG THỦ: Đảm bảo data luôn là mảng (Array)
      const requestData = Array.isArray(res.data) ? res.data : [];
      
      // Bây giờ filter sẽ không bao giờ bị lỗi undefined nữa
      const count = requestData.filter(item => item.Status === 'Pending' || item.status === 'Pending').length;
      
      setPendingCount(count);
    } catch (error) {
      console.log('Không tải được thông báo');
    }
  };

  useEffect(() => { fetchPendingCount(); }, [location.pathname]);

  const handleMenuClick = (e) => {
    if (e.key === 'logout') {
      localStorage.removeItem('user');
      message.success('Hẹn gặp lại Cúc nhé!');
      navigate('/login');
    }
  };

  const getPageTitle = (path) => {
    const titles = {
      '/': 'Dashboard', '/products': 'Products', '/categories': 'Categories',
      '/brands': 'Brands', '/salesorders': 'Sales Orders', '/inventory': 'Inventory',
      '/tickets': 'Inventory Tickets', '/stockcards': 'Stock Cards', '/suppliers': 'Suppliers',
      '/customers': 'Customers', '/users': 'System Users', '/work-schedules': 'LeaveManagement',
      '/warehouses': 'Warehouses', '/approvals': 'System Approvals',
    };
    return titles[path] || 'WMS System';
  };

  const userMenu = {
    items: [
      { key: 'profile', icon: <UserOutlined />, label: 'Profile' },
      { type: 'divider' },
      { key: 'logout', icon: <LogoutOutlined />, danger: true, label: 'Logout' },
    ],
    onClick: handleMenuClick,
  };

  return (
    <Header
      style={{
        background: '#fff', padding: '0 28px', display: 'flex',
        justifyContent: 'space-between', alignItems: 'center',
        borderBottom: '1px solid #E2E8F0', position: 'sticky',
        top: 0, zIndex: 100, height: '72px',
      }}
    >
      {/* LEFT: Tiêu đề trang */}
      <div style={{ minWidth: '200px' }}>
        <Title level={4} style={{ margin: 0, fontWeight: 700 }}>
          {getPageTitle(location.pathname)}
        </Title>
        <Text type="secondary" style={{ fontSize: '12px' }}>Warehouse Management System</Text>
      </div>

      {/* CENTER: Thanh tìm kiếm toàn cục (Omnibar) */}
      <div style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
        <GlobalSearch />
      </div>

      {/* RIGHT: Thông báo & Profile */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '24px', minWidth: '200px', justifyContent: 'flex-end' }}>
        <Badge count={isAdmin ? pendingCount : 0} size="small">
          <BellOutlined
            onClick={() => navigate('/approvals')}
            style={{
              fontSize: '20px', cursor: 'pointer', padding: '8px',
              borderRadius: '50%', background: '#F8FAFC',
            }}
          />
        </Badge>

        <Dropdown menu={userMenu} placement="bottomRight" trigger={['click']}>
          <Space style={{ cursor: 'pointer', padding: '8px 14px', borderRadius: '12px', background: '#F8FAFC', transition: '0.3s' }}>
            <Avatar size={42} style={{ backgroundColor: isAdmin ? '#F59E0B' : '#6366F1', fontWeight: 'bold' }}>
              {displayFullName.charAt(0).toUpperCase()}
            </Avatar>
            <div style={{ display: 'flex', flexDirection: 'column', lineHeight: '1.2' }}>
              <Text strong style={{ fontSize: '14px' }}>Hi {displayFullName}</Text>
              <Tag color={isAdmin ? 'gold' : 'blue'} style={{ width: 'fit-content', margin: 0, fontSize: '10px' }}>
                {displayRole}
              </Tag>
            </div>
          </Space>
        </Dropdown>
      </div>
    </Header>
  );
}