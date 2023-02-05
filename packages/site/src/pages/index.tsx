import { useContext, useEffect, useState } from 'react';
import styled from 'styled-components';
import { MetamaskActions, MetaMaskContext } from '../hooks';
import DATA_local from './data';

import {
  clearStorage,
  connectSnap,
  getSnap,
  getStorage,
  notify,
  setStorage,
  shouldDisplayReconnectButton,
} from '../utils';
import {
  ConnectButton,
  InstallFlaskButton,
  ReconnectButton,
  SendHelloButton,
  Card,
} from '../components';

import Footer from './Footer';
import Navbar from './Navbar';
import Section1 from './Section1';
import Section3 from './Section3';
import Section4 from './Section4';
import Analytics from './Analytics';

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

  useEffect(() => {
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

      await clearStorage();

      // initialize persistent storage
      let storage = (await getStorage()) as any;
      if (!storage) {
        storage = {};
        storage[account] = { mainMapping: {}, usage: {}, latestHash: '' };
        await setStorage(storage);
      } else if (!storage[account]) {
        // an account already exists so set the same mainMapping for the new account

        let prevAccount = null;
        for (const existingAccount in storage) {
          if (Object.prototype.hasOwnProperty.call(storage, existingAccount)) {
            if (existingAccount.startsWith('0x')) {
              prevAccount = existingAccount;
            }
          }
        }

        if (prevAccount === null || prevAccount === undefined) {
          console.error(
            'Persistent storage has not been initialized correctly.',
          );
          storage[account] = { mainMapping: {}, usage: {}, latestHash: '' };
        } else {
          const { mainMapping } = storage[prevAccount];
          const { usage } = storage[prevAccount];

          for (const tag in usage) {
            if (Object.prototype.hasOwnProperty.call(usage, tag)) {
              usage[tag].limit = 0;
              // used field will be updated later by a cron job
              usage[tag].used = 0;
              usage[tag].notified = false;
            }
          }

          storage[account] = {
            mainMapping,
            usage,
            latestHash: '',
          };
        }

        await setStorage(storage);
      }
    };
    initializeAccount();
  }, [account]);

  const handleConnectClick = async () => {
    try {
      await connectSnap();
      const installedSnap = await getSnap();

      dispatch({
        type: MetamaskActions.SetInstalled,
        payload: installedSnap,
      });
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
              <Section1 />
              <div className="section2 col-12">
                <Section3 />
              </div>
              <div className="section3 align-items-center justify-content-center col-lg-4 col-md-6 col-12">
                <Section4 />
              </div>
            </div>
          </div>
        </div>
      </Container1>

      <Container>
        <Heading>
          Welcome to <Span>template-snap</Span>
        </Heading>
        <Subtitle>
          Get started by editing <code>src/index.ts</code>
        </Subtitle>
        <CardContainer>
          {state.error && (
            <ErrorMessage>
              <b>An error happened:</b> {state.error.message}
            </ErrorMessage>
          )}
          {!state.isFlask && (
            <Card
              content={{
                title: 'Install',
                description:
                  'Snaps is pre-release software only available in MetaMask Flask, a canary distribution for developers with access to upcoming features.',
                button: <InstallFlaskButton />,
              }}
              fullWidth
            />
          )}
          {!state.installedSnap && (
            <Card
              content={{
                title: 'Connect',
                description:
                  'Get started by connecting to and installing the example snap.',
                button: (
                  <ConnectButton
                    onClick={handleConnectClick}
                    disabled={!state.isFlask}
                  />
                ),
              }}
              disabled={!state.isFlask}
            />
          )}
          {shouldDisplayReconnectButton(state.installedSnap) && (
            <Card
              content={{
                title: 'Reconnect',
                description:
                  'While connected to a local running snap this button will always be displayed in order to update the snap if a change is made.',
                button: (
                  <ReconnectButton
                    onClick={handleConnectClick}
                    disabled={!state.installedSnap}
                  />
                ),
              }}
              disabled={!state.installedSnap}
            />
          )}
          <Card
            content={{
              title: 'Send Hello message',
              description:
                'Display a custom message within a confirmation screen in MetaMask.',
              button: (
                <SendHelloButton
                  onClick={handleSendHelloClick}
                  disabled={!state.installedSnap}
                />
              ),
            }}
            disabled={!state.installedSnap}
            fullWidth={
              state.isFlask &&
              Boolean(state.installedSnap) &&
              !shouldDisplayReconnectButton(state.installedSnap)
            }
          />
          {/* <Container>hi</Container> */}
          <Notice>
            <p>
              Please note that the <b>snap.manifest.json</b> and{' '}
              <b>package.json</b> must be located in the server root directory
              and the bundle must be hosted at the location specified by the
              location field.
            </p>
          </Notice>
        </CardContainer>
      </Container>
    </Body>
  );
};

export default Index;
