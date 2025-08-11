import React, { Component } from "react";
import axios from "axios";
import Slider from "react-slick";
import Spinner from "react-bootstrap/Spinner";
import Button from "react-bootstrap/Button";
import { connect } from "react-redux";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Api } from "../../api/Api";
import { ImageApi } from "../../api/ImageApi";
import { useParams } from "react-router-dom";
import ProductItem from "./products/ProductItem";
import "../css/ProductItem.css";

function withRouter(Component) {
  function ComponentWithRouterProps(props) {
    const params = useParams();
    return <Component {...props} params={params} />;
  }
  return ComponentWithRouterProps;
}

class QuickPage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      currentCategory: 1,
      categories: [],
      products: [],
    };
    this.handleClick = this.handleClick.bind(this);
    this.handleWishlist = this.handleWishlist.bind(this);
  }

  componentDidMount() {
    this.getCategories();
    this.getProducts(this.props.params.categoryId);
  }

  componentDidUpdate(prevProps) {
    if (this.props.params.categoryId !== prevProps.params.categoryId) {
      this.getProducts(this.props.params.categoryId);
    }
  }

  getCategories() {
    axios
      .get(`${Api}/product/categories`)
      .then((response) => {
        this.setState({ categories: [...response.data] });
      })
      .catch((error) => console.log(error));
  }

  getCurrentCategoryName() {
    const { categories } = this.state;
    const currentId = parseInt(this.props.params.categoryId);
    const currentCategory = categories.find((c) => c.id === currentId);
    return currentCategory ? currentCategory.name.toUpperCase() : "DANH MỤC";
  }

  handleWishlist(e) {
    if (!localStorage.getItem("token")) {
      toast.error("Cần đăng nhập!");
    } else {
      axios
        .post(
          `${Api}/product/wishlist`,
          { productId: e.target.id },
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        )
        .then((response) => {
          if (response.status === 200) {
            this.props.updateWishlistCount(response.data);
            toast.success("Đã thêm vào danh sách yêu thích!");
          }
        })
        .catch((error) => {
          toast.info("Sản phẩm đã có trong danh sách yêu thích!");
        });
    }
  }

  handleClick(e) {
    const id = e.target.id;
    if (e.target.className === "add-to-cart-btn") {
      this.props.showQuickView(id);
    } else if (
      e.target.className === "qucik-view q q-primary" ||
      e.target.className === "fa fa-eye"
    ) {
      this.props.showQuickView(id);
    } else {
      e.preventDefault();
      this.getProducts(id);
      this.setState({ currentCategory: id });
    }
  }

  getProducts(categoryId) {
    let query = this.props.id === 1 ? "new" : "top-selling";
    this.setState({ loading: true });

    axios
      .get(`${Api}/product/categories/${categoryId}/${query}`)
      .then((response) => {
        this.setState({
          products: [...response.data],
          loading: false,
        });
      })
      .catch((error) => console.log(error));
  }

  render() {
    const settings = {
      slidesToShow: 4,
      slidesToScroll: 1,
      autoplay: true,
      infinite: false,
      dots: false,
      arrows: true,
      rows: 1,
      slidesPerRow: 1,
      responsive: [
        {
          breakpoint: 991,
          settings: {
            slidesToShow: 2,
            slidesToScroll: 1,
          },
        },
        {
          breakpoint: 480,
          settings: {
            slidesToShow: 1,
            slidesToScroll: 1,
          },
        },
      ],
    };

    return (
      <div>
        <div className="col">
          <h2 className="category-title">{this.getCurrentCategoryName()}</h2>
        </div>

        <div className="section">
          <ToastContainer />
          <div className="container">
            <div className="col">
              {this.state.loading ? (
                <div className="spinner-container">
                  <Spinner animation="border" />
                </div>
              ) : (
                <div id="product-container" className="row-lg-12">
                  <div className="col">
                    <div className="products-tabs">
                      <div
                        id={"tab" + this.props.id}
                        className="tab-pane active"
                      >
                        <div
                          className="products-slick"
                          data-nav={"#slick-nav-" + this.props.id}
                        >
                          {this.state.products.map((product) => (
                            <ProductItem
                              key={product.id}
                              product={product}
                              handleWishlist={this.handleWishlist}
                              handleClick={this.handleClick}
                            />
                          ))}
                        </div>
                        <div
                          id={"slick-nav-" + this.props.id}
                          className="products-slick-nav"
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        <div style={{ paddingBottom: 50 }}></div>
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  productId: state.product_id,
  showModal: state.show_modal,
});

const mapDispatchToProps = (dispatch) => ({
  showQuickView: (id) => dispatch({ type: "QUICKVIEW_CONTROL", value: id }),
  showLogin: () => dispatch({ type: "LOGIN_CONTROL", value: true }),
  updateWishlistCount: (count) =>
    dispatch({ type: "WISHLIST_COUNT", value: count }),
  showToast: (msg) => dispatch({ type: "SHOW_TOAST", value: msg }),
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withRouter(QuickPage));
