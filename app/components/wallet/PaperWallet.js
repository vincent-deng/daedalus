// @flow
import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { downloadPaperWalletCertificate } from '../../utils/pdf';
import BorderedBox from '../widgets/BorderedBox';
import styles from './PaperWallet.scss';

type Props = {
  walletAddress: string,
};

type State = {
  isGeneratingPDF: boolean,
}

@observer
export default class PaperWallet extends Component<Props, State> {

  state = {
    isGeneratingPDF: false,
  };

  downloadPDF = () => {
    this.setState({ isGeneratingPDF: true });
    setTimeout(() => { // Timeout is used to allow enought time for button text re-rendering
      downloadPaperWalletCertificate({
        address: this.props.walletAddress,
        mnemonics: [
          'mnemonic-1', 'mnemonic-2', 'mnemonic-3', 'mnemonic-4', 'mnemonic-5',
          'mnemonic-6', 'mnemonic-7', 'mnemonic-8', 'mnemonic-9', 'mnemonic-10',
          'mnemonic-11', 'mnemonic-12', 'mnemonic-13', 'mnemonic-14', 'mnemonic-15',
        ],
        callback: () => {
          this.setState({ isGeneratingPDF: false });
        },
      });
    }, 100);
  };

  render() {
    const { walletAddress } = this.props;
    const { isGeneratingPDF } = this.state;

    return (
      <div className={styles.component}>

        <BorderedBox>

          <h1>Paper Wallet Certificate</h1>
          <button
            onClick={this.downloadPDF}
            disabled={isGeneratingPDF}
          >
            {isGeneratingPDF ? 'Generating Paper Wallet Certificate' : 'Download Paper Wallet Certificate'}
          </button>

        </BorderedBox>

      </div>
    );
  }

}
