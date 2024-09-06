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

  // const [phrase, setPhrase] = useState();
  const [translated, setTranslated] = useState();
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

    openModal();

    if (selectedAction === 'translate') {
      await translate();
    } else if (selectedAction === 'translate') {
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
        const response = await axios.post('https://webscrape-5iyk.onrender.com/api/gemini/get', {
          filePath: article.url
        });
        setTranslated(response.data[0].translated);
      } catch (error) {
        console.error("Error fetching articles:", error);
      }
    };
    fetchArticles();
  }, [article.url]);

  // const paraphrase = async () => {
  //   try {
  //     const response = await axios.post('https://webscrape-5iyk.onrender.com/api/paraphrase', {
  //       text: content.__html,
  //       filePath: article.url
  //     });
  //     setPhrase(response.data.paraphrasedText);
  //   } catch (error) {
  //     console.error("Error fetching articles:", error);
  //   } finally {
  //     closeModal();
  //   }
  // };

  const translate = async () => {
    try {
      const textToTranslate = content.__html;

      const response = await axios.post('https://webscrape-5iyk.onrender.com/api/gemini/translate', {
        text: textToTranslate,
        filePath: article.url
      });
  
      setTranslated(response.data.translatedText);
    } catch (error) {
      console.error("Error translating content:", error);
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
                    <button onClick={() => handleAction('translate')}>Translate</button>
                    {/* <button onClick={() => handleAction('paraphrase')}>Paraphrase</button> */}
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
                <h3><strong>ORIGINAL CONTENT:</strong></h3>
                <p className="content" dangerouslySetInnerHTML={{ __html: formatText(article.content) }} />
                {/* {(article.paraphrased || phrase) && (
                  <>
                    <h3><strong>PARAPHRASED CONTENT:</strong></h3>
                    <p className="content"> {article.paraphrase || phrase} </p>
                  </>
                )} */}
                {(article.translated || translated) && (
                  <>
                    <h3><strong>TRANSLATED CONTENT:</strong></h3>
                    <p className="content"> {article.translated || translated} </p>
                  </>
                )}
              </>
            ) : (
              <p>Failed to fetch the content.</p>
            )}
          </div>
        </div>
      </div>

      {isModalOpen && (
        <div className="modal">
          <div className="modal-content">
            {loading ? (
              <div className="loading-indicator">
                <p>Loading... Please wait while we {action === 'paraphrase' ? 'paraphrase' : 'translate'} the content.</p>
              </div>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
};

export default Article;
