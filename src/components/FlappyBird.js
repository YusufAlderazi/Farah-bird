import React, { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';

const GameContainer = styled.div`
  width: 400px;
  height: 600px;
  border: 2px solid #333;
  margin: 0 auto;
  position: relative;
  overflow: hidden;
  background: #87CEEB;
`;

const Pipe = styled.div`
  width: 60px;
  position: absolute;
  left: ${props => props.left}px;
  height: ${props => props.height}px;
  top: ${props => props.top}px;
  background: linear-gradient(180deg, #43e97b 0%, #38f9d7 100%);
  border-radius: 16px;
  box-shadow: 0 4px 16px rgba(34, 139, 34, 0.18);
  border: 2px solid #1b8a5a;
`;

const Score = styled.div`
  position: absolute;
  top: 20px;
  right: 20px;
  font-size: 24px;
  font-weight: bold;
  color: white;
  text-shadow: 2px 2px 4px rgba(0,0,0,0.5);
`;

const GameOver = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: rgba(30, 41, 59, 0.95);
  color: #fff;
  padding: 32px 40px;
  border-radius: 18px;
  text-align: center;
  box-shadow: 0 8px 32px rgba(0,0,0,0.25);
  min-width: 260px;
  display: ${props => props.$show ? 'block' : 'none'};
  z-index: 10;
`;

const GameOverTitle = styled.h2`
  font-size: 2.2rem;
  font-weight: 800;
  margin-bottom: 18px;
  color: #ff4c60;
  letter-spacing: 1px;
`;

const GameOverScore = styled.p`
  font-size: 1.4rem;
  margin-bottom: 24px;
  color: #fff;
`;

const PlayAgainButton = styled.button`
  background: linear-gradient(90deg, #ff4c60 0%, #ff9068 100%);
  color: #fff;
  border: none;
  border-radius: 8px;
  padding: 12px 32px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(0,0,0,0.12);
  transition: background 0.2s, transform 0.2s;
  &:hover {
    background: linear-gradient(90deg, #ff9068 0%, #ff4c60 100%);
    transform: translateY(-2px) scale(1.04);
  }
`;

const FlappyBird = () => {
  const [birdPosition, setBirdPosition] = useState(300);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [pipes, setPipes] = useState([]);
  const [gravity, setGravity] = useState(0);
  const [rotation, setRotation] = useState(0);

  const jump = useCallback(() => {
    if (!gameStarted) {
      setGameStarted(true);
      setGravity(0);
    }
    if (!gameOver) {
      setGravity(-8);
      setRotation(-20);
    }
  }, [gameStarted, gameOver]);

  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.code === 'Space') {
        if (gameOver) {
          resetGame();
        } else {
          jump();
        }
      }
    };
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [jump, gameOver]);

  useEffect(() => {
    if (!gameStarted || gameOver) return;

    const gameLoop = setInterval(() => {
      setBirdPosition(prev => {
        const newPosition = prev + gravity;
        if (newPosition > 560 || newPosition < 0) {
          setGameOver(true);
          return prev;
        }
        return newPosition;
      });

      setGravity(prev => prev + 0.5);
      setRotation(prev => Math.min(prev + 2, 90));

      setPipes(prev => {
        const newPipes = prev.map(pipe => ({
          ...pipe,
          left: pipe.left - 5 // normal speed
        })).filter(pipe => pipe.left > -60);

        if (prev.length === 0 || prev[prev.length - 1].left < 200) {
          const height = Math.random() * 200 + 100;
          return [...newPipes, {
            left: 400,
            height,
            top: 0,
            passed: false
          }, {
            left: 400,
            height: 600 - height - 150,
            top: height + 150,
            passed: false
          }];
        }
        return newPipes;
      });

      // Check collisions and scoring
      pipes.forEach(pipe => {
        if (pipe.left < 90 && pipe.left > 30 && !pipe.passed) {
          if (pipe.top === 0 && birdPosition < pipe.height) {
            setGameOver(true);
          }
          if (pipe.top > 0 && birdPosition > pipe.top) {
            setGameOver(true);
          }
          if (pipe.left < 50 && !pipe.passed) {
            setScore(prev => prev + 0.5);
            pipe.passed = true;
          }
        }
      });
    }, 20);

    return () => clearInterval(gameLoop);
  }, [gameStarted, gameOver, pipes, birdPosition, gravity]);

  const resetGame = () => {
    setBirdPosition(300);
    setGameStarted(false);
    setGameOver(false);
    setScore(0);
    setPipes([]);
    setGravity(0);
    setRotation(0);
  };

  return (
    <GameContainer tabIndex={0} onClick={jump}>
      <img
        src="/farah.png"
        alt="Flappy Bird"
        style={{
          width: 40,
          height: 40,
          position: 'absolute',
          left: 50,
          top: birdPosition,
          transform: `rotate(${rotation}deg)`,
          borderRadius: '50%'
        }}
      />
      {pipes.map((pipe, index) => (
        <Pipe
          key={index}
          left={pipe.left}
          height={pipe.height}
          top={pipe.top}
        />
      ))}
      <Score>{Math.floor(score)}</Score>
      <GameOver $show={gameOver}>
        <GameOverTitle>Game Over!</GameOverTitle>
        <GameOverScore>Score: {Math.floor(score)}</GameOverScore>
        <PlayAgainButton onClick={resetGame}>Play Again</PlayAgainButton>
      </GameOver>
    </GameContainer>
  );
};

export default FlappyBird; 