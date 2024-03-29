import styled, { css, keyframes } from 'styled-components';

const easeIn = keyframes`
  from {
    opacity: 0;
    transform: translateX(500px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
`;

export const Message = styled.div<{ direction: 'left' | 'right' }>`
  animation: ${easeIn} 0.2s ease-in;
  text-align: end;

  display: flex;
  flex-direction: column;
  ${({ direction }) => direction === 'left' ?
    css` align-items: start;` :
    css` align-items: end; `
  }

  margin: 0.3em 0;

  font-size: 12px;
  font-weight: bold;
`;

export const Content = styled.div<{ direction: 'left' | 'right'}>`
  background-color: #F6D6BD;
  color: #08141E;
  padding: 0.5em 0.8em;
  border-radius: 12px;
  border: solid 1px #2a2a2a;
  box-shadow: 0px 4px 4px 0px rgba(0, 0, 0, 0.25);

  word-break: break-word;
  ${({ direction }) => direction === 'left' ?
    css` text-align: start;` :
    css` text-align: end; `
  }
`;
