import React, { useEffect, useState } from "react";
import { Button, Card, Form, Modal } from "react-bootstrap";
import axios from "axios";
import Swal from "sweetalert2";
import { Api } from "../../api/Api";
import "../css/MyAccount.css";

const MyAccount = () => {
  const userId = localStorage.getItem("userId");
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showEditAddressModal, setShowEditAddressModal] = useState(false);
  const [showAddAddressModal, setShowAddAddressModal] = useState(false);
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);
  const [showChangeNameModal, setShowChangeNameModal] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [addressForm, setAddressForm] = useState({
    userId: userId,
    firstname: "",
    lastname: "",
    address: "",
    city: "",
    country: "",
    zip: "",
    telephone: "",
  });
  const [passwordForm, setPasswordForm] = useState({
    current_password: "",
    new_password: "",
    new_password_confirmation: "",
  });
  const [nameForm, setNameForm] = useState({
    firstName: "",
    lastName: "",
  });

  const fetchUserDetails = async () => {
    try {
      const response = await axios.get(
        `${Api}/user/default-address/${userId}`,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      setUser(response.data.user);
      const nameParts = response.data.user.name.trim().split(/\s+/);
      setNameForm({
        firstName: nameParts[0] || "",
        lastName: nameParts.length > 1 ? nameParts.slice(1).join(" ") : "",
      });
    } catch (error) {
      console.error("Error fetching user details:", error);
      Swal.fire({
        icon: "error",
        text: "Không thể tải thông tin tài khoản",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEditAddress = (address) => {
    setSelectedAddress(address);
    setAddressForm({
      firstname: address.firstname,
      lastname: address.lastname,
      address: address.address,
      city: address.city,
      country: address.country,
      zip: address.zip,
      telephone: address.telephone,
    });
    setShowEditAddressModal(true);
  };

  const handleAddAddress = () => {
    setAddressForm({
      userId: userId,
      firstname: "",
      lastname: "",
      address: "",
      city: "",
      country: "",
      zip: "",
      telephone: "",
    });
    setShowAddAddressModal(true);
  };

  const handleAddressInputChange = (e) => {
    const { name, value } = e.target;
    setAddressForm({ ...addressForm, [name]: value });
  };

  const handlePasswordInputChange = (e) => {
    const { name, value } = e.target;
    setPasswordForm({ ...passwordForm, [name]: value });
  };

  const handleNameInputChange = (e) => {
    const { name, value } = e.target;
    setNameForm({ ...nameForm, [name]: value });
  };

  const updateAddress = async (e) => {
    e.preventDefault();
    try {
      await axios.put(
        `${Api}/user/address/${selectedAddress.id}`,
        { ...addressForm },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      Swal.fire({
        icon: "success",
        text: "Cập nhật địa chỉ thành công!",
      });
      setShowEditAddressModal(false);
      fetchUserDetails();
    } catch (error) {
      console.error("Error updating address:", error);
      Swal.fire({
        icon: "error",
        text: error.response?.data?.message || "Không thể cập nhật địa chỉ",
      });
    }
  };

  const addAddress = async (e) => {
    e.preventDefault();
    try {
      await axios.post(
        `${Api}/user/address`,
        { ...addressForm },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      Swal.fire({
        icon: "success",
        text: "Thêm địa chỉ thành công!",
      });
      setShowAddAddressModal(false);
      fetchUserDetails();
    } catch (error) {
      console.error("Error adding address:", error);
      Swal.fire({
        icon: "error",
        text: error.response?.data?.message || "Không thể thêm địa chỉ",
      });
    }
  };

  const changePassword = async (e) => {
    e.preventDefault();
    if (passwordForm.new_password !== passwordForm.new_password_confirmation) {
      Swal.fire({
        icon: "error",
        text: "Mật khẩu mới và xác nhận mật khẩu không khớp",
      });
      return;
    }
    try {
      await axios.post(`${Api}/user/change-password`, passwordForm, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      Swal.fire({
        icon: "success",
        text: "Đổi mật khẩu thành công!",
      });
      setShowChangePasswordModal(false);
      setPasswordForm({
        current_password: "",
        new_password: "",
        new_password_confirmation: "",
      });
    } catch (error) {
      console.error("Error changing password:", error);
      Swal.fire({
        icon: "error",
        text: error.response?.data?.message || "Không thể đổi mật khẩu",
      });
    }
  };

  const changeName = async (e) => {
    e.preventDefault();
    try {
      await axios.post(
        `${Api}/user/change-name`,
        { name: `${nameForm.firstName} ${nameForm.lastName}`.trim() },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      Swal.fire({
        icon: "success",
        text: "Đổi tên thành công!",
      });
      setShowChangeNameModal(false);
      fetchUserDetails();
    } catch (error) {
      console.error("Error changing name:", error);
      Swal.fire({
        icon: "error",
        text: error.response?.data?.message || "Không thể đổi tên",
      });
    }
  };

  useEffect(() => {
    fetchUserDetails();
  }, []);

  return (
    <div className="my-account-container">
      <h1 className="page-title">Tài Khoản Của Tôi</h1>
      {loading ? (
        <div className="loading-spinner">Đang tải...</div>
      ) : user ? (
        <div className="account-layout">
          {/* Sidebar for User Info */}
          <div className="user-sidebar">
            <div className="user-card">
              <div className="user-icon">👤</div>
              <h2 className="user-name">{user.name}</h2>
              <p className="user-email">{user.email}</p>
              <div className="user-actions">
                <Button
                  className="action-btn name-btn"
                  onClick={() => setShowChangeNameModal(true)}
                >
                  <span className="btn-icon">✏️</span> Đổi Tên
                </Button>
                <Button
                  className="action-btn password-btn"
                  onClick={() => setShowChangePasswordModal(true)}
                >
                  <span className="btn-icon">🔒</span> Đổi Mật Khẩu
                </Button>
              </div>
            </div>
          </div>

          {/* Address Section */}
          <div className="address-section">
            <div className="section-header">
              <h2>Địa Chỉ Giao Hàng</h2>
              <Button className="add-address-btn" onClick={handleAddAddress}>
                <span className="btn-icon">➕</span> Thêm Địa Chỉ
              </Button>
            </div>
            <div className="address-grid">
              {user.addresses && user.addresses.length > 0 ? (
                user.addresses.map((address) => (
                  <Card key={address.id} className="address-card">
                    <Card.Body>
                      <div className="address-info">
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
                      <Button
                        className="edit-address-btn"
                        onClick={() => handleEditAddress(address)}
                      >
                        <span className="btn-icon">✏️</span> Chỉnh Sửa
                      </Button>
                    </Card.Body>
                  </Card>
                ))
              ) : (
                <div className="no-address">Chưa có địa chỉ nào được thêm.</div>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="error-message">Không thể tải thông tin tài khoản.</div>
      )}

      {/* Edit Address Modal */}
      <Modal
        show={showEditAddressModal}
        onHide={() => setShowEditAddressModal(false)}
        centered
        className="custom-modal"
      >
        <Modal.Header closeButton>
          <Modal.Title>Chỉnh Sửa Địa Chỉ</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={updateAddress}>
            <Form.Group className="mb-4">
              <Form.Label>Họ</Form.Label>
              <Form.Control
                type="text"
                name="firstname"
                value={addressForm.firstname}
                onChange={handleAddressInputChange}
                required
              />
            </Form.Group>
            <Form.Group className="mb-4">
              <Form.Label>Tên</Form.Label>
              <Form.Control
                type="text"
                name="lastname"
                value={addressForm.lastname}
                onChange={handleAddressInputChange}
                required
              />
            </Form.Group>
            <Form.Group className="mb-4">
              <Form.Label>Địa Chỉ</Form.Label>
              <Form.Control
                type="text"
                name="address"
                value={addressForm.address}
                onChange={handleAddressInputChange}
                required
              />
            </Form.Group>
            <Form.Group className="mb-4">
              <Form.Label>Thành Phố</Form.Label>
              <Form.Control
                type="text"
                name="city"
                value={addressForm.city}
                onChange={handleAddressInputChange}
                required
              />
            </Form.Group>
            <Form.Group className="mb-4">
              <Form.Label>Quốc Gia</Form.Label>
              <Form.Control
                type="text"
                name="country"
                value={addressForm.country}
                onChange={handleAddressInputChange}
                required
              />
            </Form.Group>
            <Form.Group className="mb-4">
              <Form.Label>Mã Bưu Điện</Form.Label>
              <Form.Control
                type="text"
                name="zip"
                value={addressForm.zip}
                onChange={handleAddressInputChange}
                required
              />
            </Form.Group>
            <Form.Group className="mb-4">
              <Form.Label>Số Điện Thoại</Form.Label>
              <Form.Control
                type="text"
                name="telephone"
                value={addressForm.telephone}
                onChange={handleAddressInputChange}
                required
              />
            </Form.Group>
            <Button className="submit-btn" type="submit">
              Cập Nhật Địa Chỉ
            </Button>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button
            className="close-btn"
            onClick={() => setShowEditAddressModal(false)}
          >
            Đóng
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Add Address Modal */}
      <Modal
        show={showAddAddressModal}
        onHide={() => setShowAddAddressModal(false)}
        centered
        className="custom-modal"
      >
        <Modal.Header closeButton>
          <Modal.Title>Thêm Địa Chỉ Mới</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={addAddress}>
            <Form.Group className="mb-4">
              <Form.Label>Họ</Form.Label>
              <Form.Control
                type="text"
                name="firstname"
                value={addressForm.firstname}
                onChange={handleAddressInputChange}
                required
              />
            </Form.Group>
            <Form.Group className="mb-4">
              <Form.Label>Tên</Form.Label>
              <Form.Control
                type="text"
                name="lastname"
                value={addressForm.lastname}
                onChange={handleAddressInputChange}
                required
              />
            </Form.Group>
            <Form.Group className="mb-4">
              <Form.Label>Địa Chỉ</Form.Label>
              <Form.Control
                type="text"
                name="address"
                value={addressForm.address}
                onChange={handleAddressInputChange}
                required
              />
            </Form.Group>
            <Form.Group className="mb-4">
              <Form.Label>Thành Phố</Form.Label>
              <Form.Control
                type="text"
                name="city"
                value={addressForm.city}
                onChange={handleAddressInputChange}
                required
              />
            </Form.Group>
            <Form.Group className="mb-4">
              <Form.Label>Quốc Gia</Form.Label>
              <Form.Control
                type="text"
                name="country"
                value={addressForm.country}
                onChange={handleAddressInputChange}
                required
              />
            </Form.Group>
            <Form.Group className="mb-4">
              <Form.Label>Mã Bưu Điện</Form.Label>
              <Form.Control
                type="text"
                name="zip"
                value={addressForm.zip}
                onChange={handleAddressInputChange}
                required
              />
            </Form.Group>
            <Form.Group className="mb-4">
              <Form.Label>Số Điện Thoại</Form.Label>
              <Form.Control
                type="text"
                name="telephone"
                value={addressForm.telephone}
                onChange={handleAddressInputChange}
                required
              />
            </Form.Group>
            <Button className="submit-btn" type="submit">
              Thêm Địa Chỉ
            </Button>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button
            className="close-btn"
            onClick={() => setShowAddAddressModal(false)}
          >
            Đóng
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Change Password Modal */}
      <Modal
        show={showChangePasswordModal}
        onHide={() => setShowChangePasswordModal(false)}
        centered
        className="custom-modal"
      >
        <Modal.Header closeButton>
          <Modal.Title>Đổi Mật Khẩu</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={changePassword}>
            <Form.Group className="mb-4">
              <Form.Label>Mật Khẩu Hiện Tại</Form.Label>
              <Form.Control
                type="password"
                name="current_password"
                value={passwordForm.current_password}
                onChange={handlePasswordInputChange}
                required
              />
            </Form.Group>
            <Form.Group className="mb-4">
              <Form.Label>Mật Khẩu Mới</Form.Label>
              <Form.Control
                type="password"
                name="new_password"
                value={passwordForm.new_password}
                onChange={handlePasswordInputChange}
                required
              />
            </Form.Group>
            <Form.Group className="mb-4">
              <Form.Label>Xác Nhận Mật Khẩu Mới</Form.Label>
              <Form.Control
                type="password"
                name="new_password_confirmation"
                value={passwordForm.new_password_confirmation}
                onChange={handlePasswordInputChange}
                required
              />
            </Form.Group>
            <Button className="submit-btn" type="submit">
              Đổi Mật Khẩu
            </Button>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button
            className="close-btn"
            onClick={() => setShowChangePasswordModal(false)}
          >
            Đóng
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Change Name Modal */}
      <Modal
        show={showChangeNameModal}
        onHide={() => setShowChangeNameModal(false)}
        centered
        className="custom-modal"
      >
        <Modal.Header closeButton>
          <Modal.Title>Đổi Tên</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={changeName}>
            <Form.Group className="mb-4">
              <Form.Label>Họ</Form.Label>
              <Form.Control
                type="text"
                name="firstName"
                value={nameForm.firstName}
                onChange={handleNameInputChange}
                required
              />
            </Form.Group>
            <Form.Group className="mb-4">
              <Form.Label>Tên</Form.Label>
              <Form.Control
                type="text"
                name="lastName"
                value={nameForm.lastName}
                onChange={handleNameInputChange}
                required
              />
            </Form.Group>
            <Button className="submit-btn" type="submit">
              Đổi Tên
            </Button>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button
            className="close-btn"
            onClick={() => setShowChangeNameModal(false)}
          >
            Đóng
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default MyAccount;
