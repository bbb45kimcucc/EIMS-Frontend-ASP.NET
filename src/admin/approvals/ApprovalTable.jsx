import React from 'react';
import { Table, Tag, Space, Button, Popconfirm, Typography } from 'antd';
import { CheckOutlined, CloseOutlined } from '@ant-design/icons';
import moment from 'moment';

const { Text } = Typography;

export default function ApprovalTable({ dataSource, loading, onAction, actionLoadingId }) {
  const columns = [
    {
      title: 'Ngày Yêu Cầu',
      dataIndex: 'createdAt',
      width: 150,
      render: date => <Text type="secondary">{moment(date).format('DD/MM/YYYY HH:mm')}</Text>
    },
    {
      title: 'Loại Yêu Cầu',
      dataIndex: 'actionType',
      render: text => {
        if (text === 'Delete_Customer') return <Text strong>🗑️ Xóa Khách hàng</Text>;
        if (text === 'Delete_Warehouse') return <Text strong>🗑️ Xóa Kho hàng</Text>;
        if (text === 'Delete_InventoryTicket') return <Text strong>🗑️ Hủy Phiếu Kho</Text>;
        return <Text strong>{text}</Text>;
      }
    },
    {
      title: 'Mục Tiêu',
      dataIndex: 'content',
      render: text => <Text type="danger" strong>{text}</Text>
    },
    {
      title: 'Lý Do Xin Xóa',
      dataIndex: 'reason',
      width: '25%',
      render: text => <i>{text || 'Không có lý do'}</i>
    },
    {
      title: 'Người Gửi',
      dataIndex: 'createdBy',
      render: text => <Tag color="blue">{text}</Tag>
    },
    {
      title: 'Trạng Thái',
      dataIndex: 'status',
      align: 'center',
      render: status => {
        const color = status === 'Pending' ? 'warning' : status === 'Approved' ? 'success' : 'error';
        const label = status === 'Pending' ? 'Chờ duyệt' : status === 'Approved' ? 'Đã duyệt' : 'Từ chối';
        return <Tag color={color} style={{ minWidth: '70px' }}>{label.toUpperCase()}</Tag>;
      }
    },
    {
      title: 'Hành Động',
      align: 'center',
      width: 180,
      render: (_, record) => {
        const isActionLoading = actionLoadingId === record.id;

        if (record.status !== 'Pending') {
          return <Text type="secondary" italic>Đã xử lý</Text>;
        }

        return (
          <Space>
            <Popconfirm title="Chắc chắn DUYỆT yêu cầu này?" onConfirm={() => onAction(record.id, 'approve')}>
              <Button type="primary" size="small" icon={<CheckOutlined />} loading={isActionLoading}>
                Duyệt
              </Button>
            </Popconfirm>
            <Popconfirm title="TỪ CHỐI yêu cầu này?" onConfirm={() => onAction(record.id, 'reject')}>
              <Button danger size="small" icon={<CloseOutlined />} loading={isActionLoading}>
                Từ chối
              </Button>
            </Popconfirm>
          </Space>
        );
      }
    }
  ];

  return (
    <Table 
      columns={columns} 
      dataSource={dataSource} 
      loading={loading} 
      pagination={{ pageSize: 8 }} 
      rowKey="id"
      size="middle"
    />
  );
}