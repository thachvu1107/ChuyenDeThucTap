import React, { useEffect, useState } from "react";
import { Button, Modal, Form } from "react-bootstrap";
import axios from "axios";
import Swal from "sweetalert2";
import { Api } from "../../../api/Api";
import "../css/UserAdmin.css";

const UserAdmin = () => {
  const [users, setUsers] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [usersPerPage] = useState(6);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    address: "",
    city: "",
    country: "",
    zip: "",
    telephone: "",
    is_admin: false,
  });

  // Fetch users with total order amount
  const fetchUsers = async () => {
    try {
      const response = await axios.get(`${Api}/admin/users-with-order-total`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setUsers(response.data.users);
    } catch (error) {
      console.error("Error fetching users:", error);
      Swal.fire({
        icon: "error",
        text: "Không thể tải danh sách người dùng",
        confirmButtonColor: "#FFD700",
      });
    }
  };

  // Fetch user details
  const fetchUserDetails = async (userId) => {
    try {
      const response = await axios.get(`${Api}/admin/user/${userId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setSelectedUser(response.data.user);
      setShowDetailsModal(true);
    } catch (error) {
      console.error("Error fetching user details:", error);
      Swal.fire({
        icon: "error",
        text: "Không thể tải chi tiết người dùng",
        confirmButtonColor: "#FFD700",
      });
    }
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  // Create new user
  const createUser = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(`${Api}/admin/create-user`, formData, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      Swal.fire({
        icon: "success",
        text: "Tạo người dùng thành công!",
        confirmButtonColor: "#FFD700",
      });
      setShowCreateModal(false);
      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        password: "",
        address: "",
        city: "",
        country: "",
        zip: "",
        telephone: "",
        is_admin: false,
      });
      fetchUsers();
    } catch (error) {
      console.error("Error creating user:", error);
      Swal.fire({
        icon: "error",
        text: error.response?.data?.message || "Không thể tạo người dùng",
        confirmButtonColor: "#FFD700",
      });
    }
  };

  // Close modals
  const handleCloseDetailsModal = () => {
    setShowDetailsModal(false);
    setSelectedUser(null);
  };

  const handleCloseCreateModal = () => {
    setShowCreateModal(false);
    setFormData({
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      address: "",
      city: "",
      country: "",
      zip: "",
      telephone: "",
      is_admin: false,
    });
  };

  // Fetch users on component mount
  useEffect(() => {
    fetchUsers();
  }, []);

  // Pagination logic
  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = users.slice(indexOfFirstUser, indexOfLastUser);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <div className="user-list-container">
      {/* <h1 className="page-title">Quản Lý Người Dùng</h1> */}
      <Button className="create-btn" onClick={() => setShowCreateModal(true)}>
        <span className="btn-icon">👤</span> Tạo Người Dùng Mới
      </Button>
      <div className="user-table">
        <div className="table-header">
          <span>ID</span>
          <span>Tên</span>
          <span>Email</span>
          <span>Tổng Tiền Đơn Hàng</span>
          <span>Ngày Tạo</span>
          <span>Thao Tác</span>
        </div>
        {currentUsers.length > 0 ? (
          currentUsers.map((user) => (
            <div key={user.id} className="table-row">
              <span>{user.id}</span>
              <span>{user.name}</span>
              <span>{user.email}</span>
              <span>
                {parseFloat(user.total_order_amount || 0).toFixed(2)} VND
              </span>
              <span>
                {new Date(user.created_at).toLocaleDateString("vi-VN")}
              </span>
              <span>
                <Button
                  className="details-btn"
                  onClick={() => fetchUserDetails(user.id)}
                >
                  <span className="btn-icon">📋</span> Xem Chi Tiết
                </Button>
              </span>
            </div>
          ))
        ) : (
          <div className="no-users">Không có người dùng nào.</div>
        )}
      </div>

      {/* Pagination */}
      <div className="pagination-container">
        {[...Array(Math.ceil(users.length / usersPerPage)).keys()].map(
          (number) => (
            <button
              key={number}
              onClick={() => paginate(number + 1)}
              className={`pagination-btn ${
                currentPage === number + 1 ? "active" : ""
              }`}
            >
              {number + 1}
            </button>
          )
        )}
      </div>

      {/* User Details Modal */}
      <Modal
        show={showDetailsModal}
        onHide={handleCloseDetailsModal}
        centered
        className="user-modal"
      >
        <Modal.Header closeButton className="modal-header">
          <Modal.Title>Chi Tiết Người Dùng #{selectedUser?.id}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedUser && (
            <div className="modal-content">
              <p>
                <strong>Tên:</strong> {selectedUser.name}
              </p>
              <p>
                <strong>Email:</strong> {selectedUser.email}
              </p>
              <p>
                <strong>Ngày Tạo:</strong>{" "}
                {new Date(selectedUser.created_at).toLocaleDateString("vi-VN")}
              </p>
              <p>
                <strong>Tổng Tiền Đơn Hàng:</strong>{" "}
                {parseFloat(selectedUser.total_order_amount || 0).toFixed(2)}{" "}
                VND
              </p>
              <h5>Địa Chỉ:</h5>
              {selectedUser.addresses && selectedUser.addresses.length > 0 ? (
                selectedUser.addresses.map((address, idx) => (
                  <div key={idx} className="address-card">
                    <p>
                      <strong>Họ Tên:</strong> {address.firstname}{" "}
                      {address.lastname}
                    </p>
                    <p>
                      <strong>Địa Chỉ:</strong> {address.address}
                    </p>
                    <p>
                      <strong>Thành Phố:</strong> {address.city}
                    </p>
                    <p>
                      <strong>Quốc Gia:</strong> {address.country}
                    </p>
                    <p>
                      <strong>Mã Bưu Điện:</strong> {address.zip}
                    </p>
                    <p>
                      <strong>Số Điện Thoại:</strong> {address.telephone}
                    </p>
                  </div>
                ))
              ) : (
                <p>Không có địa chỉ.</p>
              )}
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button className="close-btn" onClick={handleCloseDetailsModal}>
            Đóng
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Create User Modal */}
      <Modal
        show={showCreateModal}
        onHide={handleCloseCreateModal}
        centered
        className="user-modal"
      >
        <Modal.Header closeButton className="modal-header">
          <Modal.Title>Tạo Người Dùng Mới</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={createUser} className="create-form">
            <div className="form-grid">
              <Form.Group className="form-group">
                <Form.Label>Họ</Form.Label>
                <Form.Control
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  className="form-input"
                  required
                />
              </Form.Group>
              <Form.Group className="form-group">
                <Form.Label>Tên</Form.Label>
                <Form.Control
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  className="form-input"
                  required
                />
              </Form.Group>
              <Form.Group className="form-group full-width">
                <Form.Label>Email</Form.Label>
                <Form.Control
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="form-input"
                  required
                />
              </Form.Group>
              <Form.Group className="form-group full-width">
                <Form.Label>Mật Khẩu</Form.Label>
                <Form.Control
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="form-input"
                  required
                />
              </Form.Group>
              <Form.Group className="form-group full-width">
                <Form.Label>Địa Chỉ</Form.Label>
                <Form.Control
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  className="form-input"
                  required
                />
              </Form.Group>
              <Form.Group className="form-group">
                <Form.Label>Thành Phố</Form.Label>
                <Form.Control
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleInputChange}
                  className="form-input"
                  required
                />
              </Form.Group>
              <Form.Group className="form-group">
                <Form.Label>Quốc Gia</Form.Label>
                <Form.Control
                  type="text"
                  name="country"
                  value={formData.country}
                  onChange={handleInputChange}
                  className="form-input"
                  required
                />
              </Form.Group>
              <Form.Group className="form-group">
                <Form.Label>Mã Bưu Điện</Form.Label>
                <Form.Control
                  type="text"
                  name="zip"
                  value={formData.zip}
                  onChange={handleInputChange}
                  className="form-input"
                  required
                />
              </Form.Group>
              <Form.Group className="form-group">
                <Form.Label>Số Điện Thoại</Form.Label>
                <Form.Control
                  type="text"
                  name="telephone"
                  value={formData.telephone}
                  onChange={handleInputChange}
                  className="form-input"
                  required
                />
              </Form.Group>
              <Form.Group className="form-group full-width">
                <Form.Check
                  type="checkbox"
                  label="Là Quản Trị Viên"
                  name="is_admin"
                  checked={formData.is_admin}
                  onChange={handleInputChange}
                  className="form-checkbox"
                />
              </Form.Group>
            </div>
            <Button className="submit-btn" type="submit">
              <span className="btn-icon">✔</span> Tạo Người Dùng
            </Button>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button className="close-btn" onClick={handleCloseCreateModal}>
            Đóng
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default UserAdmin;
