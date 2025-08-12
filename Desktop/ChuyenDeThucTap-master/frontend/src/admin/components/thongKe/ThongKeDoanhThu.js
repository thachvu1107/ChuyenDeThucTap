import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Api } from "../../../api/Api";
import "./ThongKeDoanhThu.css";

const ThongKeDoanhThu = () => {
  const [salesData, setSalesData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState([]);
  const [month, setMonth] = useState("");
  const [day, setDay] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [year, setYear] = useState("");
  const [periodRevenue, setPeriodRevenue] = useState(0);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await axios.get(`${Api}/admin/orders`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });

        setOrders(res.data);
        setLoading(false);
      } catch (err) {
        console.error("Lỗi khi lấy dữ liệu thống kê:", err);
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  useEffect(() => {
    const revenueMap = {};
    let filteredOrders = orders;

    // Lọc theo khoảng thời gian nếu có
    if (startDate && endDate) {
      filteredOrders = orders.filter((order) => {
        const orderDate = new Date(order.created_at);
        const start = new Date(startDate);
        const end = new Date(endDate);
        return orderDate >= start && orderDate <= end;
      });
    } else {
      // Lọc theo ngày, tháng, hoặc năm nếu có
      if (day) {
        filteredOrders = orders.filter((order) =>
          order.created_at?.startsWith(day)
        );
      } else if (month) {
        filteredOrders = orders.filter((order) =>
          order.created_at?.startsWith(month)
        );
      } else if (year) {
        filteredOrders = orders.filter((order) =>
          order.created_at?.startsWith(year)
        );
      }
    }

    filteredOrders.forEach((order) => {
      order.order_items.forEach((item) => {
        const product = item.product;
        if (!product) return;

        const name = product.name;
        const quantity = item.quantity;
        const price = parseFloat(item.price) || 0;
        const revenue = quantity * price;

        if (revenueMap[name]) {
          revenueMap[name].quantity += quantity;
          revenueMap[name].revenue += revenue;
        } else {
          revenueMap[name] = {
            product: name,
            quantity,
            revenue,
          };
        }
      });
    });

    setSalesData(Object.values(revenueMap));

    const newPeriodRevenue = filteredOrders.reduce(
      (sum, order) => sum + (order.total || 0),
      0
    );

    const uniqueCustomerCount = new Set(
      filteredOrders.map((order) => order.customer_id)
    ).size;

    setStatistics((prev) => ({
      ...prev,
      revenue_stage: newPeriodRevenue,
      customer_count: uniqueCustomerCount,
    }));
  }, [month, day, year, startDate, endDate, orders]);

  const totalQuantity = salesData.reduce((sum, item) => sum + item.quantity, 0);
  const totalRevenue = salesData.reduce((sum, item) => sum + item.revenue, 0);

  const uniqueMonths = [
    ...new Set(
      orders
        .map((order) =>
          order.created_at ? order.created_at.substring(0, 7) : null
        )
        .filter(Boolean)
    ),
  ].sort((a, b) => b.localeCompare(a));

  const uniqueYears = [
    ...new Set(
      orders
        .map((order) =>
          order.created_at ? order.created_at.substring(0, 4) : null
        )
        .filter(Boolean)
    ),
  ].sort((a, b) => b.localeCompare(a));

  const totalCustomers = [...new Set(orders.map((order) => order.customer_id))]
    .length;
  const totalOrders = orders.length;

  const [statistics, setStatistics] = useState({
    total_orders: 0,
    total_revenue: 0,
    revenue_stage: 0,
    customer_count: 0,
  });

  useEffect(() => {
    fetch("/api/statistics")
      .then((res) => res.json())
      .then((data) => setStatistics(data));
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 bg-gray-50 min-h-screen">
      <h1 className="text-4xl font-bold text-center text-indigo-600 mb-10">
        Thống Kê Doanh Thu
      </h1>

      {/* Bộ lọc cải tiến */}
      <section className="bg-white rounded-xl shadow-md p-6 mb-10">
        <h2 className="text-lg font-semibold mb-4 text-gray-700">
          Bộ Lọc Dữ Liệu
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
          <div className="flex flex-col">
            <label className="text-sm font-medium text-gray-600 mb-1">
              Ngày cụ thể
            </label>
            <input
              type="date"
              className="border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400"
              value={day}
              onChange={(e) => setDay(e.target.value)}
            />
          </div>
          <div className="flex flex-col">
            <label className="text-sm font-medium text-gray-600 mb-1">
              Tháng
            </label>
            <select
              className="border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400"
              value={month}
              onChange={(e) => setMonth(e.target.value)}
              disabled={day !== "" || startDate !== "" || endDate !== ""}
            >
              <option value="">Tất cả</option>
              {uniqueMonths.map((m) => (
                <option key={m} value={m}>
                  Tháng {m.slice(5)}/{m.slice(0, 4)}
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-col">
            <label className="text-sm font-medium text-gray-600 mb-1">
              Năm
            </label>
            <select
              className="border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400"
              value={year}
              onChange={(e) => setYear(e.target.value)}
              disabled={day !== "" || startDate !== "" || endDate !== ""}
            >
              <option value="">Tất cả</option>
              {uniqueYears.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-col">
            <label className="text-sm font-medium text-gray-600 mb-1">
              Từ ngày
            </label>
            <input
              type="date"
              className="border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              disabled={day !== ""}
            />
          </div>
          <div className="flex flex-col">
            <label className="text-sm font-medium text-gray-600 mb-1">
              Đến ngày
            </label>
            <input
              type="date"
              className="border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              disabled={day !== ""}
            />
          </div>
          <div className="flex flex-col">
            <label className="text-sm font-medium text-gray-600 mb-1 invisible">
              Spacer
            </label>
            <button
              className="mt-1 bg-indigo-500 hover:bg-indigo-600 text-white font-medium px-4 py-2 rounded-md transition w-full"
              onClick={() => {
                setDay("");
                setMonth("");
                setYear("");
                setStartDate("");
                setEndDate("");
              }}
            >
              Đặt lại
            </button>
            <button
              className="mt-2 bg-green-500 hover:bg-green-600 text-white font-medium px-4 py-2 rounded-md transition w-full"
              onClick={() => {
                // Áp dụng lọc, nhưng hiện tại dùng useEffect để tự động áp dụng
              }}
            >
              Áp dụng
            </button>
          </div>
        </div>
      </section>

      {/* Tổng quan */}
      <section className="dashboard-cards">
        <div className="card">
          <div className="card-content">
            <div>
              <p className="card-title">Tổng số đơn hàng</p>
              <p className="card-value">{totalQuantity}</p>
            </div>
            <div className="card-icon">🛒</div>
          </div>
        </div>

        <div className="card">
          <div className="card-content">
            <div>
              <p className="card-title">Tổng doanh thu</p>
              <p className="card-value">
                {totalRevenue.toLocaleString("vi-VN", {
                  style: "currency",
                  currency: "VND",
                })}
              </p>
            </div>
            <div className="card-icon">💰</div>
          </div>
        </div>

        <div className="card">
          <div className="card-content">
            <div>
              <p className="card-title">Doanh thu theo thời gian lọc</p>
              <p className="card-value">{statistics.revenue_stage} ₫</p>
            </div>
            <div className="card-icon">📊</div>
          </div>
        </div>

        <div className="card">
          <div className="card-content">
            <div>
              <p className="card-title">Khách hàng</p>
              <p className="card-value">{statistics.customer_count}</p>
            </div>
            <div className="card-icon">👤</div>
          </div>
        </div>
      </section>

      {/* Biểu đồ */}
      <section className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 mb-10">
        <h2 className="text-2xl font-semibold text-gray-800 mb-6">
          📈 Biểu Đồ Doanh Thu
        </h2>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart
            data={salesData}
            margin={{ top: 5, right: 30, left: 20, bottom: 100 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="product"
              angle={-45}
              textAnchor="end"
              interval={0}
            />
            <YAxis />
            <Tooltip
              formatter={(value) => value.toLocaleString("vi-VN") + " đ"}
            />
            <Legend />
            <Bar dataKey="quantity" fill="#6366F1" name="Số lượng" />
            <Bar dataKey="revenue" fill="#F59E0B" name="Doanh thu (VNĐ)" />
          </BarChart>
        </ResponsiveContainer>
      </section>

      {/* Bảng thống kê */}
      <section className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
        <h2 className="text-2xl font-semibold text-gray-800 mb-6">
          📊 Bảng Thống Kê
        </h2>
        <div className="overflow-x-auto rounded-lg">
          <table className="min-w-full text-sm text-gray-700">
            <thead className="bg-indigo-50 sticky top-0">
              <tr>
                <th className="px-6 py-3 text-left font-bold uppercase tracking-wide text-gray-700">
                  Sản phẩm
                </th>
                <th className="px-6 py-3 text-left font-bold uppercase tracking-wide text-gray-700">
                  Số lượng
                </th>
                <th className="px-6 py-3 text-left font-bold uppercase tracking-wide text-gray-700">
                  Doanh thu
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {salesData.map((item, idx) => (
                <tr
                  key={idx}
                  className="hover:bg-indigo-50 transition-shadow hover:shadow-sm"
                >
                  <td className="px-6 py-4 whitespace-nowrap max-w-xs truncate">
                    {item.product}
                  </td>
                  <td className="px-6 py-4">{item.quantity}</td>
                  <td className="px-6 py-4">
                    {item.revenue.toLocaleString("vi-VN", {
                      style: "currency",
                      currency: "VND",
                    })}
                  </td>
                </tr>
              ))}
              <tr className="bg-indigo-100 font-semibold text-indigo-800">
                <td className="px-6 py-4">Tổng cộng</td>
                <td className="px-6 py-4">{totalQuantity}</td>
                <td className="px-6 py-4">
                  {totalRevenue.toLocaleString("vi-VN", {
                    style: "currency",
                    currency: "VND",
                  })}
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
