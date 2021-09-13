import styled from 'styled-components';

export const Wrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 30px;
  height: 150px;
`;

export const Heading = styled.h1`
  color: white;
  -webkit-text-stroke: 1px rgba(199, 159, 34, 0.81);
  font-size: 52px;
  font-weight: 500;
`;

export const CurrencyList = styled.ul`
  display: flex;
  flex-direction: column;
  li {
    margin-top: 0.5em;
  }
  li:first-of-type {
    margin-top: 0;
  }
`;

export const DisplayWrapper = styled.li`
  display: flex;
  align-items: center;
`;

export const DisplayContainer = styled.div`
  width: 100%;
  display: flex;
  align-items: center;
  border-radius: 12px;
  background: rgb(237, 238, 242);
  color: black;
`;

export const DisplayTitle = styled.div`
  color: #fff;
  white-space: nowrap;
  margin-right: 20px;
`;

export const Amount = styled.div`
  width: 100%;
  padding-left: 0.75rem;
  padding-right: 0.5rem;
  white-space: nowrap;
`;

export const Address = styled.button`
  display: flex;
  flex-flow: row nowrap;
  align-items: center;
  width: 100%;
  color: var(--color-text);
  text-align: center;
  text-decoration: none;
  justify-content: center;
  padding: 0.5rem;
  border-radius: 12px;
  cursor: pointer;
  user-select: none;
  background-color: rgb(247, 248, 250);
  border: 1px solid rgb(237, 238, 242);
  font-weight: 500;
  font-size: 16px;
  :hover {
    border-color: var(--color-primary);
    background-color: rgb(255, 255, 255);
  }
  :focus {
    border: 1px solid rgb(207, 210, 221);
    outline: none;
    box-shadow: rgb(246, 221, 232) 0px 0px 0px 1pt;
  }
`;

export const Icon = styled.img`
  height: 24px;
  width: 24px;
  margin-right: 0.5rem;
`;

export const ModalContainer = styled.div`
  display: flex;
  flex-direction: column;
  min-width: 400px;
`;

export const ModalHeader = styled.header`
  display: flex;
  justify-content: space-between;
`;

export const ModalTitle = styled.h2`
  margin: 0;
  padding: 0;
`;
