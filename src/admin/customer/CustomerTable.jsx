import React from 'react';
import { Table, Space, Tag, Button, Tooltip, Typography } from 'antd';
import { 
  UserOutlined, PhoneOutlined, WalletOutlined, 
  ClockCircleOutlined, EyeOutlined, EditOutlined, DeleteOutlined 
} from '@ant-design/icons';

const { Text } = Typography;

export default function CustomerTable({ 
  dataSource, loading, pendingDeleteIds, onShowHistory, onEdit, onDelete 
}) {
  const columns = [
    { 
      title: 'Tên Khách Hàng', 
      dataIndex: 'name', 
      render: (text, record) => {
        const isPending = pendingDeleteIds.includes(record.id);
        return (
          <Space>
            <UserOutlined style={{ color: isPending ? '#d9d9d9' : '#8c8c8c' }}/>
            <strong style={{ color: isPending ? '#d9d9d9' : 'inherit', textDecoration: isPending ? 'line-through' : 'none' }}>
              {text}
            </strong>
            {isPending && <Tag color="warning" icon={<ClockCircleOutlined />}>Đang chờ duyệt xóa</Tag>}
          </Space>
        )
      }
    },
    { 
      title: 'Số điện thoại', 
      dataIndex: 'phone', 
      render: (text, record) => {
        const isPending = pendingDeleteIds.includes(record.id);
        return text ? <Text disabled={isPending}><PhoneOutlined style={{ color: isPending ? '#d9d9d9' : '#5570F1', marginRight: 5}} />{text}</Text> : '-';
      }
    },
  
    {
      title: 'Hành động',
      align: 'right',
      render: (_, record) => {
        const isPending = pendingDeleteIds.includes(record.id);
        if (isPending) {
          return (
            <Tooltip title="Mục này đang bị khóa chờ Admin xử lý">
              <Space>
                <Button type="text" disabled icon={<EyeOutlined />} />
                <Button type="text" disabled icon={<EditOutlined />} />
                <Button type="text" disabled icon={<DeleteOutlined />} />
              </Space>
            </Tooltip>
          );
        }

        return (
          <Space>
            <Tooltip title="Xem lịch sử mua hàng">
              <Button type="text" icon={<EyeOutlined />} style={{ color: '#52c41a' }} onClick={() => onShowHistory(record)} />
            </Tooltip>
            <Button type="text" icon={<EditOutlined />} style={{ color: '#5570F1' }} onClick={() => onEdit(record)} />
            <Button type="text" danger icon={<DeleteOutlined />} onClick={() => onDelete(record)} />
          </Space>
        )
      },
    },
  ];

  return (
    <>
      <style>{`
        .custom-hover-table .ant-table-tbody > tr.ant-table-row:hover > td,
        .custom-hover-table .ant-table-tbody > tr:hover > td {
          background-color: #f0f5ff !important; 
          transition: background-color 0.3s ease;
        }
        .pending-delete-row { opacity: 0.6; }
      `}</style>

      <Table 
        className="custom-hover-table"
        columns={columns} 
        dataSource={dataSource} 
        pagination={{ pageSize: 8 }} 
        loading={loading} 
        rowClassName={(record) => pendingDeleteIds.includes(record.id) ? 'pending-delete-row' : ''}
      />
    </>
  );
}