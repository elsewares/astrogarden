import React, { useState, useEffect } from "react";

const MixotronicComponent = () => {
  const [terms, setTerms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    fetch("https://api.mxtrnic.com/terms/mix")
      .then(response => {
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        return response.json();
      })
      .then(data => {
        setTerms(data);
        setLoading(false);
      })
      .catch(error => {
        setError(error.message);
        setLoading(false);
      });
  }, []);
  
  if (loading) return <div className="mixotronic-container">Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  
  return (
    <div className="mixotronic-container">
      {terms.map((item, index) => (
        <p key={index}>{item.term}</p>
      ))}
    </div>
  );
};

export default MixotronicComponent;
