import React from "react";
import "./main.css";
import { ToastContainer } from "react-toastify";
import logos from '../assets/logo/GDSLogo.png';
import { useNavigate } from "react-router-dom";

const Header = () => {
    const navigate = useNavigate();
    const navigateABSCBN = () => navigate("/");
    const navigateNewPage = () => navigate("/placeholder");

    return (
        <div>
            <ToastContainer />
            <div className="headers">
                <div className="childs">
                    <div className="logochild">
                        <img src={logos} alt="logo" />
                    </div>
                </div>
                <div className="childs">
                    <button onClick={navigateABSCBN}>ABS-CBN</button>
                    <button onClick={navigateNewPage}>GMA</button>
                    <button onClick={navigateNewPage}>TV5</button>
                    <button onClick={navigateNewPage}>RAPPLER</button>
                    <button onClick={navigateNewPage}>INQUIRER</button>
                    <button onClick={navigateNewPage}>MANILA BULLETIN</button>
                    <button onClick={navigateNewPage}>PHIL STAR</button>
                    <button onClick={navigateNewPage}>MANILA TIMES</button>
                    <button onClick={navigateNewPage}>BUSINESS WORLD</button>
                </div>
            </div>
        </div>
    );
};

export default Header;
