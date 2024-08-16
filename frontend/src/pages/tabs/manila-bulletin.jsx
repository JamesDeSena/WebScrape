import React from "react";
import "../main.css";
import { ToastContainer } from "react-toastify";

const MBulletin = () => {
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

                            </a>
                            <p>A Philippine National Police spokesperson admitted Friday arresting controversial televangelist Apollo Quiboloy inside his Kingdom of Jesus
                                Christ compound in Davao City is not a simple matter.

                                Police Brig. Gen. Nicolas Torre III, Police Regional Office (PRO)-Davao region chief, earlier said Quiboloy is still
                                hiding inside the 30-hectare KOJC compound in Barangay
                                Buhangin where he is shielded by KOJC members.

                                Quiboloy is accused of sexual abuse and human trafficking and has a P10 million bounty for his arrest.
                            </p>
                        </div>
                        <div className="content">
                            <p className="retrieved">
                                Retrieved 2 hours ago
                            </p>
                        </div>
                    </div>
                </div>
            </div>
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
        </div>
    );
};

export default MBulletin; 