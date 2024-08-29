import React, { useEffect, useState } from "react";
import axios from "axios";
import "./main.css";
import { ToastContainer } from "react-toastify";

const LandingPage = () => {
    const [articles, setArticles] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchArticles = async () => {
            try {
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
                    axios.get(`http://localhost:8080/api/${source}/get-data`).then(response => ({
                        articles: response.data,
                        source: name
                    }))
                );

                const responses = await Promise.all(requests);

                // Combine all articles into a single array with their sources
                const allArticles = responses.flatMap(({ articles, source }) =>
                    articles.map(article => ({ ...article, source }))
                );

                // Sort articles by date (newest first)
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

    return (
        <div className="land">
            <ToastContainer />
            <p className="ret">LAST RETRIEVED: {loading ? 'Loading...' : 'Updated'}</p>
            <div className="big">
                <div className="articlecont">
                    {loading ? (
                        <p>Loading...</p>
                    ) : (
                        articles.map((article, index) => (
                            <div className="articles" key={index}>
                                <div className="content">
                                    <a href={article.articleUrl} className="title">
                                        <h2>{article.title}</h2>
                                        <span className="news">{article.source}</span> {/* Display the news source */}
                                    </a>
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
