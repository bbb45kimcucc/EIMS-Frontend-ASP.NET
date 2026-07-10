import React, { useState } from 'react';
import { Button, Upload, message } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import * as XLSX from 'xlsx';
import axios from 'axios';
import moment from 'moment';

export default function ExcelImportButton({ onSuccess }) {
  const [uploading, setUploading] = useState(false);

  const handleFileUpload = (file) => {
    const reader = new FileReader();

    reader.onload = async (e) => {
      try {
        setUploading(true);
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { raw: false });
        
        const formattedData = jsonData.map(row => {
          const parsedDate = moment(row['Ngày'], "DD/MM/YYYY").format("YYYY-MM-DD");
          return {
            userId: parseInt(row['UserId']),
            workDate: parsedDate,
            shiftType: row['Loại Ca'] || 'Ngày Thường'
          };
        });

        // GỌI XUỐNG CÁI API Ở BƯỚC 1 ĐÓ
        await axios.post('/api/WorkSchedules/import-excel', formattedData);
        message.success(`Đã import thành công ${formattedData.length} dữ liệu chấm công!`);
        
        if (onSuccess) onSuccess();

      } catch (error) {
        console.error(error);
        message.error("Đọc file thất bại, hãy chắc chắn file Excel đúng định dạng!");
      } finally {
        setUploading(false);
      }
    };

    reader.readAsArrayBuffer(file);
    return false;
  };

  return (
    <Upload beforeUpload={handleFileUpload} showUploadList={false} accept=".xlsx, .xls">
      <Button icon={<UploadOutlined />} type="primary" loading={uploading} style={{ background: '#237804' }}>
        Import File Chấm Công
      </Button>
    </Upload>
  );
}