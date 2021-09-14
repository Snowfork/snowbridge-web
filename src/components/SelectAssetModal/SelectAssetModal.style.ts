import styled from 'styled-components';

export const Heading = styled.h2`
  text-align: center;
`;

export const TokenList = styled.ul`
  display: flex;
  flex-direction: column;
  height: 100%;
  list-style: none;
  padding: 0;
  margin: 0;
`;

export const Token = styled.li`
  button {
    display: flex;
    align-items: center;
    width: 100%;

    padding: 6px 0px;
    margin: 0;

    background: none;
    border: none;

    cursor: pointer;

    color: ${props => props.theme.colors.secondary};

    transition: background-color 180ms ease-out;
    :hover {
      background-color: #999;
    }
    img {
      width: 24px;
      100%: 24px;
      margin-right: 15px;
      margin-top: 2px;
    }
  }
`;
