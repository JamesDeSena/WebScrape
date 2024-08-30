import React, { useState } from "react";
import { FaCopy } from "react-icons/fa";
import { AiOutlineTranslation } from "react-icons/ai";
import { useLocation } from "react-router-dom";


const Article = () => {
  const { state } = useLocation();
  const article = state?.articleData;

  // State to manage modal visibility
  const [isModalOpen, setIsModalOpen] = useState(false);

  const copyToClipboard = () => {
    const content = document.getElementById('contentToCopy').innerText;
    navigator.clipboard.writeText(content).then(() => {
      alert('Content copied to clipboard!');
    }).catch(err => {
      console.error('Failed to copy content: ', err);
    });
  };

  // Convert content with line breaks to HTML with <br />
  const formatTextWithLineBreaks = (text) => {
    return text.split('\n').join('<br />');
  };

  // Function to open the modal
  const openModal = () => {
    setIsModalOpen(true);
  };

  // Function to close the modal
  const closeModal = () => {
    setIsModalOpen(false);
  };

  return (
    <div>
      <div className="contentsbig">
        <div className="contentsecond">
          <div className="contentsecos">
            <div className="breadcrumb">
              CATEGORY: ABS-CBN
            </div>
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
                <p className="dandr">Date: {article.date} | Retrieved: 5 secs. ago</p>
                <hr />
                <p className="content" dangerouslySetInnerHTML={{ __html: formatTextWithLineBreaks(article.content) }} />
              </>
            ) : (
              <p>No article data available.</p>
            )}
          </div>
        </div>
      </div>

      {/* Modal Component */}
      {isModalOpen && (
        <div className="modal">
          <div className="modal-content">
            <button className="close" onClick={closeModal}>&times;</button>
            <h2>You're about to paraphrase the content. </h2>
            <p>Click 'Proceed' to continue.</p>
            <button className="proceed">PROCEED</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Article;
