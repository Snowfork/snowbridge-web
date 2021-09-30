import React from 'react';
import styled from 'styled-components';
import { useHistory } from 'react-router-dom';
import Modal from '../Modal/Modal';

const StyledModal = styled(Modal)`
  height: 100vh;
  max-height: 560px;
`;

const Wrapper = styled.div`
  height: 100%;
  width: 100%;
  max-width: 520px;
  overflow-y: auto;
  padding-right: 4px;
`;

const Section = styled.div`
  &:not(:last-child) {
    margin-bottom: 16px;
  }
`;

const SectionTitle = styled.div`
  color: ${({ theme }) => theme.colors.main};
  font-size: 14px;
`;

const SectionContent = styled.div < { highlighted?: boolean }>`
  color: ${({ theme, highlighted }) => (highlighted ? theme.colors.main : theme.colors.secondary)};
  font-size: 12px;
  white-space: pre-wrap;
    margin-top: 8px;
`;

const Link = styled.a`
  color: ${({ theme }) => theme.colors.main};
  text-decoration: none;
`;

const FaqModal = () => {
  const history = useHistory();
  const onRequestClose = () => history.push('/');

  return (
    <StyledModal isOpen onRequestClose={onRequestClose}>
      <Wrapper>
        <Section>
          <SectionTitle>What is Snowbridge?</SectionTitle>
          <SectionContent>Snowbridge is a decentralized, trustless and general purpose bridge between Polkadot and Ethereum built by Snowfork.</SectionContent>
        </Section>
        <Section>
          <SectionTitle>Who is Snowfork?</SectionTitle>
          <SectionContent>
            Snowfork is a research, development and staffing agency that sprouted from a collection of elite developers, designers and product managers with years of experience collaborating on projects together.
          </SectionContent>
          <SectionContent>
            We build strong teams from global talent to help businesses accelerate reaching their core goals. We work across a wide range of technologies and stacks - full stack distributed systems development is our bread and butter, while R&D with impact technologies like artificial intelligence and new interactive media keep us at the forefront of technological progress.
          </SectionContent>
          <SectionContent>
            Snowbridge is one of our core projects. See
            {' '}
            <Link href="https://snowfork.com" target="_blank" rel="noopener noreferrer">our main website</Link>
            {' '}
            for more details about Snowfork
          </SectionContent>
        </Section>
        <Section>
          <SectionTitle>How can I stay updated with progress on the project?</SectionTitle>
          <SectionContent>
            Sign up to our
            {' '}
            <Link href="https://snowfork.substack.com/" target="_blank" rel="noopener noreferrer">mailing list</Link>
          </SectionContent>
        </Section>
        <Section>
          <SectionTitle>What do we mean by trustless, general-purpose bridge?</SectionTitle>
          <SectionContent highlighted>Trustless</SectionContent>
          <SectionContent>In the blockchain space, most applications are driven by or augmented with financial use cases. This means that end users are giving up some control over their finances to whatever system they use. By giving up this control, they trust that the systems they use will protect their funds and stick to the expectations they have about how the system functions.</SectionContent>
          <SectionContent>We define a trustless system as a system in which the end user does not need to trust any participants or group of participants in the system in order to maintain protection of their funds and expectations of functionality. They only need to trust the protocols, mathematics, cryptography, code and economics.</SectionContent>
          <SectionContent>This can be achieved in various ways. The important thing here is for safety of user funds and expectations to be preserved, irrespective of the participants in the system.</SectionContent>
          <SectionContent>100% trustlessness cannot always be guaranteed - there always needs to be some set of basic assumptions that must be taken on, (eg: like assuming that an EMP wont hit the earth and wipe out all digital data). Snowbridge caters to a set of assumptions that will be mostly uncontroversial and acceptable by the community.</SectionContent>
          <SectionContent highlighted>General-Purpose</SectionContent>
          <SectionContent>In the interoperability and bridge space, the default thing that comes to mind for most people and projects is the transfer of tokens from one blockchain to another. Most bridges tackle this piece of functionality first and design with it in mind.</SectionContent>
          <SectionContent>However, interoperability is about more than just token transfers. Other kinds of assets, like non-fungible tokens, loan contracts, option/future contracts and generalized, type agnostic asset transfers across chains would be valuable functionality.</SectionContent>
          <SectionContent>Beyond just asset transfer, blockchain systems are essentially databases that contain state with some state transition business logic, and so being able to read/write arbitrary state across multiple databases/chains is also valuable.</SectionContent>
          <SectionContent>Being general-purpose, Snowbridge can facilitate transfer of arbitrary state across chains through arbitrary messages that are not tied to any particular application, and can support cross-chain applications.</SectionContent>
        </Section>
        <Section>
          <SectionTitle>
            How does Snowbridge achieve trustlessness?
          </SectionTitle>
          <SectionContent>
            See our developer documentation
            {' '}
            <Link href="https://snowbridge-docs.snowfork.com/" target="_blank" rel="noopener noreferrer">here</Link>
            {' '}
            for more details on the architecture and design.
          </SectionContent>
        </Section>
        <Section>
          <SectionTitle>When will the bridge be ready in production?</SectionTitle>
          <SectionContent>We will have a working testnet in late January that end users and blockchain developers will be able to interact and integrate with, and some demos to play with :). We’ll be launching with Kusama and Polkadot as soon as they support parachains.</SectionContent>
        </Section>
      </Wrapper>
    </StyledModal>
  );
};

export default FaqModal;
