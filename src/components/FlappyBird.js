import React, { useState, useEffect, useCallback, useRef } from 'react';
import styled from 'styled-components';
import { supabase } from '../supabaseClient';
import { FaLock } from 'react-icons/fa';

const CHARACTERS = [
  { name: 'Farah', file: 'farah.png' },
  { name: 'Laiki', file: 'laiki.png' },
  { name: 'Fluffy', file: 'fluffy.png' },
];

const MAPS = [
  { name: 'Default', value: 'default' },
  { name: 'Magma', value: 'magma' },
  { name: 'Dubai Day', value: 'dubai' },
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
  font-size: 1.15rem;
  margin-bottom: 12px;
  background: #fff;
  border-radius: 12px;
  padding: 10px 18px;
  box-shadow: 0 2px 8px 0 rgba(255, 76, 96, 0.08);
  border: 2px solid #ffe0f0;
  font-weight: 700;
  position: relative;
  transition: box-shadow 0.18s, border 0.18s;
  &:first-child {
    border: 2px solid #ffb347;
    box-shadow: 0 4px 16px 0 #ffb34744;
  }
`;

const LeaderboardName = styled.span`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const LeaderboardScore = styled.span`
  margin-left: 18px;
  font-weight: 800;
  color: #222;
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
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: #fff6fa;
  border-radius: 32px;
  box-shadow: 0 8px 32px 0 rgba(255, 76, 96, 0.18);
  padding: 40px 36px 28px 36px;
  min-width: 320px;
  max-width: 90vw;
  text-align: center;
  z-index: 1000;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const ModalContent = styled.div`
  background: #fff6fa;
  border-radius: 32px;
  box-shadow: 0 8px 32px 0 rgba(255, 76, 96, 0.18);
  padding: 48px 40px 32px 40px;
  min-width: 320px;
  max-width: 90vw;
  text-align: center;
  position: relative;
  width: 380px;
  display: flex;
  flex-direction: column;
  align-items: center;
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

const MapSelectContainer = styled.div`
  margin-top: 24px;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const MapOptions = styled.div`
  display: flex;
  gap: 24px;
  margin-top: 18px;
  justify-content: center;
  width: 100%;
`;

const MapOption = styled.button`
  background: none;
  border: 2px solid #ff4c60;
  border-radius: 18px;
  min-width: 110px;
  min-height: 140px;
  padding: 0 0 10px 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  box-sizing: border-box;
  box-shadow: 0 2px 12px 0 rgba(255, 76, 96, 0.08);
  transition: box-shadow 0.18s, border 0.18s, transform 0.18s;
  margin: 0;
  cursor: ${({ disabled }) => (disabled ? 'not-allowed' : 'pointer')};
  opacity: ${({ disabled }) => (disabled ? 0.5 : 1)};
  &:hover {
    box-shadow: 0 4px 24px 0 #ff4c60aa;
    border: 2.5px solid #ff4c60;
    transform: ${({ disabled }) => (disabled ? 'none' : 'scale(1.04)')};
  }
`;

const MapPreview = styled.div`
  width: 70px;
  height: 48px;
  border-radius: 12px;
  margin: 16px 0 10px 0;
  background: ${({ map }) =>
    map === 'magma'
      ? 'linear-gradient(0deg, #ffb347 0%, #ff4c00 100%)'
      : map === 'dubai'
      ? 'linear-gradient(180deg, #aeefff 0%, #e0f7fa 100%)'
      : 'linear-gradient(180deg, #43e97b 0%, #38f9d7 100%)'};
  border: ${({ map }) =>
    map === 'magma' ? '2px solid #ff4c00' : map === 'dubai' ? '2px solid #1e88e5' : '2px solid #1b8a5a'};
  box-shadow: 0 2px 8px 0 rgba(60, 60, 120, 0.10);
  position: relative;
  overflow: hidden;
  display: flex;
  align-items: flex-end;
  justify-content: center;
`;

const MagmaPreviewBubble = styled.div`
  position: absolute;
  bottom: ${({ bottom }) => bottom}%;
  left: ${({ left }) => left}%;
  width: ${({ size }) => size}px;
  height: ${({ size }) => size}px;
  background: radial-gradient(circle at 60% 40%, #fff7, #ffb347 60%, #ff4c00 100%);
  border-radius: 50%;
  opacity: 0.7;
`;

const CreditsDisplayInner = styled.div`
  position: absolute;
  top: 0;
  right: 0;
  background: #fff0f6;
  color: #ff4c60;
  font-weight: 800;
  font-size: 1.1rem;
  border-radius: 16px;
  box-shadow: 0 2px 12px 0 rgba(255, 76, 96, 0.10);
  padding: 8px 18px 8px 12px;
  z-index: 21;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 10px;
  transition: background 0.18s, color 0.18s, transform 0.18s;
  &:hover {
    background: #ff4c60;
    color: #fff;
    transform: scale(1.04);
  }
`;

const DubaiBackground = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 0;
  background: linear-gradient(180deg, #aeefff 0%, #e0f7fa 100%);
  overflow: hidden;
`;

const BurjKhalifaSVG = ({ width = 90, height = 320, style = {} }) => (
  <svg
    viewBox="0 0 90 320"
    width={width}
    height={height}
    style={{ ...style, display: 'block' }}
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    {/* Main tower */}
    <rect x="40" y="0" width="10" height="40" rx="5" fill="#b0c4de" />
    <rect x="35" y="40" width="20" height="40" rx="7" fill="#b0c4de" />
    <rect x="30" y="80" width="30" height="50" rx="10" fill="#b0c4de" />
    <rect x="25" y="130" width="40" height="70" rx="13" fill="#b0c4de" />
    <rect x="20" y="200" width="50" height="90" rx="15" fill="#b0c4de" />
    <rect x="10" y="290" width="70" height="25" rx="12" fill="#b0c4de" />
    {/* Glass highlights */}
    <rect x="45" y="0" width="4" height="315" rx="2" fill="#e0e7ef" opacity="0.7" />
    <rect x="38" y="50" width="14" height="10" rx="3" fill="#e0e7ef" opacity="0.8" />
    <rect x="33" y="100" width="24" height="12" rx="5" fill="#e0e7ef" opacity="0.8" />
    <rect x="28" y="150" width="34" height="16" rx="7" fill="#e0e7ef" opacity="0.8" />
    <rect x="23" y="220" width="44" height="20" rx="9" fill="#e0e7ef" opacity="0.8" />
    {/* Antenna */}
    <rect x="43" y="-20" width="4" height="20" rx="2" fill="#e0e7ef" />
    {/* More details */}
    <rect x="50" y="60" width="6" height="30" rx="2" fill="#b0c4de" opacity="0.5" />
    <rect x="34" y="60" width="6" height="30" rx="2" fill="#b0c4de" opacity="0.5" />
    <rect x="40" y="110" width="10" height="30" rx="3" fill="#e0e7ef" opacity="0.5" />
    {/* Windows */}
    <rect x="48" y="200" width="2" height="60" rx="1" fill="#e0e7ef" opacity="0.4" />
    <rect x="40" y="200" width="2" height="60" rx="1" fill="#e0e7ef" opacity="0.4" />
    <rect x="32" y="200" width="2" height="60" rx="1" fill="#e0e7ef" opacity="0.4" />
  </svg>
);

const DubaiGround = styled.div`
  position: absolute;
  left: 0;
  bottom: 0;
  width: 100%;
  height: 48px;
  background: linear-gradient(0deg, #ffe0b2 0%, #fffde4 100%);
  z-index: 5;
  border-top-left-radius: 18px;
  border-top-right-radius: 18px;
`;

const LavaBubble = styled.div`
  position: absolute;
  bottom: ${({ bottom }) => bottom}%;
  left: ${({ left }) => left}%;
  width: ${({ size }) => size}px;
  height: ${({ size }) => size}px;
  background: radial-gradient(circle at 60% 40%, #fff7, #ffb347 60%, #ff4c00 100%);
  border-radius: 50%;
  opacity: 0.85;
  animation: lava-bubble-pop 2s infinite cubic-bezier(0.4,0,0.2,1);
  animation-delay: ${({ delay }) => delay}s;
  z-index: 6;
  box-shadow: 0 0 16px 4px #ffb34799, 0 0 32px 8px #ff4c0099;

  @keyframes lava-bubble-pop {
    0% { transform: scale(0.7) translateY(0); opacity: 0.7; }
    60% { transform: scale(1.1) translateY(-18px); opacity: 1; }
    100% { transform: scale(0.7) translateY(0); opacity: 0.7; }
  }
`;

const LavaExplosion = styled.div`
  position: absolute;
  bottom: 36px;
  left: ${({ left }) => left}%;
  width: 32px;
  height: 32px;
  pointer-events: none;
  z-index: 7;
  opacity: 0.7;
  background: radial-gradient(circle, #fff7 0%, #ffb347 40%, #ff4c00 80%, transparent 100%);
  border-radius: 50%;
  animation: lava-explode 1.2s infinite cubic-bezier(0.4,0,0.2,1);
  animation-delay: ${({ delay }) => delay}s;

  @keyframes lava-explode {
    0% { transform: scale(0.5); opacity: 0.7; }
    40% { transform: scale(1.2); opacity: 1; }
    100% { transform: scale(0.5); opacity: 0.7; }
  }
`;

const LavaFloor = styled.div`
  position: absolute;
  left: 0;
  bottom: 0;
  width: 100%;
  height: 48px;
  background: linear-gradient(0deg, #ff4c00 0%, #ffb347 100%);
  box-shadow: 0 -4px 24px 0 #ff4c00cc;
  z-index: 5;
  border-top-left-radius: 18px;
  border-top-right-radius: 18px;
  display: ${({ show }) => (show ? 'block' : 'none')};
  overflow: visible;
`;

const StoreButton = styled.button`
  background: #fff0f6;
  color: #ff4c60;
  font-weight: 800;
  font-size: 1.1rem;
  border: none;
  border-radius: 14px;
  padding: 10px 24px;
  margin: 18px auto 0 auto;
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

const StoreModal = styled(LeaderboardModal)`
  z-index: 2000;
`;

const StoreTitle = styled.div`
  color: #ff4c60;
  font-weight: 900;
  font-size: 2rem;
  margin-bottom: 18px;
  letter-spacing: 1px;
  font-family: 'Quicksand', 'Poppins', Arial, sans-serif;
  display: flex;
  align-items: center;
  gap: 10px;
`;

const StoreCredits = styled.div`
  color: #ff4c60;
  font-size: 1.2rem;
  margin-bottom: 24px;
  font-weight: 700;
  background: #fff0f6;
  border-radius: 12px;
  padding: 8px 18px;
  display: inline-block;
  box-shadow: 0 2px 8px 0 rgba(255, 76, 96, 0.08);
`;

const UnlockButton = styled.button`
  background: ${({ disabled }) => (disabled ? '#ffe0e6' : 'linear-gradient(90deg, #ff4c60 0%, #ff9068 100%)')};
  color: ${({ disabled }) => (disabled ? '#aaa' : '#fff')};
  border: none;
  border-radius: 10px;
  padding: 12px 32px;
  font-size: 1.1rem;
  font-weight: 700;
  cursor: ${({ disabled }) => (disabled ? 'not-allowed' : 'pointer')};
  margin-top: 8px;
  box-shadow: 0 2px 8px rgba(255, 76, 96, 0.10);
  transition: background 0.2s, color 0.2s, transform 0.18s;
  &:hover {
    background: ${({ disabled }) => (disabled ? '#ffe0e6' : 'linear-gradient(90deg, #ff9068 0%, #ff4c60 100%)')};
    color: #fff;
    transform: ${({ disabled }) => (disabled ? 'none' : 'scale(1.04)')};
  }
`;

const UnlockedBadge = styled.span`
  background: #43e97b22;
  color: #43e97b;
  font-weight: 800;
  border-radius: 8px;
  padding: 8px 18px;
  font-size: 1.1rem;
  margin-left: 8px;
  display: inline-block;
`;

const StoreDivider = styled.div`
  width: 100%;
  height: 1.5px;
  background: linear-gradient(90deg, #ffd6ec 0%, #ff4c60 100%);
  margin: 24px 0 18px 0;
  border-radius: 2px;
`;

const CreditsDisplay = styled.div`
  position: fixed;
  top: 24px;
  right: 32px;
  background: #fff0f6;
  color: #ff4c60;
  font-weight: 800;
  font-size: 1.1rem;
  border-radius: 16px;
  box-shadow: 0 2px 12px 0 rgba(255, 76, 96, 0.10);
  padding: 10px 28px 10px 18px;
  z-index: 3000;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 10px;
  transition: background 0.18s, color 0.18s, transform 0.18s;
  &:hover {
    background: #ff4c60;
    color: #fff;
    transform: scale(1.04);
  }
`;

const StoreOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: linear-gradient(135deg, #ffe0f0 0 40px, #ffd6ec 40px 80px);
  z-index: 2500;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const StoreContent = styled.div`
  background: #fff6fa;
  border-radius: 32px;
  box-shadow: 0 8px 32px 0 rgba(255, 76, 96, 0.18);
  padding: 56px 44px 36px 44px;
  min-width: 340px;
  max-width: 96vw;
  text-align: center;
  position: relative;
  width: 420px;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const DubaiSkylineSVG = ({ style = {} }) => (
  <svg
    viewBox="0 0 400 120"
    width="400"
    height="120"
    style={{ ...style, display: 'block' }}
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    {/* Simple buildings */}
    <rect x="10" y="60" width="30" height="60" rx="4" fill="#b0c4de" opacity="0.25" />
    <rect x="50" y="80" width="18" height="40" rx="3" fill="#b0c4de" opacity="0.22" />
    <rect x="75" y="70" width="22" height="50" rx="4" fill="#b0c4de" opacity="0.22" />
    <rect x="110" y="90" width="14" height="30" rx="2" fill="#b0c4de" opacity="0.18" />
    <rect x="130" y="60" width="28" height="60" rx="5" fill="#b0c4de" opacity="0.22" />
    <rect x="170" y="80" width="18" height="40" rx="3" fill="#b0c4de" opacity="0.20" />
    <rect x="200" y="100" width="12" height="20" rx="2" fill="#b0c4de" opacity="0.18" />
    <rect x="220" y="85" width="16" height="35" rx="3" fill="#b0c4de" opacity="0.20" />
    <rect x="245" y="70" width="22" height="50" rx="4" fill="#b0c4de" opacity="0.22" />
    <rect x="280" y="90" width="14" height="30" rx="2" fill="#b0c4de" opacity="0.18" />
    <rect x="300" y="60" width="28" height="60" rx="5" fill="#b0c4de" opacity="0.22" />
    <rect x="340" y="80" width="18" height="40" rx="3" fill="#b0c4de" opacity="0.20" />
    <rect x="370" y="100" width="12" height="20" rx="2" fill="#b0c4de" opacity="0.18" />
    {/* Domes and spires */}
    <ellipse cx="25" cy="60" rx="8" ry="4" fill="#e0e7ef" opacity="0.18" />
    <ellipse cx="144" cy="60" rx="7" ry="3" fill="#e0e7ef" opacity="0.15" />
    <ellipse cx="314" cy="60" rx="7" ry="3" fill="#e0e7ef" opacity="0.15" />
    <rect x="85" y="55" width="4" height="15" rx="2" fill="#e0e7ef" opacity="0.18" />
    <rect x="255" y="55" width="4" height="15" rx="2" fill="#e0e7ef" opacity="0.18" />
  </svg>
);

const FlappyBird = () => {
  // Set credits to 200 on mount for localhost testing
  useEffect(() => {
    localStorage.setItem('credits', 200);
  }, []);
  const [birdPosition, setBirdPosition] = useState(300);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [pipes, setPipes] = useState([]);
  const [gravity, setGravity] = useState(0);
  const [rotation, setRotation] = useState(0);
  const [selectedCharacter, setSelectedCharacter] = useState(null);
  const [map, setMap] = useState(null);

  // Leaderboard state
  const [leaderboard, setLeaderboard] = useState([]);
  const [showNameInput, setShowNameInput] = useState(false);
  const [playerName, setPlayerName] = useState('');
  const [pendingScore, setPendingScore] = useState(null);
  const nameInputRef = useRef();
  const [showLeaderboardModal, setShowLeaderboardModal] = useState(false);

  // Store/credits state
  const [credits, setCredits] = useState(() => Number(localStorage.getItem('credits') || 0));
  const [unlockedMaps, setUnlockedMaps] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('unlockedMaps')) || ['default'];
    } catch {
      return ['default'];
    }
  });
  const [showStore, setShowStore] = useState(false);

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

  // Helper to render lava bubbles and explosions
  const renderLavaEffects = () => (
    <>
      {/* Bubbles */}
      <LavaBubble size={18} left={12} bottom={18} delay={0.1} />
      <LavaBubble size={24} left={32} bottom={12} delay={0.5} />
      <LavaBubble size={16} left={52} bottom={22} delay={0.3} />
      <LavaBubble size={22} left={68} bottom={10} delay={0.7} />
      <LavaBubble size={14} left={82} bottom={16} delay={0.2} />
      {/* Explosions */}
      <LavaExplosion left={20} delay={0.2} />
      <LavaExplosion left={60} delay={0.6} />
      <LavaExplosion left={80} delay={0.9} />
    </>
  );

  // Award credits after each game
  useEffect(() => {
    if (gameOver && score > 0) {
      setCredits(prev => {
        const newCredits = prev + Math.floor(score);
        localStorage.setItem('credits', newCredits);
        return newCredits;
      });
    }
  }, [gameOver]);

  // Sync unlockedMaps to localStorage
  useEffect(() => {
    localStorage.setItem('unlockedMaps', JSON.stringify(unlockedMaps));
  }, [unlockedMaps]);

  // Store unlock logic
  const unlockMagma = () => {
    if (credits >= 20 && !unlockedMaps.includes('magma')) {
      setCredits(c => {
        const newCredits = c - 20;
        localStorage.setItem('credits', newCredits);
        return newCredits;
      });
      setUnlockedMaps(maps => [...maps, 'magma']);
    }
  };

  const unlockDubai = () => {
    if (credits >= 15 && !unlockedMaps.includes('dubai')) {
      setCredits(c => {
        const newCredits = c - 15;
        localStorage.setItem('credits', newCredits);
        return newCredits;
      });
      setUnlockedMaps(maps => [...maps, 'dubai']);
    }
  };

  return (
    <>
      {/* Only show global credits display if not on character select */}
      {selectedCharacter && map && (
        <CreditsDisplay onClick={() => setShowStore(true)}>
          <span role="img" aria-label="coin">💰</span> {credits} Credits
        </CreditsDisplay>
      )}
      {/* Store Overlay */}
      {showStore && (
        <StoreOverlay>
          <StoreContent>
            <CloseModalButton onClick={() => setShowStore(false)}>&times;</CloseModalButton>
            <StoreTitle>🛒 Game Store</StoreTitle>
            <StoreCredits>Credits: <b>{credits}</b></StoreCredits>
            <div style={{marginBottom: 16}}>
              <div style={{fontWeight: 700, color: '#ff4c60', marginBottom: 6}}>Unlock Maps</div>
              <div style={{display: 'flex', alignItems: 'center', gap: 18, marginBottom: 18}}>
                <div>
                  <MapPreview map="magma">
                    <MagmaPreviewBubble size={12} left={18} bottom={10} />
                    <MagmaPreviewBubble size={8} left={60} bottom={18} />
                    <MagmaPreviewBubble size={10} left={40} bottom={8} />
                    <MagmaPreviewBubble size={7} left={80} bottom={12} />
                  </MapPreview>
                  <div style={{fontSize: '0.95rem', color: '#b22222', fontWeight: 700}}>Magma Map</div>
                </div>
                {unlockedMaps.includes('magma') ? (
                  <UnlockedBadge>Unlocked</UnlockedBadge>
                ) : (
                  <UnlockButton disabled={credits < 20} onClick={unlockMagma}>
                    <FaLock style={{marginRight: 8, verticalAlign: 'middle'}} />
                    Unlock (20 credits)
                  </UnlockButton>
                )}
              </div>
              <div style={{display: 'flex', alignItems: 'center', gap: 18}}>
                <div>
                  <MapPreview map="dubai">
                    <BurjKhalifaSVG width={18} height={36} style={{position:'absolute',left:'50%',bottom:0,transform:'translateX(-50%)'}} />
                  </MapPreview>
                  <div style={{fontSize: '0.95rem', color: '#1e88e5', fontWeight: 700}}>Dubai Day</div>
                </div>
                {unlockedMaps.includes('dubai') ? (
                  <UnlockedBadge>Unlocked</UnlockedBadge>
                ) : (
                  <UnlockButton disabled={credits < 15} onClick={() => unlockDubai()}>
                    <FaLock style={{marginRight: 8, verticalAlign: 'middle'}} />
                    Unlock (15 credits)
                  </UnlockButton>
                )}
              </div>
            </div>
          </StoreContent>
        </StoreOverlay>
      )}
      <GameContainer tabIndex={0} onClick={jump}>
        {!selectedCharacter && (
          <CharacterSelectContainer>
            <CreditsDisplayInner onClick={() => setShowStore(true)}>
              <span role="img" aria-label="coin">💰</span> {credits} Credits
            </CreditsDisplayInner>
            <CharacterTitle>Choose Your Character</CharacterTitle>
            <CharacterGrid>
              {CHARACTERS.map(char => (
                <CharacterOption key={char.file} onClick={() => setSelectedCharacter(char.file)}>
                  <CharacterImg src={`/${char.file}`} alt={char.name} />
                  <CharacterLabel>{char.name}</CharacterLabel>
                </CharacterOption>
              ))}
            </CharacterGrid>
            <StoreButton onClick={() => setShowStore(true)}>🛒 Store</StoreButton>
            <LeaderboardButton onClick={() => setShowLeaderboardModal(true)}>
              <span role="img" aria-label="leaderboard">🏆</span> Leaderboard
            </LeaderboardButton>
          </CharacterSelectContainer>
        )}
        {/* Map selection after character selection */}
        {selectedCharacter && !map && (
          <CharacterSelectContainer>
            <CharacterTitle>Choose Map</CharacterTitle>
            <MapSelectContainer>
              <MapOptions>
                {MAPS.map(m => (
                  <MapOption
                    key={m.value}
                    selected={map === m.value}
                    onClick={() => unlockedMaps.includes(m.value) && setMap(m.value)}
                    disabled={!unlockedMaps.includes(m.value)}
                  >
                    <MapPreview map={m.value}>
                      {m.value === 'magma' && (
                        <>
                          <MagmaPreviewBubble size={10} left={18} bottom={10} />
                          <MagmaPreviewBubble size={7} left={60} bottom={18} />
                        </>
                      )}
                      {m.value === 'dubai' && (
                        <BurjKhalifaSVG width={18} height={36} style={{position:'absolute',left:'50%',bottom:0,transform:'translateX(-50%)'}} />
                      )}
                    </MapPreview>
                    <span style={{fontWeight: 700, fontSize: '1.1rem', color: '#ff4c60', marginBottom: 2}}>{m.name}</span>
                    {!unlockedMaps.includes(m.value) && <FaLock style={{marginTop: 2, color: '#ff4c60'}} />}
                  </MapOption>
                ))}
              </MapOptions>
            </MapSelectContainer>
          </CharacterSelectContainer>
        )}
        {/* Game only starts after both character and map are selected */}
        {selectedCharacter && map && (
          <>
            {map === 'dubai' && (
              <DubaiBackground>
                <DubaiSkylineSVG style={{
                  position: 'absolute',
                  left: 0,
                  bottom: 0,
                  width: '100%',
                  height: '110px',
                  opacity: 0.22,
                  zIndex: 0,
                  pointerEvents: 'none',
                }} />
                <BurjKhalifaSVG width={90} height={320} style={{
                  position: 'absolute',
                  left: '50%',
                  bottom: 0,
                  transform: 'translateX(-50%)',
                  opacity: 0.18,
                  zIndex: 0,
                  pointerEvents: 'none',
                }} />
              </DubaiBackground>
            )}
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
                borderRadius: '50%',
                zIndex: 10
              }}
            />
            {pipes.map((pipe, index) => (
              <Pipe
                key={index}
                left={pipe.left}
                height={pipe.height}
                top={pipe.top}
                style={
                  map === 'magma'
                    ? {
                        background: 'linear-gradient(180deg, #ff4c00 0%, #ffb347 100%)',
                        border: '2px solid #b22222',
                        boxShadow: '0 4px 24px 0 #ff4c00cc',
                        filter: 'brightness(1.1) drop-shadow(0 0 8px #ff4c00cc)'
                      }
                    : map === 'dubai'
                    ? {
                        background: 'linear-gradient(180deg, #e0f7fa 0%, #aeefff 100%)',
                        border: '2px solid #b0c4de',
                        boxShadow: '0 4px 16px 0 #b0c4de44',
                        filter: 'brightness(1.05)'
                      }
                    : {}
                }
              />
            ))}
            {map === 'magma' && (
              <LavaFloor show>
                {renderLavaEffects()}
              </LavaFloor>
            )}
            {map === 'dubai' && <DubaiGround />}
            <Score>{Math.floor(score)}</Score>
          </>
        )}
        <GameOver $show={gameOver}>
          <GameOverTitle>Game Over!</GameOverTitle>
          <GameOverScore>Score: {Math.floor(score)}</GameOverScore>
          {gameOver && score > 0 && (
            <div style={{ color: '#ffb347', fontWeight: 700, fontSize: '1.1rem', marginBottom: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
              +{Math.floor(score)} credits earned! <span role="img" aria-label="coin">🪙</span>
            </div>
          )}
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
                    <LeaderboardName><Medal>{idx === 0 ? '🥇' : idx === 1 ? '🥈' : '🥉'}</Medal>{entry.name}</LeaderboardName>
                    <LeaderboardScore>{entry.score}</LeaderboardScore>
                  </LeaderboardEntry>
                ))}
              </LeaderboardList>
            </ModalContent>
          </LeaderboardModal>
        )}
      </GameContainer>
    </>
  );
};

export default FlappyBird; 