import React, { useState, useEffect } from "react";
import { FaCopy } from "react-icons/fa";
import { AiOutlineTranslation } from "react-icons/ai";
import { useLocation, useNavigate } from "react-router-dom";
import { IoReturnUpBackOutline } from "react-icons/io5";

import axios from 'axios';

const Article = () => {
  const { state } = useLocation();
  const article = state?.articleData;
  const navigate = useNavigate();

  const [phrase, setPhrase] = useState();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [action, setAction] = useState('');

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
    const withoutNbsp = withoutUnderlineTags.replace(/&nbsp;/g, ' ');
    return withoutNbsp.split('\n').join(' ');
  };

  const content = { __html: formatText(article.content) };

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const handleAction = async (selectedAction) => {
    setAction(selectedAction);
    setIsDropdownOpen(false);

    if (selectedAction === 'paraphrase') {
      openModal();
      await paraphrase();
    }
  };

  const openModal = () => {
    setIsModalOpen(true);
    setLoading(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setLoading(false);
  };

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        const response = await axios.post('http://localhost:8080/api/paraphrase/get', {
          filePath: article.url
        });
        setPhrase(response.data[0].paraphrase);
      } catch (error) {
        console.error("Error fetching articles:", error);
      }
    };
    fetchArticles();
  }, []);

  const paraphrase = async () => {
    try {
      const response = await axios.post('http://localhost:8080/api/paraphrase', {
        text: content.__html,
        filePath: article.url
      });
      setPhrase(response.data.paraphrasedText)
    } catch (error) {
      console.error("Error fetching articles:", error);
    } finally {
      closeModal();
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
              <div className="dropdown">
                <button className="paraphrase" onClick={toggleDropdown}>
                  <AiOutlineTranslation /> CONTENT OPTIONS
                </button>
                {isDropdownOpen && (
                  <div className="dropdown-content">
                    <button onClick={() => handleAction('paraphrase')}>Paraphrase</button>
                    <button onClick={() => handleAction('translate')}>Translate</button>
                    <button onClick={() => handleAction('paraphraseAndTranslate')}>Paraphrase & Translate</button>
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="contentsec" id="contentToCopy">
            {article ? (
              <>
                <h2 className="title">{article.title}</h2>
                <p className="dandr">Author: {article.author}</p>
                <p className="dandr">Date: {article.date}</p>
                <hr />
                <p className="content" dangerouslySetInnerHTML={{ __html: formatText(article.content) }} />
                {(article.paraphrase || phrase) && (
                  <>
                    <p><strong>Paraphrase</strong></p>
                    <p className="content"> {article.paraphrase || phrase} </p>
                  </>
                )}
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
            {loading ? (
              <div className="loading-indicator">
                <p>Loading... Please wait while we paraphrase the content.</p>
                {/* You can replace this with a spinner or any loading animation */}
              </div>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
};

export default Article;


