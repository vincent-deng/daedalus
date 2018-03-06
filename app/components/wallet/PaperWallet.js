// @flow
import React, { Component } from 'react';
import { observer } from 'mobx-react';
import * as pdfMake from 'pdfmake/build/pdfmake';
import * as pdfFonts from 'pdfmake/build/vfs_fonts';
import BorderedBox from '../widgets/BorderedBox';
import paperWalletPage1 from '../../assets/pdf/paper-wallet-certificate-page-1.png';
import paperWalletPage2 from '../../assets/pdf/paper-wallet-certificate-page-2.png';
import styles from './PaperWallet.scss';

// Assign pdfFonts to pdfMaker
Object.assign(pdfMake, pdfFonts.pdfMake);
Object.assign(pdfMake.default, pdfFonts.default.pdfMake);

type Props = {
  walletName: string,
  walletAddress: string,
};

type State = {
  isGeneratingPDF: boolean,
}

// define your function for generating rotated text
const writeRotatedText = (text: string) => {
  const fontSize = 8;
  const verticalSpacing = 3;
  const qualityMultiplier = 4;
  // ^^ qualityMultiplier is used to generate HQ canvas and then fit it to A4 page width
  const canvas = document.createElement('canvas');
  canvas.width = 500 * qualityMultiplier;
  canvas.height = (fontSize + verticalSpacing) * qualityMultiplier;
  const ctx = canvas.getContext('2d');
  ctx.font = `${fontSize * qualityMultiplier}pt Arial`;
  ctx.save();
  ctx.translate(canvas.width, 0);
  ctx.scale(-1, -1);
  ctx.textAlign = 'center';
  ctx.fillStyle = '#3b5c9b';
  ctx.fillText(text, canvas.width / 2, -verticalSpacing * qualityMultiplier);
  ctx.restore();
  return canvas.toDataURL();
};

@observer
export default class PaperWallet extends Component<Props, State> {

  state = {
    isGeneratingPDF: false,
  };

  docDefinition = {
    content: [
      // 1st page - Public key
      { // Page background
        image: paperWalletPage1,
        absolutePosition: { x: 0, y: 0 },
        width: 595.28,
        height: 841.89,
      },
      { // Wallet address
        image: writeRotatedText('Wallet address'),
        fit: [500, 11],
        alignment: 'center',
        absolutePosition: { x: 0, y: 750 },
      },
      { // Wallet address QR code
        qr: this.props.walletAddress,
        alignment: 'center',
        background: '#f8fbfd',
        fit: 80,
        foreground: '#3b5c9b',
        absolutePosition: { x: 0, y: 674 },
      },
      { // Wallet address - line 1
        image: writeRotatedText('DdzFFzCqrhtBmXCm2p4cX1rZ72HZb5cTucVpDyn'),
        fit: [500, 11],
        alignment: 'center',
        absolutePosition: { x: 0, y: 648 },
      },
      { // Wallet address - line 2
        image: writeRotatedText('jmjDyzLUDmLa53KYSa2hew1Ew1KytXjCdicFeho'),
        fit: [500, 11],
        alignment: 'center',
        absolutePosition: { x: 0, y: 636 },
      },
      { // Wallet address - line 3
        image: writeRotatedText('hasAqPL2j4qV4vSL4kaEjMnKBq'),
        fit: [500, 11],
        alignment: 'center',
        absolutePosition: { x: 0, y: 624 },
      },
      { // Daedalus version and build
        image: writeRotatedText('Daedalus 0.9.0#1.1.0.408'),
        fit: [500, 11],
        absolutePosition: { x: 0, y: 570 },
      },
      // 2nd page - Private key
      { // Page background
        image: paperWalletPage2,
        absolutePosition: { x: 0, y: 0 },
        width: 595.28,
        height: 841.89,
        pageBreak: 'before',
      },
      { // Shielded recovery phrase
        image: writeRotatedText('Shielded recovery phrase'),
        fit: [500, 11],
        alignment: 'center',
        absolutePosition: { x: 0, y: 350 },
      },
      { // Shielded recovery phrase - word 1
        image: writeRotatedText('mnemonic-1'),
        fit: [100, 11],
        alignment: 'center',
        absolutePosition: { x: 400, y: 330 },
      },
      { // Shielded recovery phrase - word 2
        image: writeRotatedText('mnemonic-2'),
        fit: [100, 11],
        alignment: 'center',
        absolutePosition: { x: 300, y: 330 },
      },
      { // Shielded recovery phrase - word 3
        image: writeRotatedText('mnemonic-3'),
        fit: [100, 11],
        alignment: 'center',
        absolutePosition: { x: 200, y: 330 },
      },
      { // Shielded recovery phrase - word 4
        image: writeRotatedText('mnemonic-4'),
        fit: [100, 11],
        alignment: 'center',
        absolutePosition: { x: 100, y: 330 },
      },
      { // Shielded recovery phrase - word 5
        image: writeRotatedText('mnemonic-5'),
        fit: [100, 11],
        alignment: 'center',
        absolutePosition: { x: 0, y: 330 },
      },
      { // Shielded recovery phrase - word 6
        image: writeRotatedText('mnemonic-6'),
        fit: [100, 11],
        alignment: 'center',
        absolutePosition: { x: 400, y: 310 },
      },
      { // Shielded recovery phrase - word 7
        image: writeRotatedText('mnemonic-7'),
        fit: [100, 11],
        alignment: 'center',
        absolutePosition: { x: 300, y: 310 },
      },
      { // Shielded recovery phrase - word 8
        image: writeRotatedText('mnemonic-8'),
        fit: [100, 11],
        alignment: 'center',
        absolutePosition: { x: 200, y: 310 },
      },
      { // Shielded recovery phrase - word 9
        image: writeRotatedText('mnemonic-9'),
        fit: [100, 11],
        alignment: 'center',
        absolutePosition: { x: 100, y: 310 },
      },
      { // Shielded recovery phrase - word 10
        image: writeRotatedText('mnemonic-10'),
        fit: [100, 11],
        alignment: 'center',
        absolutePosition: { x: 0, y: 310 },
      },
      { // Shielded recovery phrase - word 11
        image: writeRotatedText('mnemonic-11'),
        fit: [100, 11],
        alignment: 'center',
        absolutePosition: { x: 400, y: 290 },
      },
      { // Shielded recovery phrase - word 12
        image: writeRotatedText('mnemonic-12'),
        fit: [100, 11],
        alignment: 'center',
        absolutePosition: { x: 300, y: 290 },
      },
      { // Shielded recovery phrase - word 13
        image: writeRotatedText('mnemonic-13'),
        fit: [100, 11],
        alignment: 'center',
        absolutePosition: { x: 200, y: 290 },
      },
      { // Shielded recovery phrase - word 14
        image: writeRotatedText('mnemonic-14'),
        fit: [100, 11],
        alignment: 'center',
        absolutePosition: { x: 100, y: 290 },
      },
      { // Shielded recovery phrase - word 15
        image: writeRotatedText('mnemonic-15'),
        fit: [100, 11],
        alignment: 'center',
        absolutePosition: { x: 0, y: 290 },
      },
      { // Password
        image: writeRotatedText('Password'),
        fit: [500, 11],
        alignment: 'center',
        absolutePosition: { x: 0, y: 250 },
      },
    ],
    pageMargins: [0, 0],
    pageSize: 'A4',
  };

  downloadPaperWallet = () => {
    this.setState({ isGeneratingPDF: true });
    setTimeout(() => { // Timeout is used to allow enought time for button text re-rendering
      pdfMake.createPdf(this.docDefinition).download('paper-wallet.pdf', () => {
        this.setState({ isGeneratingPDF: false });
      });
    }, 100);
  };

  render() {
    const {
      walletName, walletAddress,
    } = this.props;
    const { isGeneratingPDF } = this.state;

    return (
      <div className={styles.component}>

        <BorderedBox>

          <h1>Paper Wallet</h1>
          <p>Wallet name: {walletName}</p>
          <p>Private key: abcdefghijklmnopqrstuvwxyz1234567890</p>
          <p>Public key: {walletAddress}</p>
          <button
            onClick={this.downloadPaperWallet}
            disabled={isGeneratingPDF}
          >
            {isGeneratingPDF ? 'Generating Paper Wallet PDF' : 'Download Paper Wallet'}
          </button>

        </BorderedBox>

      </div>
    );
  }

}
