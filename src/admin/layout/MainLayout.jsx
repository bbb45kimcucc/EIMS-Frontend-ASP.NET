import React from 'react';
import { Layout } from 'antd';
import { Outlet } from 'react-router-dom';
import AppSidebar from './AppSidebar';
import AppHeader from './AppHeader';


const { Content } = Layout;

export default function MainLayout() {
  return (
    <Layout style={{ minHeight: '100vh' }}>
      {/* Cột Menu bên trái */}
      <AppSidebar />

      {/* Khung nội dung bên phải (đã trừ đi 260px của Sidebar) */}
      <Layout style={{ marginLeft: 260 }}>
        
        {/* Thanh Header ở trên cùng */}
        <AppHeader />

        {/* Nội dung chính của từng trang sẽ render vào đây */}
        <Content
          style={{
            margin: '24px',
            padding: '24px',
            background: '#fff',
            borderRadius: '16px',
            minHeight: 'calc(100vh - 120px)',
            boxShadow: '0 2px 10px rgba(0,0,0,0.04)',
          }}
        >
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
}