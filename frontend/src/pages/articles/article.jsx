import React from "react";
import { FaCopy } from "react-icons/fa6";
import { useLocation } from "react-router-dom";

const Article = () => {
  const { state } = useLocation();
  const article = state?.articleData;

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
    return text.split('\n').join('');
  };

  return (
    <div>
      <div className="contentsbig">
        <div className="contentsecond">
          <div className="contentsecos">
            <div className="breadcrumb">
              CATEGORY: ABS-CBN
            </div>
            <button className="copy" onClick={copyToClipboard}>
              <FaCopy /> COPY
            </button>
          </div>
          <div className="contentsec" id="contentToCopy">
            {article ? (
              <>
                <h2 className="title">{article.title}</h2>
                <p className="dandr">Date: {article.date}</p>
                <hr />
                <p className="content" dangerouslySetInnerHTML={{ __html: formatTextWithLineBreaks(article.content) }} />
              </>
            ) : (
              <p>No article data available.</p>
            )}
          </div>
          {/* <div className="contentseco">
                        <button className="prev">&#171; PREVIOUS PAGE</button>
                        <button className="next">NEXT PAGE  &#187;</button>
                    </div> */}
        </div>
      </div>
    </div>
  );
};

export default Article;
