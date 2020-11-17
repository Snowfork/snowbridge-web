import Eth from './eth';

type StartNet = (n: Net) => void;

export default class Net {
  // web3 (metamask) connection
  eth: Eth | undefined = undefined;

  constructor(option: StartNet) {
    option(this);
  }

  public static async start(): Promise<StartNet> {
    const eth = new Eth(await Eth.connect());

    return (net: Net): void => {
      console.log('----- Network started ------');
      net.eth = eth;
    };
  }
}
