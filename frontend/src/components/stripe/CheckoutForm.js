import React, { useState, useEffect } from "react";
import Spinner from "react-bootstrap/Spinner";
import { connect } from "react-redux";
import axios from "axios";
import { Api } from "./../../api/Api";

function CheckoutForm(props) {
  const [succeeded, setSucceeded] = useState(false);
  const [cardHolder, setCardHolder] = useState("");
  const [checked, setChecked] = useState(false);
  const [error, setError] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [disabled, setDisabled] = useState(false); // Adjusted for COD

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    setProcessing(true);

    // Save address if necessary
    if (props.address.presistAddress) {
      try {
        await axios.post(
          `${Api}/user/address`,
          {
            firstName: props.address.firstName,
            lastName: props.address.lastName,
            address: props.address.address,
            city: props.address.city,
            country: props.address.country,
            zip: props.address.zip,
            telephone: props.address.telephone,
          },
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
      } catch (err) {
        console.error("Error saving address:", err);
        setError("Failed to save address. Please try again.");
        setProcessing(false);
        return;
      }
    }

    // Process the order (Cash on Delivery)
    try {
      await axios.post(
        `${Api}/product/orders`,
        {
          items: props.items,
          note: props.note,
          paymentMethod: "COD", // Indicate Cash on Delivery
        },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      setError(null);
      setProcessing(false);
      setSucceeded(true);
      cleanUp();
    } catch (err) {
      console.error("Error processing order:", err);
      setProcessing(false);
      setError("Order processing failed. Please try again.");
    }
  };

  const cleanUp = () => {
    let checkoutList = JSON.parse(localStorage.getItem("checkoutList")) || [];
    let cartList = JSON.parse(localStorage.getItem("cartList")) || [];

    const checkoutStockIds = checkoutList.map((item) => item.stock_id);
    cartList = cartList.filter(
      (item) => !checkoutStockIds.includes(item[0].stock_id)
    );

    localStorage.setItem("checkoutList", "");
    localStorage.setItem("cartList", JSON.stringify(cartList));

    updateShoppingCartCount();
  };

  const updateShoppingCartCount = () => {
    axios
      .get(`${Api}/product/cart-list/count`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      })
      .then((result) => {
        let localCartList = JSON.parse(localStorage.getItem("cartList")) || [];
        let stockList = localCartList.map((list) => list[0].stock_id);
        let cartList = [...stockList, ...result.data];
        let uniqueCartList = [...new Set(cartList)];

        props.updateCartCount(uniqueCartList.length);
      })
      .catch((err) => {
        console.error("Error updating cart count:", err);
      });
  };

  return !succeeded ? (
    <>
      <div>
        <strong>PAYMENT DETAILS</strong>
      </div>
      <form id="payment-form" onSubmit={handleSubmit}>
        <div className="input-checkbox my-3">
          <input
            type="checkbox"
            id="terms"
            checked={checked}
            onChange={() => setChecked(!checked)}
          />
          <label htmlFor="terms">
            <span></span>
            I've read and accept the <a href="#">terms & conditions</a>
          </label>
        </div>
        <button
          className="primary-btn"
          disabled={processing || !checked}
          id="submit"
        >
          <span id="button-text">
            {processing ? (
              <Spinner id="place-order-spinner" animation="border" />
            ) : (
              "Place Order (Cash on Delivery)"
            )}
          </span>
        </button>
        {error && (
          <div className="card-error" role="alert">
            {error}
          </div>
        )}
      </form>
    </>
  ) : (
    <div id="order-success">
      <i className="fa fa-check" aria-hidden="true"></i>
      <p>
        <strong>ORDER PLACED SUCCESSFULLY</strong>
      </p>
    </div>
  );
}

const mapDispatchToProps = (dispatch) => {
  return {
    updateCartCount: (count) => dispatch({ type: "CART_COUNT", value: count }),
  };
};

export default connect(null, mapDispatchToProps)(CheckoutForm);
