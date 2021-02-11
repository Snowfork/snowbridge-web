import styled from 'styled-components';

export const Wrapper = styled.section`
  display: flex;
  flex-direction: column;
  min-width: 420px;
`;

export const Heading = styled.h2`
  text-align: center;
`;

export const Input = styled.input``;

export const TokenList = styled.ul`
  display: flex;
  flex-direction: column;
  height: 334px;
  list-style: none;
  padding: 0;
  margin: 0;
`;

export const Token = styled.li`
  button {
    display: flex;
    width: 100%;

    padding: 12px 20px;
    margin: 0;

    background: none;
    border: none;

    cursor: pointer;

    transition: background-color 180ms ease-out;
    :hover {
      background-color: #999;
    }
    img {
      width: 24px;
      height: 24px;
      margin-right: 15px;
      margin-top: 2px;
    }
    h3 {
      margin: 0;
    }
    p {
      margin: 0;
      font-size: 12px;
      font-weight: 300;
    }
  }
`;

export const Button = styled.button`
  margin-top: 20px;
`;
