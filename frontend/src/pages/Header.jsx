import React, { useState, useEffect } from "react";
import "./main.css";
import { ToastContainer } from "react-toastify";
import logos from '../assets/logo/GDSLogo.png';
import { useNavigate } from "react-router-dom";

const Header = () => {
    const navigate = useNavigate();
    const [activeButton, setActiveButton] = useState(localStorage.getItem('activeButton') || '');

    useEffect(() => {
        // Store the active button state in localStorage whenever it changes
        localStorage.setItem('activeButton', activeButton);
    }, [activeButton]);

    const handleNavigation = (path, buttonName) => {
        navigate(path);
        setActiveButton(buttonName);
    };

    return (
        <div>
            <ToastContainer />
            <div className="headers">
                <div className="childs">
                    <div className="logochild" onClick={() => handleNavigation("/", '')}>
                        <img src={logos} alt="logo" />
                    </div>
                </div>
                <div className="childs">
                    <button 
                        className={activeButton === '' ? 'active' : ''}
                        onClick={() => handleNavigation("/", '')}
                    >
                        HOME
                    </button>
                    <button 
                        className={activeButton === 'ABS-CBN' ? 'active' : ''}
                        onClick={() => handleNavigation("/abs-cbn", 'ABS-CBN')}
                    >
                        ABS-CBN
                    </button>
                    <button 
                        className={activeButton === 'GMA' ? 'active' : ''}
                        onClick={() => handleNavigation("/gma", 'GMA')}
                    >
                        GMA
                    </button>
                    <button 
                        className={activeButton === 'TV5' ? 'active' : ''}
                        onClick={() => handleNavigation("/tv-5", 'TV5')}
                    >
                        TV5
                    </button>
                    <button 
                        className={activeButton === 'RAPPLER' ? 'active' : ''}
                        onClick={() => handleNavigation("/rappler", 'RAPPLER')}
                    >
                        RAPPLER
                    </button>
                    <button 
                        className={activeButton === 'INQUIRER' ? 'active' : ''}
                        onClick={() => handleNavigation("/inquirer", 'INQUIRER')}
                    >
                        INQUIRER
                    </button>
                    <button 
                        className={activeButton === 'MANILA BULLETIN' ? 'active' : ''}
                        onClick={() => handleNavigation("/manila-bulletin", 'MANILA BULLETIN')}
                    >
                        MANILA BULLETIN
                    </button>
                    <button 
                        className={activeButton === 'PHIL STAR' ? 'active' : ''}
                        onClick={() => handleNavigation("/phil-star", 'PHIL STAR')}
                    >
                        PHIL STAR
                    </button>
                    <button 
                        className={activeButton === 'MANILA TIMES' ? 'active' : ''}
                        onClick={() => handleNavigation("/manila-times", 'MANILA TIMES')}
                    >
                        MANILA TIMES
                    </button>
                    <button 
                        className={activeButton === 'BUSINESS WORLD' ? 'active' : ''}
                        onClick={() => handleNavigation("/business-world", 'BUSINESS WORLD')}
                    >
                        BUSINESS WORLD
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Header;
