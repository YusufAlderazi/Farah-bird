import React, { useState, useEffect, useCallback, useRef } from 'react';
import styled from 'styled-components';
import { supabase } from '../supabaseClient';

const CHARACTERS = [
  { name: 'Farah', file: 'farah.png' },
  { name: 'Laiki', file: 'laiki.png' },
  { name: 'Fluffy', file: 'fluffy.png' },
];

const GameContainer = styled.div`
  width: 400px;
  height: 600px;
  border: 2px solid #333;
  margin: 0 auto;
  position: relative;
  overflow: hidden;
  background: #87CEEB;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
`;

const CharacterSelectContainer = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: repeating-linear-gradient(135deg, #ffe0f0 0 40px, #ffd6ec 40px 80px), url('data:image/svg+xml;utf8,<svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M20 36s-9.6-7.68-13.6-12.16C2.4 20.16 0 16.8 0 13.2 0 7.36 4.8 2.56 10.64 2.56c2.96 0 5.76 1.36 7.36 3.52C19.6 3.92 22.4 2.56 25.36 2.56 31.2 2.56 36 7.36 36 13.2c0 3.6-2.4 6.96-6.4 10.64C29.6 28.32 20 36 20 36z" fill="%23ff4c60"/></svg>');
  background-size: 80px 80px, 40px 40px;
  background-repeat: repeat;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 20;
  padding: 0 2vw;
  box-sizing: border-box;
`;

const CharacterTitle = styled.h2`
  color: #ff4c60;
  font-size: clamp(1.2rem, 3.5vw, 2.2rem);
  font-weight: 900;
  margin-bottom: 24px;
  letter-spacing: 1px;
  font-family: 'Quicksand', 'Poppins', Arial, sans-serif;
  text-align: center;
  text-shadow: 0 2px 12px #fff6, 0 1px 0 #fff;
  width: 100%;
`;

const CharacterGrid = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  justify-content: center;
  max-width: 500px;
  width: 100%;
`;

const CharacterOption = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  cursor: pointer;
  border: none;
  border-radius: 16px;
  padding: 10px 12px 6px 12px;
  background: #fff6fa;
  box-shadow: 0 2px 12px 0 rgba(255, 76, 96, 0.10);
  transition: transform 0.18s, box-shadow 0.18s, background 0.18s;
  min-width: 80px;
  margin-bottom: 8px;
  &:hover {
    transform: scale(1.06) translateY(-2px);
    box-shadow: 0 4px 16px 0 rgba(255, 76, 96, 0.18);
    background: #ffe0e6;
  }
`;

const CharacterImg = styled.img`
  width: 48px;
  height: 48px;
  border-radius: 50%;
  margin-bottom: 8px;
  background: #fff;
  border: 2px solid #e0e7ff;
  box-shadow: 0 1px 4px 0 rgba(60, 60, 120, 0.10);
  transition: border 0.18s, box-shadow 0.18s;
  ${CharacterOption}:hover & {
    border: 2px solid #ff4c60;
    box-shadow: 0 2px 8px 0 rgba(255, 76, 96, 0.18);
  }
`;

const CharacterLabel = styled.div`
  color: #ff4c60;
  font-weight: 700;
  font-size: 1rem;
  font-family: 'Quicksand', 'Poppins', Arial, sans-serif;
  letter-spacing: 0.5px;
  text-shadow: 0 1px 0 #fff, 0 2px 8px #fff6;
  margin-bottom: 2px;
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

const Medal = styled.span`
  font-size: 1.5rem;
  margin-right: 8px;
`;

const LeaderboardContainer = styled.div`
  background: #fff6fa;
  border-radius: 18px;
  box-shadow: 0 2px 12px 0 rgba(255, 76, 96, 0.10);
  padding: 18px 24px;
  margin: 24px auto 0 auto;
  max-width: 340px;
  width: 100%;
  text-align: center;
  z-index: 10;
  pointer-events: auto;
`;

const LeaderboardTitle = styled.div`
  color: #ff4c60;
  font-weight: 800;
  font-size: 1.2rem;
  margin-bottom: 10px;
`;

const LeaderboardList = styled.ol`
  list-style: none;
  padding: 0;
  margin: 0;
`;

const LeaderboardEntry = styled.li`
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 1.1rem;
  margin-bottom: 8px;
  background: #fff;
  border-radius: 10px;
  padding: 6px 12px;
  box-shadow: 0 1px 4px 0 rgba(255, 76, 96, 0.06);
`;

const NameInput = styled.input`
  padding: 8px 12px;
  border-radius: 8px;
  border: 1px solid #ff4c60;
  font-size: 1rem;
  margin-bottom: 8px;
  width: 80%;
`;

const SubmitButton = styled.button`
  background: linear-gradient(90deg, #ff4c60 0%, #ff9068 100%);
  color: #fff;
  border: none;
  border-radius: 8px;
  padding: 8px 20px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  margin-left: 8px;
  z-index: 10;
  pointer-events: auto;
`;

const LeaderboardButton = styled.button`
  background: #fff0f6;
  color: #ff4c60;
  font-weight: 800;
  font-size: 1.2rem;
  border: none;
  border-radius: 14px;
  padding: 16px 32px;
  margin: 24px auto 0 auto;
  box-shadow: 0 2px 12px 0 rgba(255, 76, 96, 0.10);
  display: block;
  cursor: pointer;
  transition: background 0.18s, color 0.18s, transform 0.18s;
  &:hover {
    background: #ff4c60;
    color: #fff;
    transform: scale(1.04);
  }
`;

const LeaderboardModal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(30, 41, 59, 0.75);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const ModalContent = styled.div`
  background: #fff6fa;
  border-radius: 18px;
  box-shadow: 0 2px 12px 0 rgba(255, 76, 96, 0.18);
  padding: 32px 32px 24px 32px;
  min-width: 320px;
  max-width: 90vw;
  text-align: center;
  position: relative;
`;

const CloseModalButton = styled.button`
  position: absolute;
  top: 12px;
  right: 16px;
  background: none;
  border: none;
  font-size: 1.6rem;
  color: #ff4c60;
  cursor: pointer;
  font-weight: bold;
`;

const FlappyBird = () => {
  const [birdPosition, setBirdPosition] = useState(300);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [pipes, setPipes] = useState([]);
  const [gravity, setGravity] = useState(0);
  const [rotation, setRotation] = useState(0);
  const [selectedCharacter, setSelectedCharacter] = useState(null);

  // Leaderboard state
  const [leaderboard, setLeaderboard] = useState([]);
  const [showNameInput, setShowNameInput] = useState(false);
  const [playerName, setPlayerName] = useState('');
  const [pendingScore, setPendingScore] = useState(null);
  const nameInputRef = useRef();
  const [showLeaderboardModal, setShowLeaderboardModal] = useState(false);

  // Fetch leaderboard
  const fetchLeaderboard = useCallback(async () => {
    const { data } = await supabase
      .from('leaderboard')
      .select('*')
      .order('score', { ascending: false })
      .limit(3);
    setLeaderboard(data || []);
  }, []);

  // Check if score qualifies for leaderboard
  useEffect(() => {
    if (gameOver) {
      fetchLeaderboard().then(() => {
        if (
          score > 0 &&
          (leaderboard.length < 3 || score > leaderboard[leaderboard.length - 1]?.score)
        ) {
          setShowNameInput(true);
          setPendingScore(score);
          setTimeout(() => nameInputRef.current && nameInputRef.current.focus(), 100);
        }
      });
    }
    // eslint-disable-next-line
  }, [gameOver]);

  // Always fetch leaderboard on mount
  useEffect(() => {
    fetchLeaderboard();
  }, [fetchLeaderboard]);

  // Submit score
  const submitScore = async () => {
    if (!playerName.trim()) return;
    await supabase.from('leaderboard').insert([{ name: playerName.trim(), score: pendingScore }]);
    setShowNameInput(false);
    setPlayerName('');
    setPendingScore(null);
    fetchLeaderboard();
  };

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
      {!selectedCharacter && (
        <CharacterSelectContainer>
          <CharacterTitle>Choose Your Character</CharacterTitle>
          <CharacterGrid>
            {CHARACTERS.map(char => (
              <CharacterOption key={char.file} onClick={() => setSelectedCharacter(char.file)}>
                <CharacterImg src={`/${char.file}`} alt={char.name} />
                <CharacterLabel>{char.name}</CharacterLabel>
              </CharacterOption>
            ))}
          </CharacterGrid>
          <LeaderboardButton onClick={() => setShowLeaderboardModal(true)}>
            <span role="img" aria-label="leaderboard">🏆</span> Leaderboard
          </LeaderboardButton>
        </CharacterSelectContainer>
      )}
      {selectedCharacter && (
        <img
          src={`/${selectedCharacter}`}
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
      )}
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
        {showNameInput && (
          <div style={{ margin: '16px 0' }}>
            <NameInput
              ref={nameInputRef}
              placeholder="Enter your name"
              value={playerName}
              maxLength={16}
              onChange={e => setPlayerName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && submitScore()}
            />
            <SubmitButton onClick={submitScore}>Submit</SubmitButton>
          </div>
        )}
        <PlayAgainButton onClick={resetGame}>Play Again</PlayAgainButton>
        <PlayAgainButton style={{marginTop: 12, background: '#222', color: '#fff'}} onClick={() => { setSelectedCharacter(null); resetGame(); }}>Choose Character</PlayAgainButton>
        <LeaderboardButton onClick={() => setShowLeaderboardModal(true)}>
          <span role="img" aria-label="leaderboard">🏆</span> Leaderboard
        </LeaderboardButton>
      </GameOver>
      {/* Show leaderboard button on main screen too */}
      {!gameStarted && leaderboard.length > 0 && (
        <LeaderboardButton onClick={() => setShowLeaderboardModal(true)}>
          <span role="img" aria-label="leaderboard">🏆</span> Leaderboard
        </LeaderboardButton>
      )}
      {/* Leaderboard Modal */}
      {showLeaderboardModal && (
        <LeaderboardModal>
          <ModalContent>
            <CloseModalButton onClick={() => setShowLeaderboardModal(false)}>&times;</CloseModalButton>
            <LeaderboardTitle>🏆 Leaderboard</LeaderboardTitle>
            <LeaderboardList>
              {leaderboard.map((entry, idx) => (
                <LeaderboardEntry key={entry.id}>
                  <span>
                    <Medal>{idx === 0 ? '🥇' : idx === 1 ? '🥈' : '🥉'}</Medal>
                    {entry.name}
                  </span>
                  <span>{entry.score}</span>
                </LeaderboardEntry>
              ))}
            </LeaderboardList>
          </ModalContent>
        </LeaderboardModal>
      )}
    </GameContainer>
  );
};

export default FlappyBird; 