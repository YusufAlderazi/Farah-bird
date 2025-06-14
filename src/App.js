import React from 'react';
import styled from 'styled-components';
import FlappyBird from './components/FlappyBird';

const AppContainer = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: #282c34;
  padding: 20px;
`;

const Title = styled.h1`
  color: white;
  margin-bottom: 20px;
  text-align: center;
`;

const Instructions = styled.div`
  color: white;
  text-align: center;
  margin-bottom: 20px;
  max-width: 400px;
`;

function App() {
  return (
    <AppContainer>
      <Title>Farah Bird</Title>
      <Instructions>
        Click or press Space to make the bird jump. Avoid the pipes and try to get the highest score!
      </Instructions>
      <FlappyBird />
    </AppContainer>
  );
}

export default App;
