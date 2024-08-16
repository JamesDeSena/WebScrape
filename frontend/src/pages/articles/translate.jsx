import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Translate = ({ textToTranslate }) => {
    const [translatedText, setTranslatedText] = useState('');

    useEffect(() => {
        const fetchTranslation = async () => {
            try {
                const response = await axios.post('http://localhost:5000/translate', {
                    text: textToTranslate
                });
                setTranslatedText(response.data.translation);
            } catch (error) {
                console.error('Error fetching translation:', error);
            }
        };

        if (textToTranslate) {
            fetchTranslation();
        }
    }, [textToTranslate]);

    return (
        <div>
            <h2>Translated Article:</h2>
            <div dangerouslySetInnerHTML={{ __html: translatedText }} />
        </div>
    );
};

export default Translate;
