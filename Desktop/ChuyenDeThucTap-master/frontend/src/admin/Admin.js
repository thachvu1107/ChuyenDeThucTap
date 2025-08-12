import React, { useState, useEffect } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";


import Menu from "./layouts/Menu";
import Topbar from './layouts/Topbar';
import Footer from "./layouts/Footer";

function Admin({ user }) {
    const navigate = useNavigate();
    const [role_id, setRole_id] = useState(null);

    var ss = document.createElement("link");
    ss.rel = "stylesheet";
    ss.style = "text/css";
    ss.href = "/admin/dist/css/adminlte.min.css";
    document.head.appendChild(ss);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            Swal.fire({
                icon: "error",
                text: "You must be logged in to access this page."
            });
            navigate("/"); // Redirect to the login page if not authenticated
            return;
        }

        // Retrieve the role from local storage and user prop
        const storedRole = localStorage.getItem('role_id');
        const userRole = user?.role_id ? user.role_id.toString() : storedRole;

        if (userRole) {
            setRole_id(parseInt(userRole));
        }

        // Redirect if the user does not have the required role
        if (userRole !== '1') {
            Swal.fire({
                icon: "error",
                text: "You do not have permission to access this page."
            });
            navigate("/"); // Redirect to the login page if not authorized
        }
    }, [navigate, user]);

    return (
        <div className='wrapper'>
            <Topbar />
            <Menu />
            <div className="content-wrapper">
                <section className="content-header">
                    {/* <div className="container-fluid">
                        <div className="row mb-2">
                            <div className="col-sm-6">
                                <h1>Admin</h1>
                            </div>
                        </div>
                    </div> */}
                </section>
                <section className="content">
                    <div className="container-fluid">
                        <div className="row">
                            <div className="col-12">
                                <Outlet />
                            </div>
                        </div>
                    </div>
                </section>
            </div>
            <Footer />
        </div>

    );
}

export default Admin;
