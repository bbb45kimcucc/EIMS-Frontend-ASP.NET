import React from 'react';
import { Typography, Space, Input, Button } from 'antd';
import { PlusOutlined } from '@ant-design/icons';

const { Title } = Typography;

export default function CustomerHeader({ onSearch, onAdd }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px', alignItems: 'center' }}>
      <Title level={4} style={{ margin: 0 }}>Quản Lý Khách Hàng</Title>
      <Space>
        <Input.Search 
          placeholder="Tên hoặc SĐT..." 
          onSearch={onSearch} 
          allowClear
          style={{ width: 220 }} 
        />
        <Button 
          type="primary" 
          icon={<PlusOutlined />} 
          style={{ background: '#5570F1' }} 
          onClick={onAdd}
        >
          Thêm Khách
        </Button>
      </Space>
    </div>
  );
}