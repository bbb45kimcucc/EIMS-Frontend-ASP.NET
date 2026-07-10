import React from 'react';
import { Table, Tag, Typography, Button, Tooltip } from 'antd';
import { EyeOutlined } from '@ant-design/icons';
import moment from 'moment';

const { Text } = Typography;

// Thêm prop onViewDetail để truyền dữ liệu ra file cha khi click
export default function StockCardTable({ dataSource, loading, pagination, onChange, onViewDetail }) {
  const columns = [
    {
      title: 'Thời gian', dataIndex: 'transactionDate', width: 180,
      render: date => <Text type="secondary">{moment(date).format('DD/MM/YYYY HH:mm:ss')}</Text>
    },
    { 
      title: 'Tham chiếu', dataIndex: 'referenceCode', 
      render: text => <Tag color="blue" style={{ fontWeight: 'bold' }}>{text}</Tag> 
    },
    { 
      title: 'Sản phẩm', 
      render: (_, record) => (
        <div>
          <Text strong>{record.productName}</Text><br />
          <Text type="secondary" style={{ fontSize: '12px' }}>SKU: {record.productSku}</Text>
        </div>
      )
    },
    { title: 'Tồn đầu', dataIndex: 'beforeQty', align: 'center', render: qty => <Text>{qty}</Text> },
    {
      title: 'Biến động', dataIndex: 'changeQty', align: 'center',
      render: qty => {
        if (qty > 0) return <Text type="success" strong>+{qty}</Text>;
        if (qty < 0) return <Text type="danger" strong>{qty}</Text>;
        return <Text>{qty}</Text>;
      }
    },
    { title: 'Tồn cuối', dataIndex: 'afterQty', align: 'center', render: qty => <Text strong style={{ color: '#1890ff' }}>{qty}</Text> },
    { title: 'Ghi chú', dataIndex: 'note', ellipsis: true, render: text => <Text type="secondary">{text || '---'}</Text> },
    {
      // CỘT MỚI: Nút xem chi tiết
      title: 'Hành động',
      key: 'action',
      align: 'center',
      width: 100,
      render: (_, record) => (
        <Tooltip title="Xem chi tiết">
          <Button 
            type="text" 
            icon={<EyeOutlined style={{ color: '#1890ff', fontSize: '16px' }} />} 
            onClick={() => {
              // Gọi hàm từ file cha và truyền dữ liệu của dòng này ra
              if(onViewDetail) onViewDetail(record);
            }}
          />
        </Tooltip>
      )
    }
  ];

  return (
    <Table
      columns={columns} dataSource={dataSource} pagination={pagination}
      loading={loading} onChange={onChange}
      locale={{ emptyText: 'Chưa có giao dịch nào được ghi lại' }} bordered
    />
  );
}