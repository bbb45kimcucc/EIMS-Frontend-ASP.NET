import React from 'react';
import { Typography, Space, Input, Button } from 'antd';
import { FilterOutlined } from '@ant-design/icons';

const { Title } = Typography;

export default function InventoryHeader({ onSearch }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
      <Title level={4} style={{ margin: 0 }}>Theo Dõi Tồn Kho (Stock Tracking)</Title>
      <Space>
        <Input.Search 
          placeholder="Mã SKU hoặc Tên..." 
          allowClear
          onSearch={onSearch}
          style={{ width: 250 }} 
        />
        <Button icon={<FilterOutlined />}>Lọc</Button>
      </Space>
    </div>
  );
}