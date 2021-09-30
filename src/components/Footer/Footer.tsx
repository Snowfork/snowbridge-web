import React, { useState } from 'react';
import styled from 'styled-components';
import Modal from '../Modal/Modal';
import Icon from '../Icon/Icon';

const Wrapper = styled.div`
  padding: 30px 18px;
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const Info = styled.div`
  color: ${({ theme }) => theme.colors.main};
  font-size: 12px;
`;

const Actions = styled.div`
  display: flex;
  align-items: center;
`;

const Links = styled.div`
  display: flex;
  align-items: center;
  margin-right: -10px;
`;

const LinkWrapper = styled.div`
  margin-right: 10px;
  display: flex;
  align-items: center;
`;

const LinkNumber = styled.p`
  color: ${({ theme }) => theme.colors.main};
  font-size: 12px;
  margin: 0 6px;
`;

const Link = styled.a`
  display: flex;
  align-items: center;
  cursor: pointer;
  text-decoration: none;
  background: transparent;
  font-size: 12px;
  color: ${({ theme }) => theme.colors.secondary};
  border: 1px solid ${({ theme }) => theme.colors.main};
  padding: 6px;
  box-shadow: ${({ theme }) => theme.boxShadow};
`;

const LinkIcon = styled(Icon)`
  margin-right: 6px;
`;

const BlogModal = styled.div`
  width: 320px;
  height: 320px;
  
  .balance-text {
    color: ${({ theme }) => theme.colors.secondary} !important;
  };
`;

enum FooterModalsEnum {
  blog = 'blog'
}

const Footer = () => {
  const [openedModal, setOpenedModal] = useState<FooterModalsEnum | null>(null);

  const closeModal = () => setOpenedModal(null);

  return (
    <>
      <Wrapper>
        <Info>Copyright © 2021. Snowbridge ✲´*。.❄¨¯`*✲。❄。*。</Info>
        <Actions>
          <Links>
            <LinkWrapper>
              <LinkNumber>1</LinkNumber>
              {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
              <Link as="button" onClick={() => setOpenedModal(FooterModalsEnum.blog)}>Blog</Link>
            </LinkWrapper>
            <LinkWrapper>
              <LinkNumber>2</LinkNumber>
              <Link href="https://snowbridge-docs.snowfork.com/" target="_blank" rel="noopener noreferrer">Docs</Link>
            </LinkWrapper>
            <LinkWrapper>
              <LinkNumber>3</LinkNumber>
              <Link href="https://twitter.com/snowfork_inc" target="_blank" rel="noopener noreferrer">
                <LinkIcon name="twitter" size="12px" />
                <span>Twitter</span>
              </Link>
            </LinkWrapper>
            <LinkWrapper>
              <LinkNumber>4</LinkNumber>
              <Link href="https://discord.com/channels/880940859997184050/880940859997184053" target="_blank" rel="noopener noreferrer">
                <LinkIcon name="discord" size="12px" />
                <span>Discord</span>
              </Link>
            </LinkWrapper>
            <LinkWrapper>
              <LinkNumber>5</LinkNumber>
              <Link href="https://github.com/Snowfork/snowbridge" target="_blank" rel="noopener noreferrer">
                <LinkIcon name="github" size="12px" />
                <span>Github</span>
              </Link>
            </LinkWrapper>
            <LinkWrapper>
              <LinkNumber>3</LinkNumber>
              <Link href="">Terms</Link>
            </LinkWrapper>
            <LinkWrapper>
              <LinkNumber>4</LinkNumber>
              <Link href="">Blog</Link>
            </LinkWrapper>
            <LinkWrapper>
              <LinkNumber>5</LinkNumber>
              <Link href="">Contact</Link>
            </LinkWrapper>
          </Links>
        </Actions>
      </Wrapper>
      <Modal isOpen={openedModal === FooterModalsEnum.blog} onRequestClose={closeModal}>
        <BlogModal>
          <iframe
            title="blog"
            src="https://snowfork.substack.com/embed"
            height="320"
            frameBorder="0"
            scrolling="no"
          />
        </BlogModal>
      </Modal>
    </>
  );
};

export default Footer;
