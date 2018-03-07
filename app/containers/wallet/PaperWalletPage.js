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
    const { addresses } = this.props.stores.ada;
    const walletAddress = addresses.active ? addresses.active.id : '';

    return (
      <PaperWallet
        walletAddress={walletAddress}
      />
    );
  }

}
