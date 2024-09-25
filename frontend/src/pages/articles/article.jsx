import React, { useState, useEffect } from "react";
import { FaCopy } from "react-icons/fa";
import { AiOutlineTranslation } from "react-icons/ai";
import { useLocation, useNavigate } from "react-router-dom";
import { IoReturnUpBackOutline } from "react-icons/io5";
import Translategif from "../../assets/6.gif"

import axios from 'axios';

const Article = () => {
  const { state } = useLocation();
  const article = state?.articleData;
  const navigate = useNavigate();

  const [phrase, setPhrase] = useState();
  const [translatedContent, setTranslatedContent] = useState();
  const [translatedTitle, setTranslatedTitle] = useState();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false); // Loading state
  const [action, setAction] = useState('');

  const copyToClipboard = () => {
    const content = document.getElementById('originalContentToCopy').innerText;
    navigator.clipboard.writeText(content).then(() => {
      alert('Original content copied to clipboard!');
    }).catch(err => {
      console.error('Failed to copy content: ', err);
    });
  };

  const copyTranslatedToClipboard = () => {
    const content = document.getElementById('translatedContentToCopy').innerText;
    navigator.clipboard.writeText(content).then(() => {
      alert('Translated content copied to clipboard!');
    }).catch(err => {
      console.error('Failed to copy translated content: ', err);
    });
  };

  const handleAction = (selectedAction) => {
    setAction(selectedAction);
    setIsDropdownOpen(false);

    if (selectedAction === 'orig') {
      copyToClipboard();
    } else if (selectedAction === 'translate') {
      copyTranslatedToClipboard();
    }
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
        setLoading(true); // Start loading
        const response = await axios.post('https://pdmnnewshub.ddns.net:8080/api/gemini/get', {
          filePath: article.url
        });

        const existingTranslationContent = response.data[0]?.translatedContent;
        const existingTranslationTitle = response.data[0]?.translatedTitle;

        if (existingTranslationContent?.trim() && existingTranslationTitle?.trim()) {
          setTranslatedContent(existingTranslationContent);
          setTranslatedTitle(existingTranslationTitle);
        } else {
          const textToTranslate = content.__html;
          const translateResponse = await axios.post('https://pdmnnewshub.ddns.net:8080/api/gemini/translate', {
            content: textToTranslate,
            title: article.title,
            filePath: article.url
          });

          setTranslatedContent(translateResponse.data.translatedContent);
          setTranslatedTitle(translateResponse.data.translatedTitle);
        }
      } catch (error) {
        console.error("Error fetching or translating articles:", error);
      } finally {
        setLoading(false); // Stop loading
      }
    };

    fetchArticles();
  }, [article.url, content.__html, article.title]);

  return (
    <div>
      <div className="contentsbig">
        <div className="contentsecond">
          <div className="contentsecos">
            <button className="return" onClick={() => navigate(-1)}>
              <IoReturnUpBackOutline /> RETURN
            </button>
            <div className="groupbutton">
              <div className="dropdown">
                <button className="paraphrase" onClick={toggleDropdown}>
                  <AiOutlineTranslation /> COPY OPTIONS
                </button>
                {isDropdownOpen && (
                  <div className="dropdown-content">
                    <button onClick={() => handleAction('orig')}>COPY ORIGINAL</button>
                    <button onClick={() => handleAction('translate')}>COPY TRANSLATE</button>
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="newcontent">
            <div className="original" id="originalContentToCopy">
              {article ? (
                <>
                  <h2 className="title">{article.title}</h2>
                  <p className="dandr">Author: {article.author}</p>
                  <p className="dandr">Date: {article.date}</p>
                  <hr />
                  <p className="content" dangerouslySetInnerHTML={{ __html: formatText(article.content) }} />
                </>
              ) : (
                <p>Failed to fetch the content.</p>
              )}
            </div>
            <div className="vl" ></div>
            <div className="translated" id="translatedContentToCopy">
              {loading ? (
                <div className="translateload">
                  <img src={Translategif} alt='Loading' />
                  <p>Loading translation for the content...</p>
                </div>
              ) : (
                <>              
                  <h2 className="title">{translatedTitle}</h2>
                  <p className="dandr">Author: {article.author}</p>
                  <p className="dandr">Date: {article.date}</p>
                  <hr />
                  <p className="translate">{translatedContent}</p>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Article;
