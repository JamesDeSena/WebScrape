import React, { useEffect } from 'react';

const TranslateComponent = () => {
    const query = async (data) => {
        const response = await fetch(
            "https://api-inference.huggingface.co/models/Helsinki-NLP/opus-mt-en-zh",
            {
                headers: {
                    Authorization: "Bearer hf_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
                    "Content-Type": "application/json",
                },
                method: "POST",
                body: JSON.stringify(data),
            }
        );
        const result = await response.json();
        return result;
    };

    useEffect(() => {
        const inputText = {"inputs": "I am amazing"};
        
        query(inputText).then((response) => {
            console.log(JSON.stringify(response));
        });
    }, []);

    return (
        <div>
            <p>Translation in progress...</p>
        </div>
    );
};

export default TranslateComponent;
