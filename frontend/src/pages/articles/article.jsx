import React, { useState } from "react";
import { FaCopy } from "react-icons/fa";
import { AiOutlineTranslation } from "react-icons/ai";
import { useLocation, useNavigate } from "react-router-dom";
import { IoReturnUpBackOutline } from "react-icons/io5";
import axios from 'axios';

const Article = () => {
  const { state } = useLocation();
  const article = state?.articleData;
  const navigate = useNavigate();

  const [phrase, setPhrase] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const copyToClipboard = () => {
    const content = document.getElementById('contentToCopy').innerText;
    navigator.clipboard.writeText(content).then(() => {
      alert('Content copied to clipboard!');
    }).catch(err => {
      console.error('Failed to copy content: ', err);
    });
  };

  const formatText = (text) => {
    const withoutStrongTags = text.replace(/<\/?strong>/g, '');
    const withoutUnderlineTags = withoutStrongTags.replace(/<\/?u>/g, '');
    return withoutUnderlineTags.split('\n').join(' ');
  };

  const content = { __html: formatText(article.content) };

  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    if (!loading) {
      setIsModalOpen(false);
    }
  };

  const paraphrase = async () => {
    setLoading(true);
    try {
      const response = await axios.post('http://localhost:8080/api/paraphrase', { 
        text: content.__html,
        filePath: article.url
      });
      setPhrase(response.data.paraphrasedText)
    } catch (error) {
      console.error("Error paraphrasing content:", error);
    } finally {
      setLoading(false);
      setIsModalOpen(false);
    }
  };

  return (
    <div>
      <div className="contentsbig">
        <div className="contentsecond">
          <div className="contentsecos">
            <button className="return" onClick={() => navigate(-1)}>
              <IoReturnUpBackOutline /> RETURN
            </button>
            <div className="groupbutton">
              <button className="copy" onClick={copyToClipboard}>
                <FaCopy /> COPY
              </button>
              <button className="paraphrase" onClick={openModal}>
                <AiOutlineTranslation /> PARAPHRASE
              </button>
            </div>
          </div>
          <div className="contentsec" id="contentToCopy">
            {/* Display article data */}
            {article ? (
              <>
                <h2 className="title">{article.title}</h2>
                <p className="dandr">Author: {article.author}</p>
                <p className="dandr">Date: {article.date}</p>
                <hr />
                <p className="content" dangerouslySetInnerHTML={{ __html: phrase || formatText(article.content) }} />
              </>
            ) : (
              <p>No article data available.</p>
            )}
          </div>
        </div>
      </div>

      {isModalOpen && (
        <div className="modal">
          <div className="modal-content">
            <button className="close" onClick={closeModal}>&times;</button>
            {loading ? (
              <div className="loading-indicator">
                <p>Paraphrasing in progress, please wait...</p>
                {/* You can replace this with a spinner or any loading animation */}
              </div>
            ) : (
              <>
                <h2>You're about to paraphrase the content.</h2>
                <p>Click 'Proceed' to continue.</p>
                <button className="proceed" onClick={paraphrase}>PROCEED</button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Article;
