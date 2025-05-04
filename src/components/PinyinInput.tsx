import React, { useState, useRef, useEffect } from 'react';
import './PinyinInput.css';

interface PinyinInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  disabled?: boolean;
}

const PinyinInput: React.FC<PinyinInputProps> = ({ 
  value, 
  onChange, 
  onSubmit,
  disabled = false 
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [shaking, setShaking] = useState<boolean>(false);
  const [isTyping, setIsTyping] = useState<boolean>(false);
  
  useEffect(() => {
    // 当组件渲染或重新渲染时，聚焦到输入框
    if (inputRef.current && !disabled) {
      inputRef.current.focus();
    }
  }, [disabled]);
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      if (value.trim() && !disabled) {
        onSubmit();
      } else if (!value.trim()) {
        triggerShake();
      }
    }
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // 只允许字母输入
    const newValue = e.target.value.replace(/[^a-zA-Z]/g, '');
    
    if (newValue !== value) {
      setIsTyping(true);
      onChange(newValue);
      
      // 设置短暂的打字动画
      setTimeout(() => {
        setIsTyping(false);
      }, 150);
    }
  };
  
  const handleSubmit = () => {
    if (value.trim() && !disabled) {
      onSubmit();
    } else if (!value.trim()) {
      triggerShake();
    }
  };
  
  const triggerShake = () => {
    setShaking(true);
    setTimeout(() => setShaking(false), 600);
  };
  
  return (
    <div className="pinyin-input-container">
      <div className={`input-wrapper ${isTyping ? 'typing' : ''}`}>
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder="请输入拼音（仅限字母）"
          disabled={disabled}
          className={`${disabled ? 'disabled' : ''} ${shaking ? 'shake' : ''}`}
          autoComplete="off"
          spellCheck="false"
        />
        <div className="cursor-effect"></div>
      </div>
      <button 
        className="submit-button"
        onClick={handleSubmit}
        disabled={disabled}
      >
        提交
      </button>
    </div>
  );
};

export default PinyinInput; 