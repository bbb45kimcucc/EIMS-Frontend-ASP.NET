import React from 'react';
import { Card, Row, Col, Typography } from 'antd';
import {
  InboxOutlined,
  DatabaseOutlined,
  WarningOutlined,
  FileTextOutlined
} from '@ant-design/icons';

const { Title, Text } = Typography;

const colors = {
  border: '#E2E8F0',
  background: '#F1F5F9',
};

const StatCard = ({ icon, title, value }) => (
  <Card
    style={{
      borderRadius: '10px',
      border: `1px solid ${colors.border}`,
      boxShadow: 'none'
    }}
  >
    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
      <div style={{
        padding: 10,
        borderRadius: 8,
        background: '#EEF2FF'
      }}>
        {icon}
      </div>

      <div>
        <Text type="secondary">{title}</Text>
        <Title level={3} style={{ margin: 0 }}>{value}</Title>
      </div>
    </div>
  </Card>
);

export default function Dashboard() {
  return (
    <Row gutter={16}>
      <Col span={6}>
        <StatCard icon={<InboxOutlined />} title="Total Products" value={120} />
      </Col>

      <Col span={6}>
        <StatCard icon={<DatabaseOutlined />} title="Stock Quantity" value={850} />
      </Col>

      <Col span={6}>
        <StatCard icon={<WarningOutlined />} title="Low Stock" value={12} />
      </Col>

      <Col span={6}>
        <StatCard icon={<FileTextOutlined />} title="Today Tickets" value={5} />
      </Col>
    </Row>
  );
}