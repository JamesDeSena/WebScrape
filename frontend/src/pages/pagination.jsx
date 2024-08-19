import React from "react";
import "./main.css";
import { ToastContainer } from "react-toastify";

const Pagination = () => {

    return (
        <div className="pagination">
            <div className="end">
                <button>1</button>
                <button>2</button>
                <button>3</button>
                <button>4</button>
                <button>5</button>
                <button>...</button>
            </div>
        </div>
    );
};

export default Pagination;
