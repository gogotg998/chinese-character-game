import React from 'react';
import './CharacterDisplay.css';

interface CharacterDisplayProps {
  character: string;
  audio: string;
}

const CharacterDisplay: React.FC<CharacterDisplayProps> = ({ character, audio }) => {
  const playAudio = () => {
    try {
      // 为了演示目的，使用浏览器的语音合成API
      const utterance = new SpeechSynthesisUtterance(character);
      utterance.lang = 'zh-CN';
      window.speechSynthesis.speak(utterance);
    } catch (error) {
      console.error('播放音频失败', error);
    }
  };

  return (
    <div className="character-display">
      <div className="character">{character}</div>
      <button className="audio-button" onClick={playAudio} aria-label="播放读音">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
          <path fill="none" d="M0 0h24v24H0z"/>
          <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" fill="currentColor"/>
        </svg>
      </button>
    </div>
  );
};

export default CharacterDisplay; 