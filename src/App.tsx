import React, { useState, useEffect, useRef } from 'react';
import './App.css';
import CharacterDisplay from './components/CharacterDisplay';
import PinyinInput from './components/PinyinInput';
import ProgressBar from './components/ProgressBar';
import ResultFeedback from './components/ResultFeedback';
import Confetti from './components/Confetti';
import easyCharactersData from './data/characters-easy.json';
import mediumCharactersData from './data/characters-medium.json';
import hardCharactersData from './data/characters-hard.json';

// 音效URL
const CORRECT_SOUND_URL = '/sounds/correct.mp3';
const WRONG_SOUND_URL = '/sounds/wrong.mp3';
const GAME_COMPLETE_SOUND_URL = '/sounds/complete.mp3';

interface Character {
  character: string;
  pinyin: string;
  audio: string;
}

type Difficulty = 'easy' | 'medium' | 'hard';

function App() {
  const [characters, setCharacters] = useState<Character[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [numQuestions, setNumQuestions] = useState<number>(20);
  const [userInput, setUserInput] = useState<string>('');
  const [result, setResult] = useState<'correct' | 'wrong' | null>(null);
  const [gameStarted, setGameStarted] = useState<boolean>(false);
  const [gameFinished, setGameFinished] = useState<boolean>(false);
  const [score, setScore] = useState<number>(0);
  const [attempts, setAttempts] = useState<number>(0);
  const [waitingForKeypress, setWaitingForKeypress] = useState<boolean>(false);
  const [difficulty, setDifficulty] = useState<Difficulty>('easy');
  const [showConfetti, setShowConfetti] = useState<boolean>(false);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true); // 添加音效开关状态
  
  // 音效引用
  const correctSoundRef = useRef<HTMLAudioElement | null>(null);
  const wrongSoundRef = useRef<HTMLAudioElement | null>(null);
  const completeGameSoundRef = useRef<HTMLAudioElement | null>(null);

  // 获取对应难度的字词库
  const getCharactersByDifficulty = (diff: Difficulty): Character[] => {
    switch (diff) {
      case 'easy':
        return easyCharactersData;
      case 'medium':
        return mediumCharactersData;
      case 'hard':
        return hardCharactersData;
      default:
        return easyCharactersData;
    }
  };

  // 加载汉字数据
  useEffect(() => {
    setCharacters(getCharactersByDifficulty(difficulty));
    
    // 预加载音效
    correctSoundRef.current = new Audio(CORRECT_SOUND_URL);
    wrongSoundRef.current = new Audio(WRONG_SOUND_URL);
    completeGameSoundRef.current = new Audio(GAME_COMPLETE_SOUND_URL);
    
    return () => {
      // 清理音效资源
      if (correctSoundRef.current) {
        correctSoundRef.current.pause();
      }
      if (wrongSoundRef.current) {
        wrongSoundRef.current.pause();
      }
      if (completeGameSoundRef.current) {
        completeGameSoundRef.current.pause();
      }
    };
  }, [difficulty]);

  // 添加键盘事件监听器以在按下任意键后继续
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (waitingForKeypress && result === 'wrong') {
        setWaitingForKeypress(false);
        setUserInput('');
        setResult(null);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [waitingForKeypress, result]);

  // 自动隐藏彩带特效
  useEffect(() => {
    if (showConfetti) {
      const timer = setTimeout(() => {
        setShowConfetti(false);
      }, 10000); // 10秒后隐藏彩带
      
      return () => clearTimeout(timer);
    }
  }, [showConfetti]);

  // 开始游戏
  const startGame = (questionCount: number) => {
    const charactersData = getCharactersByDifficulty(difficulty);
    
    // 确保题目数量不超过可用的汉字数量
    const maxQuestions = Math.min(questionCount, charactersData.length);
    setNumQuestions(maxQuestions);
    
    // 随机选择指定数量的汉字
    const shuffled = [...charactersData].sort(() => 0.5 - Math.random());
    setCharacters(shuffled.slice(0, maxQuestions));
    setCurrentIndex(0);
    setScore(0);
    setAttempts(0);
    setGameStarted(true);
    setGameFinished(false);
    setShowConfetti(false);
  };

  // 处理用户输入
  const handleInputChange = (input: string) => {
    setUserInput(input);
  };

  // 播放音效
  const playSound = (isCorrect: boolean) => {
    // 如果音效被禁用，直接返回
    if (!soundEnabled) return;
    
    try {
      if (isCorrect && correctSoundRef.current) {
        correctSoundRef.current.currentTime = 0;
        correctSoundRef.current.play().catch(error => {
          console.error('播放正确音效失败:', error);
        });
      } else if (!isCorrect && wrongSoundRef.current) {
        wrongSoundRef.current.currentTime = 0;
        wrongSoundRef.current.play().catch(error => {
          console.error('播放错误音效失败:', error);
        });
      }
    } catch (error) {
      console.error('播放音效失败', error);
    }
  };

  // 播放游戏完成音效
  const playCompleteSound = () => {
    // 如果音效被禁用，直接返回
    if (!soundEnabled) return;
    
    try {
      if (completeGameSoundRef.current) {
        completeGameSoundRef.current.currentTime = 0;
        completeGameSoundRef.current.play().catch(error => {
          console.error('播放游戏完成音效失败:', error);
        });
      }
    } catch (error) {
      console.error('播放游戏完成音效失败', error);
    }
  };

  // 切换音效状态
  const toggleSound = () => {
    setSoundEnabled(!soundEnabled);
  };

  // 提交答案
  const handleSubmit = () => {
    if (currentIndex >= characters.length || waitingForKeypress) return;
    
    const currentCharacter = characters[currentIndex];
    const isCorrect = userInput.toLowerCase() === currentCharacter.pinyin;
    
    setResult(isCorrect ? 'correct' : 'wrong');
    
    // 播放对应音效
    playSound(isCorrect);
    
    if (isCorrect) {
      // 答对后，延迟移动到下一题
      setTimeout(() => {
        setUserInput('');
        setResult(null);
        
        if (currentIndex < characters.length - 1) {
          setCurrentIndex(currentIndex + 1);
        } else {
          setGameFinished(true);
          setShowConfetti(true);
          playCompleteSound();
        }
      }, 1500);
    } else {
      // 答错后，增加尝试次数，并在一段时间后显示"按键继续"提示
      setAttempts(attempts + 1);
      
      // 延迟2秒后显示按任意键继续提示，让用户有时间看到错误反馈
      setTimeout(() => {
        setWaitingForKeypress(true);
      }, 2000);
    }
  };

  // 重新开始游戏
  const restartGame = () => {
    setGameStarted(false);
    setShowConfetti(false);
  };

  // 设置难度级别
  const setDifficultyLevel = (level: Difficulty) => {
    setDifficulty(level);
  };

  // 计算得分
  const calculateScore = () => {
    // 总共会做numQuestions题，每题答对得1分，每次尝试错误扣1分
    const totalScore = numQuestions - attempts;
    return Math.max(0, totalScore); // 确保分数不为负数
  };

  // 处理按键继续
  const handleContinue = () => {
    if (waitingForKeypress && result === 'wrong') {
      setWaitingForKeypress(false);
      setUserInput('');
      setResult(null);
    }
  };

  return (
    <div className="app">
      {showConfetti && <Confetti />}
      
      <header>
        <h1>汉字认字游戏</h1>
        <div className="sound-toggle">
          <button 
            onClick={toggleSound} 
            className={`sound-button ${soundEnabled ? 'sound-on' : 'sound-off'}`}
            title={soundEnabled ? "关闭音效" : "开启音效"}
          >
            {soundEnabled ? "🔊" : "🔇"}
          </button>
        </div>
      </header>
      
      <main>
        {!gameStarted ? (
          <div className="start-screen">
            <h2>选择难度级别</h2>
            <div className="difficulty-buttons">
              <button 
                onClick={() => setDifficultyLevel('easy')} 
                className={difficulty === 'easy' ? 'active' : ''}
              >
                简单
              </button>
              <button 
                onClick={() => setDifficultyLevel('medium')} 
                className={difficulty === 'medium' ? 'active' : ''}
              >
                中等
              </button>
              <button 
                onClick={() => setDifficultyLevel('hard')} 
                className={difficulty === 'hard' ? 'active' : ''}
              >
                困难
              </button>
            </div>
            
            <h2>选择题目数量</h2>
            <div className="question-count-buttons">
              <button onClick={() => startGame(20)}>20题</button>
              <button onClick={() => startGame(30)}>30题</button>
              <button onClick={() => startGame(50)}>50题</button>
            </div>
            
            <div className="game-instructions">
              <h3>游戏说明</h3>
              <p>1. 系统会显示汉字或词语</p>
              <p>2. 输入正确的拼音（无需音调）</p>
              <p>3. 点击 <span className="instruction-icon">🔊</span> 图标可以听到读音</p>
              <p>4. 输入完成后点击"提交"或按回车键</p>
              <p>5. 答错题目需要重复作答直到正确，每次错误会扣分</p>
              <p>6. 点击右上角 <span className="instruction-icon">{soundEnabled ? "🔊" : "🔇"}</span> 可以开启或关闭音效</p>
            </div>
          </div>
        ) : gameFinished ? (
          <div className="end-screen">
            <h2>恭喜完成！</h2>
            <div className="score-display">
              <div className="score-circle">
                <span className="score-number">{calculateScore()}</span>
                <span className="score-divider">/</span>
                <span className="score-total">{numQuestions}</span>
              </div>
              <p className="score-text">得分</p>
            </div>
            <div className="score-percentage">
              总题数: {numQuestions} | 错误尝试: {attempts}
            </div>
            <div className="score-percentage">
              正确率: {Math.round(((numQuestions - attempts) / numQuestions) * 100)}%
            </div>
            <button className="restart-button" onClick={restartGame}>再玩一次</button>
          </div>
        ) : (
          <div className="game-container">
            <ProgressBar current={currentIndex + 1} total={characters.length} />
            
            {characters.length > 0 && (
              <CharacterDisplay 
                character={characters[currentIndex].character} 
                audio={characters[currentIndex].audio}
              />
            )}
            
            <PinyinInput 
              value={userInput} 
              onChange={handleInputChange} 
              onSubmit={handleSubmit}
              disabled={result !== null}
            />
            
            <ResultFeedback 
              result={result} 
              correctPinyin={characters[currentIndex]?.pinyin}
            />
            
            {waitingForKeypress && result === 'wrong' && (
              <div className="continue-prompt">
                <p>答案错误，按任意键重试...</p>
                <button onClick={handleContinue} className="continue-button">重试</button>
              </div>
            )}
          </div>
        )}
      </main>
      
      <footer>
        <p>© {new Date().getFullYear()} 汉字认字游戏 - 提高汉语水平的好帮手</p>
      </footer>
    </div>
  );
}

export default App;
