import React from 'react';
import { Modal, Form, DatePicker, Select, Input, Space, Button } from 'antd';

const { RangePicker } = DatePicker;
const { Option } = Select;

export default function LeaveModal({ isModalOpen, setIsModalOpen, form, onSubmit }) {
  return (
    <Modal 
      title={<span className="text-lg font-bold text-slate-700">📝 Tạo Đơn Xin Nghỉ Phép Mới</span>}
      open={isModalOpen} 
      onCancel={() => setIsModalOpen(false)}
      footer={null}
      destroyOnClose
    >
      <Form form={form} layout="vertical" onFinish={onSubmit} className="mt-4">
        <Form.Item 
          name="dateRange" 
          label="Chọn thời gian nghỉ" 
          rules={[{ required: true, message: 'Vui lòng chọn ngày bắt đầu và kết thúc!' }]}
        >
          <RangePicker className="w-full" format="DD/MM/YYYY" />
        </Form.Item>

        <Form.Item 
          name="isUnpaid" 
          label="Hình thức nghỉ" 
          initialValue="false"
        >
          <Select>
            <Option value="false">Nghỉ phép năm (Có hưởng lương)</Option>
            <Option value="true">Nghỉ không lương (Bị trừ vào lương thực lĩnh)</Option>
          </Select>
        </Form.Item>

        <Form.Item 
          name="reason" 
          label="Lý do xin nghỉ" 
          rules={[{ required: true, message: 'Vui lòng điền lý do xin nghỉ!' }]}
        >
          <Input.TextArea rows={4} placeholder="Ví dụ: Bị sốt xuất huyết xin nghỉ điều trị..." />
        </Form.Item>

        <Form.Item className="text-right mb-0">
          <Space>
            <Button onClick={() => setIsModalOpen(false)}>Hủy</Button>
            <Button type="primary" htmlType="submit" style={{ background: '#5570F1' }}>Gửi Đơn</Button>
          </Space>
        </Form.Item>
      </Form>
    </Modal>
  );
}