import { useContext, useEffect, useState } from 'react';
import styled from 'styled-components';
import { MetamaskActions, MetaMaskContext } from '../hooks';

import {
  clearStorage,
  connectSnap,
  getSnap,
  getStorage,
  notify,
  setStorage,
} from '../utils';

import Section1 from './Section1';

const Body = styled.div`
  background-color: ${(props) => props.theme.colors.background.default};
  color: ${(props) => props.theme.colors.text.default};
  font-family: ${(props) => props.theme.fonts.default};
  font-size: ${(props) => props.theme.fontSizes.text};
  margin: 0;
`;

const Container1 = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  margin: 2rem;
  ${({ theme }) => theme.mediaQueries.small} {
    padding-left: 2.4rem;
    padding-right: 2.4rem;
    margin-top: 2rem;
    margin-bottom: 2rem;
    width: auto;
  }
`;

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 1;
  margin-top: 7.6rem;
  margin-bottom: 7.6rem;
  ${({ theme }) => theme.mediaQueries.small} {
    padding-left: 2.4rem;
    padding-right: 2.4rem;
    margin-top: 2rem;
    margin-bottom: 2rem;
    width: auto;
  }
`;

const Heading = styled.h1`
  margin-top: 0;
  margin-bottom: 2.4rem;
  text-align: center;
`;

const Span = styled.span`
  color: ${(props) => props.theme.colors.primary.default};
`;

const Subtitle = styled.p`
  font-size: ${({ theme }) => theme.fontSizes.large};
  font-weight: 500;
  margin-top: 0;
  margin-bottom: 0;
  ${({ theme }) => theme.mediaQueries.small} {
    font-size: ${({ theme }) => theme.fontSizes.text};
  }
`;

const CardContainer = styled.div`
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  justify-content: space-between;
  max-width: 64.8rem;
  width: 100%;
  height: 100%;
  margin-top: 1.5rem;
`;

const Notice = styled.div`
  background-color: ${({ theme }) => theme.colors.background.alternative};
  border: 1px solid ${({ theme }) => theme.colors.border.default};
  color: ${({ theme }) => theme.colors.text.alternative};
  border-radius: ${({ theme }) => theme.radii.default};
  padding: 2.4rem;
  margin-top: 2.4rem;
  max-width: 60rem;
  width: 100%;

  & > * {
    margin: 0;
  }
  ${({ theme }) => theme.mediaQueries.small} {
    margin-top: 1.2rem;
    padding: 1.6rem;
  }
`;

const ErrorMessage = styled.div`
  background-color: ${({ theme }) => theme.colors.error.muted};
  border: 1px solid ${({ theme }) => theme.colors.error.default};
  color: ${({ theme }) => theme.colors.error.alternative};
  border-radius: ${({ theme }) => theme.radii.default};
  padding: 2.4rem;
  margin-bottom: 2.4rem;
  margin-top: 2.4rem;
  max-width: 60rem;
  width: 100%;
  ${({ theme }) => theme.mediaQueries.small} {
    padding: 1.6rem;
    margin-bottom: 1.2rem;
    margin-top: 1.2rem;
    max-width: 100%;
  }
`;

const Index = () => {
  const [state, dispatch] = useContext(MetaMaskContext);
  const [account, setAccount] = useState('');
  const [seed, setSeed] = useState(0);

  const initializeAccount = async () => {
    const accounts = (await window.ethereum?.request({
      method: 'eth_requestAccounts',
    })) as string[];
    // ensure acccounts is not null or undefined
    if (!accounts) {
      return;
    }
    setAccount(accounts[0].toLowerCase());
    window.ethereum.on('accountsChanged', function (_accounts: any) {
      setAccount(_accounts[0].toLowerCase());
    });

    // await clearStorage();

    // initialize persistent storage
    let storage = (await getStorage()) as any;
    if (!account.startsWith('0x')) {
      return;
    }
    console.log('storage: ', storage);
    if (!storage?.[account]) {
      storage = {};
      storage[account] = {
        mainMapping: {},
        usage: {},
        latestHash: '',
        prevHash: '',
      };
      await setStorage(storage);
    }
    setSeed(Math.random());
  };

  useEffect(() => {
    initializeAccount();
  }, [account, state.installedSnap]);

  const handleConnectClick = async () => {
    try {
      await connectSnap();
      const installedSnap = await getSnap();

      dispatch({
        type: MetamaskActions.SetInstalled,
        payload: installedSnap,
      });
      await initializeAccount();
    } catch (e) {
      console.error(e);
      dispatch({ type: MetamaskActions.SetError, payload: e });
    }
  };

  const handleSendHelloClick = async () => {
    try {
      await notify();
    } catch (e) {
      console.error(e);
      dispatch({ type: MetamaskActions.SetError, payload: e });
    }
  };

  return (
    <Body>
      <Container1>
        <div className="d-flex flex-column p-0 m-0">
          <div className="container-fluid h-100">
            <div className="row h-100">
              <Section1 key={seed} />
            </div>
          </div>
        </div>
      </Container1>
    </Body>
  );
};

export default Index;
