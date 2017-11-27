// @flow
import React, { Component } from 'react';
import { observer, inject } from 'mobx-react';
import PaperWallet from '../../components/wallet/PaperWallet';
import type { InjectedProps } from '../../types/injectedPropsType';

type Props = InjectedProps;

@inject('stores', 'actions') @observer
export default class PaperWalletPage extends Component<Props> {

  static defaultProps = { actions: null, stores: null };

  render() {
    const { wallets } = this.props.stores.ada;
    const wallet = wallets.active;

    // Guard against potential null values
    if (!wallet) throw new Error('Active wallet required for PaperWalletPage.');

    return (
      <PaperWallet
        walletName={wallet.name}
        walletAddress={wallet.address}
      />
    );
  }

}
