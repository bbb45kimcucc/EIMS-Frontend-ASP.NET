import React from 'react';
import { Layout, Menu } from 'antd';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  DashboardOutlined, SearchOutlined, DatabaseOutlined, UserOutlined,
  ShopOutlined, FileTextOutlined, TeamOutlined, InboxOutlined,
  TagsOutlined, HomeOutlined, CalendarOutlined, SettingOutlined
} from '@ant-design/icons';

const { Sider } = Layout;

export default function AppSidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const storedUser = localStorage.getItem("user");
const userData = storedUser ? JSON.parse(storedUser) : {};

const role = userData.role || userData.Role || "";

const isAdmin = role === "Admin";
const isWarehouse = role === "Warehouse";
const isSales = role === "Sales";

  const menuItems = [
    { key: '/', icon: <DashboardOutlined />, label: 'Dashboard' },
    { key: '/search', icon: <SearchOutlined />, label: 'Tìm kiếm nâng cao' },

    { type: 'divider' },

    // ===== ADMIN hoặc SALES =====
    ...(isAdmin || isSales ? [{
      key: 'sales-group',
      icon: <ShopOutlined />,
      label: 'Bán Hàng & Đối Tác',
      children: [
        { key: '/salesorders', icon: <FileTextOutlined />, label: 'Đơn Bán Hàng' },
        { key: '/customers', icon: <TeamOutlined />, label: 'Khách Hàng' },
      ],
    }] : []),

    // ===== ADMIN hoặc WAREHOUSE =====
    ...(isAdmin || isWarehouse ? [{
      key: 'inventory-group',
      icon: <DatabaseOutlined />,
      label: 'Quản Lý Kho',
      children: [
        { key: '/inventory', icon: <InboxOutlined />, label: 'Tồn Kho Hiện Tại' },
        { key: '/tickets', icon: <FileTextOutlined />, label: 'Phiếu Nhập / Xuất' },
        { key: '/stockcards', icon: <TagsOutlined />, label: 'Thẻ Kho' },
        { key: '/products', icon: <InboxOutlined />, label: 'Linh Kiện' },
        { key: '/categories', icon: <TagsOutlined />, label: 'Danh Mục' },
        { key: '/brands', icon: <TagsOutlined />, label: 'Thương Hiệu' },
        { key: '/warehouses', icon: <HomeOutlined />, label: 'Kho Bãi' },
        { key: '/suppliers', icon: <ShopOutlined />, label: 'Nhà Cung Cấp' },
      ],
    }] : []),

    // ===== Chỉ ADMIN =====
    ...(isAdmin ? [{
      key: 'users-group',
      icon: <UserOutlined />,
      label: 'Nhân Sự & Nội Bộ',
      children: [
        { key: '/users', icon: <UserOutlined />, label: 'Tài Khoản & Quyền' },
        { key: '/payrolltable', icon: <TagsOutlined />, label: 'Bảng Lương' },
        { key: '/work-schedules', icon: <CalendarOutlined />, label: 'Lịch Làm & Phép' },
        { key: '/approvals', icon: <SettingOutlined />, label: 'Trung Tâm Phê Duyệt' },
      ],
    }] : []),
];

  return (
    <Sider
      theme="dark"
      width={260}
      style={{
        position: 'fixed',
        left: 0,
        top: 0,
        height: '100vh',
        background: '#0F172A',
        overflow: 'auto',
        boxShadow: '2px 0 8px rgba(0,0,0,0.1)',
      }}
    >
      <div
        onClick={() => navigate('/')}
        style={{
          padding: '24px', fontSize: '24px', fontWeight: '700', color: '#fff',
          cursor: 'pointer', borderBottom: '1px solid rgba(255,255,255,0.08)',
          textAlign: 'center', letterSpacing: '1px',
        }}
      >
        📦 WMS System
      </div>
      <Menu
        theme="dark"
        mode="inline"
        selectedKeys={[location.pathname]}
        // Cho phép mở sẵn các thư mục này khi vừa load trang
        defaultOpenKeys={['sales-group', 'inventory-group', 'users-group']}
        onClick={(e) => navigate(e.key)}
        items={menuItems}
        style={{ background: '#0F172A', borderRight: 0, paddingTop: '12px', fontSize: '14px' }}
      />
    </Sider>
  );
}