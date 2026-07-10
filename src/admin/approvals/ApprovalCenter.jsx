import React, { useState, useEffect } from 'react';
import { Card, Typography, message, Tabs, Badge, Modal, Form, Input, Button, Select } from 'antd';
import axios from 'axios';

// Import Component con
import ApprovalHeader from './ApprovalHeader';
import ApprovalTable from './ApprovalTable';

const { Text } = Typography;
const { Option } = Select;

export default function ApprovalCenter() {
  const [requests, setRequests] = useState([]);
  const [users, setUsers] = useState([]); // State lưu danh sách nhân viên để chọn
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');

  // State cho Modal thông báo
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [sending, setSending] = useState(false);

  // State nâng cao
  const [activeTab, setActiveTab] = useState('Pending');
  const [actionLoadingId, setActionLoadingId] = useState(null);

  const storedUser = localStorage.getItem('user');
  const currentUser = (storedUser && storedUser !== "undefined" && storedUser !== "null") ? JSON.parse(storedUser) : {};

  const axiosConfig = {
    withCredentials: true,
    headers: {
      'User-Role': currentUser.Role || currentUser.role || '',
      'User-Id': currentUser.Id || currentUser.id || ''
    }
  };

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/ActionRequests', axiosConfig);
      const realData = res.data.map(item => ({
        key: item.Id || item.id,
        id: item.Id || item.id,
        actionType: item.ActionType || item.actionType,
        content: item.Content || item.content,
        reason: item.Reason || item.reason,
        status: item.Status || item.status,
        createdBy: item.CreatedBy || item.createdBy,
        createdAt: item.CreatedAt || item.createdAt
      }));

      realData.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setRequests(realData);
    } catch (error) {
      message.error("Lỗi khi tải danh sách yêu cầu!");
    } finally {
      setLoading(false);
    }
  };

  // Hàm lấy danh sách user để đổ vào Select
  const fetchUsers = async () => {
    try {
      const res = await axios.get('/api/Users', axiosConfig);
      setUsers(res.data);
    } catch (error) {
      console.error("Không lấy được danh sách nhân viên");
    }
  };

  useEffect(() => {
    fetchRequests();
    fetchUsers();
  }, []);

  const handleAction = async (id, action) => {
    setActionLoadingId(id);
    try {
      const res = await axios.post(`/api/ActionRequests/${action}/${id}`, {}, axiosConfig);
      message.success(res.data.message + " (Đã gửi email cho nhân viên)");
      await fetchRequests();
    } catch (error) {
      const errorMsg = error.response?.data?.message || "Lỗi khi xử lý yêu cầu!";
      message.error(errorMsg);
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleSendNotification = async (values) => {
    setSending(true);
    try {
      // Đổi đường dẫn thành:
      await axios.post('/api/ActionRequests/send-custom-notification', values, axiosConfig);

      message.success("Đã gửi thông báo!");
      setIsModalVisible(false);
      form.resetFields();
    } catch (error) {
      message.error("Gửi thông báo thất bại!");
    } finally {
      setSending(false);
    }
  };

  const filteredData = requests.filter((item) => {
    const matchTab = activeTab === 'All' ? true : item.status === activeTab;
    const lowerCaseSearch = searchText.toLowerCase();
    const matchSearch =
      (item.content && item.content.toLowerCase().includes(lowerCaseSearch)) ||
      (item.createdBy && item.createdBy.toLowerCase().includes(lowerCaseSearch)) ||
      (item.reason && item.reason.toLowerCase().includes(lowerCaseSearch));
    return matchTab && matchSearch;
  });

  const pendingCount = requests.filter(r => r.status === 'Pending').length;
  const approvedCount = requests.filter(r => r.status === 'Approved').length;
  const rejectedCount = requests.filter(r => r.status === 'Rejected').length;

  const tabItems = [
    { key: 'Pending', label: <span>Chờ Duyệt <Badge count={pendingCount} overflowCount={99} style={{ backgroundColor: '#faad14', marginLeft: '5px' }} /></span> },
    { key: 'Approved', label: <span>Đã Duyệt <Badge count={approvedCount} overflowCount={99} style={{ backgroundColor: '#52c41a', marginLeft: '5px' }} /></span> },
    { key: 'Rejected', label: <span>Từ Chối <Badge count={rejectedCount} overflowCount={99} style={{ backgroundColor: '#ff4d4f', marginLeft: '5px' }} /></span> },
    { key: 'All', label: 'Tất Cả Lịch Sử' }
  ];

  return (
    <>
      <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Text type="secondary">Dashboard / Phê Duyệt</Text>
        <Button type="dashed" onClick={() => setIsModalVisible(true)}>
          Gửi thông báo cho nhân viên
        </Button>
      </div>

      <Card style={{ borderRadius: '15px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
        <ApprovalHeader onSearch={setSearchText} />

        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={tabItems}
          style={{ marginBottom: '10px' }}
        />

        <ApprovalTable
          dataSource={filteredData}
          loading={loading}
          onAction={handleAction}
          actionLoadingId={actionLoadingId}
        />
      </Card>

      {/* Modal gửi thông báo riêng */}
      <Modal
        title="Gửi thông báo cho nhân viên"
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSendNotification}
          // Tự động điền thông tin Admin từ currentUser
          initialValues={{
            senderName: currentUser.FullName || currentUser.fullName || "Admin",
            department: currentUser.Department || "Phòng Nhân Sự"
          }}
        >
          <Form.Item
            name="toEmail"
            label="Chọn nhân viên"
            rules={[{ required: true, message: 'Vui lòng chọn nhân viên!' }]}
          >
            <Select
              showSearch
              placeholder="Tìm hoặc chọn nhân viên"
              optionFilterProp="children"
              onChange={(value, option) => {
                // Dòng này rất quan trọng để lấy tên người nhận
                form.setFieldsValue({ recipientName: value === 'ALL' ? 'Tất cả nhân viên' : option.children[0] });
              }}
            >
              {/* 🌟 THÊM DÒNG NÀY VÀO ĐẦU DANH SÁCH */}
              <Option key="all" value="ALL">Tất cả nhân viên</Option>

              {/* DANH SÁCH NHÂN VIÊN */}
              {users.map(user => (
                <Option key={user.id} value={user.email}>
                  {user.fullName} ({user.email})
                </Option>
              ))}
            </Select>
          </Form.Item>

          {/* Field ẩn để Backend biết tên người nhận */}
          <Form.Item name="recipientName" hidden>
            <Input />
          </Form.Item>

          <Form.Item name="subject" label="Tiêu đề" rules={[{ required: true, message: 'Vui lòng nhập tiêu đề!' }]}>
            <Input placeholder="Ví dụ: Thông báo nghỉ lễ" />
          </Form.Item>

          <Form.Item name="senderName" label="Người gửi" rules={[{ required: true }]}>
            <Input readOnly />
          </Form.Item>

          <Form.Item name="department" label="Phòng ban" rules={[{ required: true }]}>
            <Input readOnly />
          </Form.Item>

          <Form.Item name="message" label="Nội dung" rules={[{ required: true, message: 'Vui lòng nhập nội dung!' }]}>
            <Input.TextArea rows={4} placeholder="Nhập nội dung thông báo..." />
          </Form.Item>

          <Button type="primary" htmlType="submit" loading={sending} block>Gửi ngay</Button>
        </Form>
      </Modal>
    </>
  );
}