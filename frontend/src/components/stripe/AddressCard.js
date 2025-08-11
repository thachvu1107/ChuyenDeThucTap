import React, { Component } from "react";

class AddressCard extends Component {
  render() {
    const { firstName, lastName, address, zip, country, city, telephone } =
      this.props.address;

    return (
      <div style={styles.card}>
    
        <p style={styles.text}>
          <strong>Họ tên:</strong> {firstName} {lastName}
        </p>
        <p style={styles.text}>
          <strong>Địa chỉ:</strong> {address}, {city}, {country} ({zip})
        </p>
        <p style={styles.text}>
          <strong>Số điện thoại:</strong> {telephone}
        </p>
      </div>
    );
  }
}

const styles = {
  card: {
    border: "1px solid #ccc",
    borderRadius: "8px",
    padding: "16px",
    marginTop: "10px",
    backgroundColor: "#f9f9f9",
    maxWidth: "400px",
  },
  label: {
    fontSize: "16px",
    fontWeight: "bold",
    color: "#333",
    marginBottom: "10px",
  },
  icon: {
    color: "#ff4d4f",
    marginRight: "6px",
  },
  text: {
    fontSize: "15px",
    color: "#444",
    margin: "4px 0",
  },
};

export default AddressCard;
