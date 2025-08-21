import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Api } from "../../../api/Api";
import { DateRange } from "react-date-range";
import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";
import './ThongKeDoanhThu.css'
const ThongKeDoanhThu = () => {
  const [orders, setOrders] = useState([]);
  const [salesData, setSalesData] = useState([]);
  const [statistics, setStatistics] = useState({
    total_orders: 0,
    total_revenue: 0,
    revenue_stage: 0,
    customer_count: 0,
  });

  // Bộ lọc gọn: chỉ còn 1 input (range)
  const [dateRange, setDateRange] = useState([
    {
      startDate: new Date(),
      endDate: new Date(),
      key: "selection",
    },
  ]);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await axios.get(`${Api}/admin/orders`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        setOrders(res.data);
      } catch (err) {
        console.error("Lỗi khi lấy đơn hàng:", err);
      }
    };
    fetchOrders();
  }, []);

  useEffect(() => {
    if (!orders.length) return;

    const { startDate, endDate } = dateRange[0];
    const filteredOrders = orders.filter((order) => {
      const d = new Date(order.created_at);
      return d >= startDate && d <= endDate;
    });

    // Gom doanh thu theo sản phẩm
    const revenueMap = {};
    filteredOrders.forEach((order) => {
      order.order_items.forEach((item) => {
        const name = item.product?.name || "Sản phẩm";
        const revenue = item.quantity * (parseFloat(item.price) || 0);
        if (!revenueMap[name]) {
          revenueMap[name] = { product: name, quantity: 0, revenue: 0 };
        }
        revenueMap[name].quantity += item.quantity;
        revenueMap[name].revenue += revenue;
      });
    });

    setSalesData(Object.values(revenueMap));

    setStatistics({
      total_orders: orders.length,
      total_revenue: orders.reduce((s, o) => s + (o.total || 0), 0),
      revenue_stage: filteredOrders.reduce((s, o) => s + (o.total || 0), 0),
      customer_count: new Set(filteredOrders.map((o) => o.customer_id)).size,
    });
  }, [orders, dateRange]);

  const totalQuantity = salesData.reduce((s, i) => s + i.quantity, 0);
  const totalRevenue = salesData.reduce((s, i) => s + i.revenue, 0);

  return (
    <div className="max-w-7xl mx-auto px-6 py-10 bg-gray-50 min-h-screen">
      <h1 className="text-4xl font-bold text-center text-indigo-600 mb-10">
        Thống Kê Doanh Thu
      </h1>

      {/* Bộ lọc */}
      <section className="bg-white rounded-2xl shadow p-6 mb-10">
        <h2 className="text-lg font-semibold mb-4 text-gray-700">
          Bộ lọc dữ liệu
        </h2>
        <DateRange
          ranges={dateRange}
          onChange={(item) => setDateRange([item.selection])}
          moveRangeOnFirstSelection={false}
          maxDate={new Date()}
          rangeColors={["#6366F1"]}
        />
      </section>

      {/* Cards thống kê */}
      <section className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
        <div className="bg-white p-6 rounded-xl shadow text-center">
          <p className="text-gray-500">Đơn hàng</p>
          <p className="text-2xl font-bold text-indigo-600">
            {statistics.total_orders}
          </p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow text-center">
          <p className="text-gray-500">Doanh thu tổng</p>
          <p className="text-2xl font-bold text-green-600">
            {statistics.total_revenue.toLocaleString("vi-VN")} ₫
          </p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow text-center">
          <p className="text-gray-500">Doanh thu đã lọc</p>
          <p className="text-2xl font-bold text-orange-500">
            {statistics.revenue_stage.toLocaleString("vi-VN")} ₫
          </p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow text-center">
          <p className="text-gray-500">Khách hàng</p>
          <p className="text-2xl font-bold text-purple-600">
            {statistics.customer_count}
          </p>
        </div>
      </section>

      {/* Biểu đồ */}
      <section className="bg-white p-6 rounded-2xl shadow mb-10">
        <h2 className="text-2xl font-semibold text-gray-800 mb-6">
          📊 Biểu đồ doanh thu theo sản phẩm
        </h2>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={salesData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="product" angle={-30} textAnchor="end" interval={0} />
            <YAxis />
            <Tooltip
              formatter={(val) =>
                val.toLocaleString("vi-VN", { style: "currency", currency: "VND" })
              }
            />
            <Bar dataKey="quantity" fill="#6366F1" name="Số lượng" />
            <Bar dataKey="revenue" fill="#F59E0B" name="Doanh thu (VNĐ)" />
          </BarChart>
        </ResponsiveContainer>
      </section>

      {/* Bảng */}
    <section className="bg-white p-6 rounded-2xl shadow-lg">
  <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
    📋 Bảng thống kê chi tiết
  </h2>

  <div className="overflow-x-auto">
    <table className="min-w-full text-sm text-gray-700 border-separate border-spacing-y-3">
      {/* Header */}
      <thead>
        <tr className="bg-gradient-to-r from-indigo-500 to-indigo-600 text-white shadow">
          <th className="px-6 py-3 text-left font-semibold rounded-l-xl">📦 Sản phẩm</th>
          <th className="px-6 py-3 text-left font-semibold">📊 Số lượng</th>
          <th className="px-6 py-3 text-left font-semibold rounded-r-xl">💰 Doanh thu</th>
        </tr>
      </thead>

      {/* Body */}
      <tbody>
        {salesData.map((item, i) => (
          <tr
            key={i}
            className="bg-white hover:bg-indigo-50 transition-colors duration-200 shadow-sm rounded-xl"
          >
            <td className="px-6 py-4 rounded-l-xl font-medium text-gray-800">
              {item.product}
            </td>
            <td className="px-6 py-4 text-gray-600">{item.quantity}</td>
            <td className="px-6 py-4 rounded-r-xl font-semibold text-indigo-700">
              {item.revenue.toLocaleString("vi-VN")} ₫
            </td>
          </tr>
        ))}

        {/* Tổng cộng */}
        <tr className="bg-indigo-100 font-bold shadow-inner">
          <td className="px-6 py-4 rounded-l-xl">🔎 Tổng cộng</td>
          <td className="px-6 py-4">{totalQuantity}</td>
          <td className="px-6 py-4 rounded-r-xl text-indigo-900">
            {totalRevenue.toLocaleString("vi-VN")} ₫
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</section>


    </div>
  );
};

export default ThongKeDoanhThu;
