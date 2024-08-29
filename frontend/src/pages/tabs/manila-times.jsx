// WORKING

import React, { useEffect, useState } from "react";
import axios from "axios";
import "../main.css";
import { ToastContainer } from "react-toastify";

const MTimes = () => {
    const [articles, setArticles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [lastRetrieved, setLastRetrieved] = useState(new Date());
    const [minutesAgo, setMinutesAgo] = useState(0);

    useEffect(() => {
        const fetchArticles = async () => {
            try {
                const response = await axios.get('http://localhost:8080/api/mt/get-data');
                const sortedArticles = response.data.reverse();
                setArticles(sortedArticles);
            } catch (error) {
                console.error("Error fetching articles:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchArticles();
    }, []);

    useEffect(() => {
        const calculateMinutesAgo = () => {
            const now = new Date();
            const diff = Math.floor((now - lastRetrieved) / 60000);
            setMinutesAgo(diff);
        };

        const intervalId = setInterval(calculateMinutesAgo, 60000);
        return () => clearInterval(intervalId);
    }, [lastRetrieved]);

    return (
        <div className="land">
            <ToastContainer />
            <p className="ret">LAST RETRIEVED: {minutesAgo} minutes ago</p>
            <div className="big">
                <div className="articlecont">
                    {/* max of 10 articles per 1 page */}
                    {loading ? (
                        <p>Loading...</p>
                    ) : (
                        articles.map((article, index) => (
                            <div className="articles" key={index}>
                                <div className="content">
                                    <a href={article.articleUrl} className="title">
                                        <h2>{article.title}</h2>
                                    </a>
                                    <p>{article.articleUrl}</p>
                                    <div className="contents">
                                        <p>Date: {article.date}</p>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default MTimes;
