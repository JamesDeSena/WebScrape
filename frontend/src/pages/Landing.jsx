import React, { useEffect, useState } from "react";
import axios from "axios";
import "./main.css";
import { ToastContainer } from "react-toastify";
import { useNavigate } from "react-router-dom";
import loadingGif from "../assets/8.gif"

const LandingPage = () => {
    const [articles, setArticles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [articleLoading, setArticleLoading] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchArticles = async () => {
            try {
                setLoading(true);
                const sources = {
                    abs: 'ABS-CBN',
                    gma: 'GMA',
                    bw: 'Business World',
                    mb: 'Manila Bulletin',
                    mt: 'Manila Times',
                    ps: 'Philstar',
                    rp: 'Rappler',
                    inq: 'Inquirer'
                };

                const requests = Object.entries(sources).map(([source, name]) =>
                    axios.get(`http://192.168.13.206:8008/api/${source}/get-data`).then(response => ({
                        articles: response.data,
                        source: name
                    }))
                );

                const responses = await Promise.all(requests);
                const allArticles = responses.flatMap(({ articles, source }) =>
                    articles.map(article => ({ ...article, source }))
                );

                const sortedArticles = allArticles.sort((a, b) => new Date(b.date) - new Date(a.date));

                setArticles(sortedArticles);
            } catch (error) {
                console.error("Error fetching articles:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchArticles();
    }, []);

    const navigateArticle = async (url) => {
        setArticleLoading(true); // Start loading for individual article
        try {
            const response = await axios.post('http://192.168.13.206:8008/api/abs/get-page', { url });

            if (response.status === 200) {
                const articleData = response.data[0];
                navigate("/article", { state: { articleData } });
            }
        } catch {
            try {
                const response = await axios.post('http://192.168.13.206:8008/api/abs/page', { url });

                if (response.status === 200) {
                    const articleData = response.data;
                    navigate("/article", { state: { articleData } });
                }
            } catch (error) {
                console.error("Error fetching article content:", error.response ? error.response.data : error.message);
            }
        }
    };

    return (
        <div className="land">
            <ToastContainer />
            <p className="ret">LAST RETRIEVED: {loading ? 'Loading...' : 'Updated'}</p>
            <div className="big">
                <div className="articlecont">
                    {loading ? (
                        <p>Loading...</p>
                    ) : articleLoading ? (
                        <div className="loader">
                            <p className="loading-text">Please wait while we fetch the contents...</p>
                            <img src={loadingGif} alt="Loading..." />
                        </div>
                    ) : (
                        articles.map((article, index) => (
                            <div className="articles" key={index}>
                                <div className="content">
                                    <div onClick={() => navigateArticle(article.articleUrl)} className="title" style={{ cursor: 'pointer' }}>
                                        <h2>{article.title}</h2>
                                        <span className="news">{article.source}</span>
                                    </div>
                                    <p>{article.articleUrl}</p>
                                    <div className="contents">
                                        <p>Date: {article.date}</p>
                                        <p className="retrieved">Retrieved: {article.retrieved || 'Unknown'}</p>
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

export default LandingPage;
