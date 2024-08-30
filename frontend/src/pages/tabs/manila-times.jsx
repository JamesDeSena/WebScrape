import React, { useEffect, useState } from "react";
import axios from "axios";
import "../main.css";
import { ToastContainer } from "react-toastify";
import { useNavigate } from "react-router-dom";

const MTimes = () => {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastRetrieved, setLastRetrieved] = useState(new Date());
  const [minutesAgo, setMinutesAgo] = useState(0);

  const navigate = useNavigate();

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

  const navigateArticle = async (url) => {
    try {
      let response = await axios.post('http://localhost:8080/api/mt/get-page', { url });
  
      if (response.status === 200) {
        const articleData = response.data[0];
        navigate("/article", { state: { articleData } });
        return;
      }
    } catch {
      try {
        const response = await axios.post('http://localhost:8080/api/mt/page', { url });
  
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
                  <div onClick={() => navigateArticle(article.articleUrl)} className="title" style={{ cursor: 'pointer' }}>
                    <h2>{article.title}</h2>
                  </div>
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
