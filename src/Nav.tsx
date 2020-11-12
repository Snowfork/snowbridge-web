import React, {useState, useEffect} from "react";
import {AppBar, Toolbar, Typography, Menu, MenuItem} from "@material-ui/core";
import {createStyles, makeStyles, Theme} from "@material-ui/core/styles";
import AccountBalanceWalletIcon from "@material-ui/icons/AccountBalanceWallet";

import Web3 from "web3";
import {ApiPromise} from "@polkadot/api";
import {web3Accounts, web3Enable} from "@polkadot/extension-dapp";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      flexGrow: 1,
    },
    menuButton: {
      marginRight: theme.spacing(2),
    },
    title: {
      flexGrow: 1,
    },
  }),
);

type Props = {
  web3: Web3;
  polkadotApi: ApiPromise;
};

function Nav({web3, polkadotApi}: Props): React.ReactElement<Props> {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const classes = useStyles();

  const [web3DefaultAcc, setDefaultWeb3Acc] = useState(String);
  const [web3Balance, setWeb3Balance] = useState(String);

  const [polkadotDefaultAcc, setPolkadotDefaultAcc] = useState(String);

  // Get default Web3 Account
  useEffect(() => {
    const fetchAccounts = async () => {
      const accs = await web3.eth.getAccounts();
      const defaultAcc = accs[0];

      web3.eth.defaultAccount = defaultAcc;
      setDefaultWeb3Acc(defaultAcc);
    };

    fetchAccounts();
  }, [web3.eth]);

  // Get Web3 Balance
  useEffect(() => {
    const exe = async () => {
      if (web3DefaultAcc !== undefined && web3DefaultAcc.toString() !== "") {
        const currBalance = await web3.eth.getBalance(
          web3DefaultAcc.toString(),
        );
        setWeb3Balance(web3.utils.fromWei(currBalance, "ether"));
      }
    };

    exe();
  });

  // Get default Polkadotjs Account
  useEffect(() => {
    const exe = async () => {
      const extensions = await web3Enable("Ethereum Bridge");

      if (extensions.length === 0) {
        return;
      }

      const allAccounts = await web3Accounts();
      setPolkadotDefaultAcc(allAccounts[0].address);
    };

    exe();
  }, []);

  const handleClick = (event: React.MouseEvent<any>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  function web3MenuElement() {
    if (web3DefaultAcc) {
      return (
        <span>
          {web3Balance + " ETH " + web3DefaultAcc.substr(0, 7) + "..."}
        </span>
      );
    }
  }

  function polkadotMenuElement() {
    if (polkadotDefaultAcc) {
      return (
        <span>
          {0 + " PolkaETH " + polkadotDefaultAcc.substr(0, 7) + "..."}
        </span>
      );
    } else {
      return (
        <span style={{color: "red"}}>Polkadotjs extension not connected</span>
      );
    }
  }

  return (
    <AppBar
      position="static"
      style={{background: "#24292e", marginBottom: "1em"}}
    >
      <Toolbar>
        <Typography variant="h6" className={classes.title}>
          Ethereum Bridge
        </Typography>
        <AccountBalanceWalletIcon onClick={handleClick} />
        <Menu
          id="simple-menu"
          anchorEl={anchorEl}
          keepMounted
          open={Boolean(anchorEl)}
          onClose={handleClose}
        >
          <MenuItem onClick={handleClick}>{web3MenuElement()}</MenuItem>
          <MenuItem onClick={handleClick}>{polkadotMenuElement()}</MenuItem>
        </Menu>
      </Toolbar>
    </AppBar>
  );
}

export default Nav;
