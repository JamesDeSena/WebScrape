import React from "react";
import "./main.css";
import { ToastContainer } from "react-toastify";

const ABSCBN = () => {

    return (
        <div className="land">
            <ToastContainer />
            <p className="ret">LAST RETRIEVED: 2 MINS. AGO</p>
            <div className="big">
                <div className="articlecont">
                    {/* max of 10 articles per 1 page */}
                    <div className="articles">
                        <div className="content">
                            <a href="/article" className="title">
                                <h2>PNP eyes Quiboloy arrest inside Davao compound without violence</h2>
                                <span className="news">ABS-CBN</span>
                            </a>
                            <p>https://www.manilatimes.net/2024/08/20/news/national/palawan-boracay-in-top-islands-list/1964980"</p>
                            <div className="contents">
                                <p>Date: August 20,2024 </p>
                                <p className="retrieved">Retrieved: 2 hours ago</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ABSCBN;
