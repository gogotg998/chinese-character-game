import React from 'react';
import './ResultFeedback.css';

interface ResultFeedbackProps {
  result: 'correct' | 'wrong' | null;
  correctPinyin: string;
}

const ResultFeedback: React.FC<ResultFeedbackProps> = ({ result, correctPinyin }) => {
  if (result === null) {
    return null;
  }
  
  return (
    <div className={`result-feedback ${result}`}>
      {result === 'correct' ? (
        <>
          <span className="icon">✓</span>
          <span className="message">正确!</span>
        </>
      ) : (
        <>
          <span className="icon">✗</span>
          <span className="message">
            错误，正确拼音是: <strong>{correctPinyin}</strong>
          </span>
        </>
      )}
    </div>
  );
};

export default ResultFeedback; 