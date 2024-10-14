import React, { useState, useEffect } from "react";
import { AiOutlineTranslation } from "react-icons/ai";
import { useLocation, useNavigate } from "react-router-dom";
import { IoReturnUpBackOutline } from "react-icons/io5";
import axios from 'axios';

const API = import.meta.env.VITE_REACT_APP_API;

const Orig = () => {
  const { state } = useLocation();
  const article = state?.articleData;
  const navigate = useNavigate();

  const [translatedContent, setTranslatedContent] = useState();
  const [translatedTitle, setTranslatedTitle] = useState();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

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

  // const handleAction = async (selectedAction) => {
  //   setAction(selectedAction);
  //   setIsDropdownOpen(false);

  //   openModal();

  //   if (selectedAction === 'paraphrase') {
  //     await paraphrase();
  //   } else if (selectedAction === 'translate') {
  //     await translate();
  //   }
  // };

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
        const response = await axios.post(`${API}/api/gemini/get`, {
          filePath: article.url
        });
  
        const existingTranslationContent = response.data[0]?.translatedContent;
        const existingTranslationTitle = response.data[0]?.translatedTitle;
  
        if (existingTranslationContent?.trim() && existingTranslationTitle?.trim()) {
          setTranslatedContent(existingTranslationContent);
          setTranslatedTitle(existingTranslationTitle);
        } else {
          const textToTranslate = content.__html;
          const translateResponse = await axios.post(`${API}/api/gemini/translate`, {
            content: textToTranslate,
            title: article.title,
            filePath: article.url
          });
          
          setTranslatedContent(translateResponse.data.translatedContent);
          setTranslatedTitle(translateResponse.data.translatedTitle);
        }
      } catch (error) {
        console.error("Error fetching or translating articles:", error);
      }
    };
  
    fetchArticles();
  }, [article.url, content.__html, article.title]);

  // const paraphrase = async () => {
  //   try {
  //     const response = await axios.post('http://192.168.13.206:8008/api/paraphrase', {
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

  // const translate = async () => {
  //   try {
  //     const textToTranslate = content.__html;

  //     const response = await axios.post('http://192.168.13.206:8008/api/gemini/translate', {
  //       text: textToTranslate,
  //       filePath: article.url
  //     });

  //     setTranslated(response.data.result);
  //   } catch (error) {
  //     console.error("Error translating content:", error);
  //   } finally {
  //     closeModal();
  //   }
  // };

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
          {/* <div className="contentsec" id="contentToCopy">
            {article ? (
              <>
                <h2 className="title">{article.title}</h2>
                <p className="dandr">Author: {article.author}</p>
                <p className="dandr">Date: {article.date}</p>
                <hr />
                <h3><strong>ORIGINAL CONTENT:</strong></h3>
                <p className="content" dangerouslySetInnerHTML={{ __html: formatText(article.content) }} />
                {(article.paraphrased || phrase) && (
                  <>
                    <h3><strong>PARAPHRASED CONTENT:</strong></h3>
                    <p className="content"> {article.paraphrase || phrase} </p>
                  </>
                )}
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
          </div> */}
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
            <div className="translated"  id="translatedContentToCopy">
              <h2 className="title">{article.translatedTitle || translatedTitle}</h2>
              <p className="dandr">Author: {article.author}</p>
              <p className="dandr">Date: {article.date}</p>
              <hr />
              <p className="translate"> {article.translatedContent || translatedContent} </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Orig;
