import React, { useState, useEffect } from 'react';
// 🌟 Tui đã gộp Form lên trên cùng chung với các thư viện khác của antd
import { Card, Button, message, Tabs, Radio, Form } from 'antd'; 
import { CalendarOutlined, FileTextOutlined, PlusOutlined } from '@ant-design/icons';
import axios from 'axios';

// Import 2 component con
import LeaveTable from './LeaveTable';
import LeaveModal from './LeaveModal';

const { TabPane } = Tabs;

export default function LeaveManagement() {
  const [loading, setLoading] = useState(false);
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState('All'); 
  
  // 🌟 Khai báo Form hợp lệ nằm ở đây
  const [antForm] = Form.useForm();

  // ĐỒNG BỘ USER THỰC TẾ
  const storedUser = localStorage.getItem('user');
  const currentUser = (storedUser && storedUser !== "undefined" && storedUser !== "null") 
    ? JSON.parse(storedUser) 
    : {};  

  const axiosConfig = { 
    withCredentials: true, 
    headers: { 'User-Role': currentUser.Role || currentUser.role || '' } 
  };

  // 1. Gọi API lấy danh sách đơn nghỉ
  const fetchLeaveRequests = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/api/LeaveRequests', axiosConfig);
      setLeaveRequests(response.data);
    } catch (error) {
      message.error('Không thể tải danh sách đơn nghỉ!');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaveRequests();
  }, []);

  // 2. Xử lý Tạo đơn
  const handleCreateLeave = async (values) => {
    try {
      const [startDate, endDate] = values.dateRange;
      const payload = {
        userId: currentUser.Id || currentUser.id, 
        startDate: startDate.format('YYYY-MM-DDTHH:mm:ss'),
        endDate: endDate.format('YYYY-MM-DDTHH:mm:ss'),
        reason: values.reason,
        isUnpaid: values.isUnpaid === 'true'
      };

      await axios.post('/api/LeaveRequests', payload, axiosConfig);
      message.success('Gửi đơn xin nghỉ thành công, chờ sếp duyệt nha!');
      setIsModalOpen(false);
      antForm.resetFields();
      fetchLeaveRequests(); 
    } catch (error) {
      message.error('Gửi đơn thất bại!');
    }
  };

  // 3. Xử lý Cập nhật trạng thái (Duyệt/Từ chối)
  const handleUpdateStatus = async (id, newStatus) => {
    try {
      await axios.put(`/api/LeaveRequests/${id}/status?newStatus=${newStatus}`, {}, axiosConfig);
      message.success(`Đã cập nhật trạng thái đơn thành: ${newStatus}`);
      fetchLeaveRequests(); 
    } catch (error) {
      message.error('Cập nhật trạng thái thất bại!');
    }
  };

  // Logic Lọc dữ liệu
  const filteredData = filterStatus === 'All' 
    ? leaveRequests 
    : leaveRequests.filter(req => req.status === filterStatus);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Khối thống kê Kpi */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card className="shadow-sm border-l-4 border-amber-400" style={{ borderRadius: '12px' }}>
          <div className="text-gray-400 text-sm font-semibold">ĐƠN CHỜ DUYỆT</div>
          <div className="text-2xl font-bold text-gray-700">{leaveRequests.filter(r => r.status === 'Pending').length} Đơn</div>
        </Card>
        <Card className="shadow-sm border-l-4 border-green-500" style={{ borderRadius: '12px' }}>
          <div className="text-gray-400 text-sm font-semibold">ĐÃ CHẤP THUẬN</div>
          <div className="text-2xl font-bold text-green-600">{leaveRequests.filter(r => r.status === 'Approved').length} Đơn</div>
        </Card>
        <Card className="shadow-sm border-l-4 border-red-500" style={{ borderRadius: '12px' }}>
          <div className="text-gray-400 text-sm font-semibold">ĐÃ TỪ CHỐI</div>
          <div className="text-2xl font-bold text-red-600">{leaveRequests.filter(r => r.status === 'Rejected').length} Đơn</div>
        </Card>
      </div>

      <Card 
        title={<span className="text-lg font-bold text-slate-700"><CalendarOutlined className="mr-2"/>Quản Lý Lịch Nghỉ</span>}
        extra={
          <Button type="primary" icon={<PlusOutlined />} style={{ background: '#5570F1' }} onClick={() => setIsModalOpen(true)}>
            Tạo Đơn Xin Nghỉ
          </Button>
        }
        className="shadow-md rounded-lg border-none"
      >
        <div style={{ marginBottom: 16 }}>
          <Radio.Group value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} buttonStyle="solid">
            <Radio.Button value="All">Tất cả</Radio.Button>
            <Radio.Button value="Pending">Đang chờ</Radio.Button>
            <Radio.Button value="Approved">Đã duyệt</Radio.Button>
            <Radio.Button value="Rejected">Từ chối</Radio.Button>
          </Radio.Group>
        </div>

        <Tabs defaultActiveKey="1">
          <TabPane tab={<span><FileTextOutlined />Danh Sách Đơn Nghỉ Phép</span>} key="1">
            <LeaveTable 
              data={filteredData} 
              loading={loading} 
              currentUser={currentUser}
              onUpdateStatus={handleUpdateStatus}
            />
          </TabPane>
        </Tabs>
      </Card>

      <LeaveModal 
        isModalOpen={isModalOpen}
        setIsModalOpen={setIsModalOpen}
        form={antForm}
        onSubmit={handleCreateLeave}
      />
    </div>
  );
}