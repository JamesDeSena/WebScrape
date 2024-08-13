import React from "react";
import "./main.css";
import { ToastContainer } from "react-toastify";

const Landing = () => {

    return (
        <div className="land">
            <ToastContainer />
            <h3>LAST RETRIEVED: 2 MINS. AGO</h3>
            <div className="big">
                <div className="articlecont">
                    {/* max of 10 articles per 1 page */}
                    <div className="articles">
                        <div className="content">
                            <h2>PNP eyes Quiboloy arrest inside Davao compound without violence</h2>
                            <p>A Philippine National Police spokesperson admitted Friday arresting controversial televangelist Apollo Quiboloy inside his Kingdom of Jesus Christ compound in Davao City is not a simple matter.

Police Brig. Gen. Nicolas Torre III, Police Regional Office (PRO)-Davao region chief, earlier said Quiboloy is still hiding inside the 30-hectare KOJC compound in Barangay Buhangin where he is shielded by KOJC members.

Quiboloy is accused of sexual abuse and human trafficking and has a P10 million bounty for his arrest.

Speaking to TeleRadyo Serbisyo, PNP spokesperson Col. Jean Fajardo said the police force is weighing its options on how to arrest Quiboloy after a previous attempt last June 10 led to a scuffle between law enforcers and KOJC members.

PNP enters Quiboloy compound in Davao City

“Hindi ganun ka-simple. Kung matatandaan mo, unang pinasok ‘yung KOJC compound sa Davao noong June 10 ay nagkaroon ng tensyon,” she explained.

She said searching for Quiboloy inside the KOJC compound “could take hours if not days” because of the size of the estate.

Police have also observed mass movement inside the compound, showing possible movement of KOJC supporters to protect the pastor.

“It will take hours if not days to really search ‘yung napakalaking compound na ‘yun, kailangang pag-isipan ng maigi. This time around, gusto nating makasiguro na hindi mauulit ‘yung nangyari nung June 10,” she said.
She reiterated the PNP’s appeal to Quiboloy to just surrender peacefully and avoid violence.
The Court of Appeals has also issued a freeze order on Quiboloy’s 10 bank accounts, 7 real properties, 5 motor vehicles and an aircraft.
CA freezes Quiboloy and KOJC bank accounts, properties
</p>
                        </div>
                        <div className="content">
                            <p className="retrieved">
                                Retrieved 2 hours ago
                            </p>
                        </div>
                    </div>
                    <div className="articles">
                        <div className="content">
                            <h2>PNP eyes Quiboloy arrest inside Davao compound without violence</h2>
                            <p>A Philippine National Police spokesperson admitted Friday arresting controversial televangelist Apollo Quiboloy inside his Kingdom of Jesus Christ compound in Davao City is not a simple matter. Police Brig. Gen. Nicolas Torre III, Police Regional Office (PRO)-Davao region chief, earlier ...</p>
                        </div>
                        <div className="content">
                            <p className="retrieved">
                                Retrieved 2 hours ago
                            </p>
                        </div>
                    </div>
                    <div className="articles">
                        <div className="content">
                            <h2>PNP eyes Quiboloy arrest inside Davao compound without violence</h2>
                            <p>A Philippine National Police spokesperson admitted Friday arresting controversial televangelist Apollo Quiboloy inside his Kingdom of Jesus Christ compound in Davao City is not a simple matter. Police Brig. Gen. Nicolas Torre III, Police Regional Office (PRO)-Davao region chief, earlier ...</p>
                        </div>
                        <div className="content">
                            <p className="retrieved">
                                Retrieved 2 hours ago
                            </p>
                        </div>
                    </div>
                    <div className="articles">
                        <div className="content">
                            <h2>PNP eyes Quiboloy arrest inside Davao compound without violence</h2>
                            <p>A Philippine National Police spokesperson admitted Friday arresting controversial televangelist Apollo Quiboloy inside his Kingdom of Jesus Christ compound in Davao City is not a simple matter. Police Brig. Gen. Nicolas Torre III, Police Regional Office (PRO)-Davao region chief, earlier ...</p>
                        </div>
                        <div className="content">
                            <p className="retrieved">
                                Retrieved 2 hours ago
                            </p>
                        </div>
                    </div>
                    <div className="articles">
                        <div className="content">
                            <h2>PNP eyes Quiboloy arrest inside Davao compound without violence</h2>
                            <p>A Philippine National Police spokesperson admitted Friday arresting controversial televangelist Apollo Quiboloy inside his Kingdom of Jesus Christ compound in Davao City is not a simple matter. Police Brig. Gen. Nicolas Torre III, Police Regional Office (PRO)-Davao region chief, earlier ...</p>
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

export default Landing; 