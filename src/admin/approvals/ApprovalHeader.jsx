import React from 'react';
import { Typography, Input, Space } from 'antd';

const { Title, Text } = Typography;

export default function ApprovalHeader({ onSearch }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '10px' }}>
      <div>
        <Title level={4} style={{ margin: 0 }}>Trung Tâm Phê Duyệt Hệ Thống</Title>
        <Text type="secondary">Quản lý và xét duyệt các yêu cầu thay đổi dữ liệu nhạy cảm.</Text>
      </div>
      
      <Space>
        <Input.Search 
          placeholder="Tìm tên, người gửi, lý do..." 
          allowClear 
          onChange={(e) => onSearch(e.target.value)}
          style={{ width: 280 }} 
        />
      </Space>
    </div>
  );
}