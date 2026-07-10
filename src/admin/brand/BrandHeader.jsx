import React from 'react';
import { Typography, Space, Input, Button } from 'antd';
import { PlusOutlined } from '@ant-design/icons';

const { Title } = Typography;

export default function BrandHeader({ onSearch, onAdd }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px', alignItems: 'center' }}>
      <Title level={4} style={{ margin: 0 }}>Brands List</Title>
      <Space>
        {/* Thêm ô tìm kiếm cho đồng bộ với Categories */}
        <Input.Search
          placeholder="Tìm tên thương hiệu..."
          allowClear
          onChange={(e) => onSearch(e.target.value)}
          style={{ width: 250 }}
        />
        <Button 
          type="primary" 
          icon={<PlusOutlined />} 
          style={{ background: '#5570F1', borderRadius: '8px' }} 
          onClick={onAdd}
        >
          Add Brand
        </Button>
      </Space>
    </div>
  );
}