import React, { useEffect, useState } from 'react';
import '../styles/Confetti.css';

interface ConfettiPiece {
  id: number;
  x: number;
  y: number;
  color: string;
  size: number;
  rotation: number;
  speedX: number;
  speedY: number;
}

const Confetti: React.FC = () => {
  const [confetti, setConfetti] = useState<ConfettiPiece[]>([]);
  
  // 生成随机颜色
  const getRandomColor = (): string => {
    const colors = [
      '#f44336', '#e91e63', '#9c27b0', '#673ab7', '#3f51b5',
      '#2196f3', '#03a9f4', '#00bcd4', '#009688', '#4caf50',
      '#8bc34a', '#cddc39', '#ffeb3b', '#ffc107', '#ff9800'
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  };
  
  // 初始化彩带效果
  useEffect(() => {
    const pieces: ConfettiPiece[] = [];
    
    // 创建100个彩带碎片
    for (let i = 0; i < 100; i++) {
      pieces.push({
        id: i,
        x: Math.random() * 100, // 横向位置（百分比）
        y: Math.random() * 100 - 100, // 起始位置在屏幕上方
        color: getRandomColor(),
        size: Math.random() * 1 + 0.5, // 0.5 到 1.5 倍大小
        rotation: Math.random() * 360, // 初始旋转角度
        speedX: Math.random() * 6 - 3, // 横向速度
        speedY: Math.random() * 5 + 10 // 下落速度
      });
    }
    
    setConfetti(pieces);
    
    // 动画帧
    let animationFrameId: number;
    let lastTime = Date.now();
    
    const animate = () => {
      const currentTime = Date.now();
      const deltaTime = (currentTime - lastTime) / 16; // 基于16ms标准帧率调整
      
      setConfetti(prev => 
        prev.map(piece => {
          // 更新位置
          const newX = piece.x + piece.speedX * deltaTime;
          const newY = piece.y + piece.speedY * deltaTime;
          
          // 当彩带飞出屏幕底部时，重置到顶部
          const y = newY > 120 ? -10 : newY;
          
          // 允许横向环绕
          const x = newX < 0 ? 100 + newX : newX > 100 ? newX - 100 : newX;
          
          return {
            ...piece,
            x,
            y,
            rotation: piece.rotation + deltaTime * 2 // 旋转效果
          };
        })
      );
      
      lastTime = currentTime;
      animationFrameId = requestAnimationFrame(animate);
    };
    
    animationFrameId = requestAnimationFrame(animate);
    
    // 清理函数
    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, []);
  
  return (
    <div className="confetti-container">
      {confetti.map(piece => (
        <div
          key={piece.id}
          className="confetti-piece"
          style={{
            left: `${piece.x}%`,
            top: `${piece.y}%`,
            backgroundColor: piece.color,
            width: `${8 * piece.size}px`,
            height: `${12 * piece.size}px`,
            transform: `rotate(${piece.rotation}deg)`
          }}
        />
      ))}
    </div>
  );
};

export default Confetti; 