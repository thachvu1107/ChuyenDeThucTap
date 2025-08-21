import React, { useEffect, useState } from "react";
import axios from "axios";
import { Api } from "../../../api/Api";
const ThongKeTruyCap = () => {
  const [visitors, setVisitors] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const res = await axios.get(`${Api}/tracking`);
      setVisitors(res.data);
    };
    fetchData();
  }, []);

  return (
    <div className="p-6 bg-white rounded-2xl shadow">
      <h2 className="text-2xl font-bold mb-4">👥 Thống kê truy cập</h2>
      <table className="min-w-full text-sm border">
        <thead>
          <tr className="bg-indigo-600 text-white">
            <th className="px-4 py-2">IP</th>
            <th className="px-4 py-2">User Agent</th>
            <th className="px-4 py-2">Trang</th>
            <th className="px-4 py-2">Thời gian</th>
          </tr>
        </thead>
        <tbody>
          {visitors.map((v, i) => (
            <tr key={i} className="border-b hover:bg-gray-50">
              <td className="px-4 py-2">{v.ip}</td>
              <td className="px-4 py-2">{v.userAgent}</td>
              <td className="px-4 py-2">{v.path}</td>
              <td className="px-4 py-2">
                {new Date(v.time).toLocaleString("vi-VN")}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
export default ThongKeTruyCap;
