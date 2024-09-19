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
          rp: 'Rappler',
          inq: 'Inquirer',
          mb: 'Manila Bulletin',
          ps: 'Philstar',
          mt: 'Manila Times',
          bw: 'Business World',
        };

        const requests = Object.entries(sources).map(([source, name]) =>
          axios.get(`http://192.168.13.206:8008/api/${source}/get-data`).then(response => ({
            articles: response.data,
            source, // Store the API source
            name    // Store the display name
          }))
        );

        const responses = await Promise.all(requests);
        const allArticles = responses.flatMap(({ articles, source, name }) =>
          articles.map(article => ({ ...article, source, name })) // Attach both source and name to each article
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

  const navigateArticle = async (url, source) => {
    setArticleLoading(true); // Start loading for individual article
    console.log(`Source clicked: ${source}`); // Log the clicked source

    try {
      const response = await axios.post(`http://192.168.13.206:8008/api/${source}/get-page`, { url });

      if (response.status === 200) {
        const articleData = response.data[0];
        navigate("/article", { state: { articleData } });
      }
    } catch (error) {
      try {
        const response = await axios.post(`http://192.168.13.206:8008/api/${source}/page`, { url });

        if (response.status === 200) {
          const articleData = response.data;
          navigate("/article", { state: { articleData } });
        }
      } catch (error) {
        console.error("Error fetching article content:", error.response ? error.response.data : error.message);
      }
    } finally {
      setArticleLoading(false); // Stop loading for individual article
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
                  {/* Pass the article source (API source) to navigateArticle but display the name */}
                  <div onClick={() => navigateArticle(article.articleUrl, article.source)} className="title" style={{ cursor: 'pointer' }}>
                    <h2>{article.title}</h2>
                    <span className="news">{article.name}</span> {/* Display name */}
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
