import { tokenABI, channelABI, lightChainTrustedWalletsABI } from './contracts'
import EthereumTx from 'ethereumjs-tx'
//import { Buffer } from 'buffer'
import SolidityFunction from 'web3/lib/web3/function'

function TokenFunctions() {
    var approveABI = tokenABI.filter(item => item.name == "approve")[0];
    var approve = new SolidityFunction(null, approveABI, "0x0");

    this.getApproveTx = function (privateKey, nonce, gasPrice,
        tokenConfiguration, amount) {

        let payload = approve.toPayload(
            [
                tokenConfiguration.channelManagerAddress,
                amount
            ]);

        var txParams = {
            nonce: nonce,
            gasPrice: gasPrice,
            gasLimit: '0x10C84',
            to: tokenConfiguration.address,
            value: '0x00',
            data: payload.data,
            // EIP 155 chainId - mainnet: 1, ropsten: 3
            chainId: tokenConfiguration.chainId
        };

        const tx = new EthereumTx(txParams);
        tx.sign(privateKey);

        return tx.serialize().toString('hex');
    }
}

function ChannelFunctions() {
    var createChannelABI = channelABI.filter(item => item.name == "createChannel")[0];
    var createChannel = new SolidityFunction(null, createChannelABI, "0x0");
    var cooperativeCloseABI = channelABI.filter(item => item.name == "cooperativeClose")[0];
    var cooperativeClose = new SolidityFunction(null, cooperativeCloseABI, "0x0");
    // var withdrawABI = channelABI.filter(item => item.name == "withdraw")[0];
    // var withdraw = new SolidityFunction(null, withdrawABI, "0x0");

    function channelTx(privateKey, nonce, gasPrice, gasLimit,
        channelManagerAddress, chainId, data) {

        var txParams = {
            nonce: nonce,
            gasPrice: gasPrice,
            gasLimit: gasLimit,
            to: channelManagerAddress,
            value: '0x00',
            data: data,
            // EIP 155 chainId - mainnet: 1, ropsten: 3
            chainId: chainId
        };

        const tx = new EthereumTx(txParams);
        tx.sign(privateKey);
        return tx;
    }

    this.getCreateChannelTx = function (privateKey, nonce, gasPrice,
        tokenConfiguration, channelRequest) {

        let payload = createChannel.toPayload(
            [
                channelRequest.receiverAddress,
                channelRequest.amountText
            ]);

        let tx = channelTx(privateKey, nonce, gasPrice, '0x334B0',
            tokenConfiguration.channelManagerAddress, tokenConfiguration.chainId, payload.data);

        return tx.serialize().toString('hex');
    }

    this.getQuickCreateChannelTx = function (privateKey, nonce, gasPrice,
        tokenConfiguration, tokenAmountText, receiverAddress) {

        let payload = createChannel.toPayload(
            [
                receiverAddress,
                tokenAmountText
            ]);

        let tx = channelTx(privateKey, nonce, gasPrice, '0x334B0',
            tokenConfiguration.channelManagerAddress, tokenConfiguration.chainId, payload.data);

        return tx.serialize().toString('hex');
    }

    this.getCooperativeCloseTx = function (privateKey, nonce, gasPrice, channel) {
        let payload = cooperativeClose.toPayload(
            [
                channel.senderAddress,
                channel.receiverAddress,
                channel.openBlockNumber,
                channel.totalEscrowedText,
                channel.totalReleasedText,
                channel.receiverClosingSignature
            ]);

        let tx = channelTx(privateKey, nonce, gasPrice, '0x2334B0',
            channel.channelManagerAddress, channel.chainId, payload.data);

        return tx.serialize().toString('hex');
    }

    // this.getWithdrawTx = function (privateKey, nonce, gasPrice, channel) {
    //     let payload = withdraw.toPayload(
    //         [
    //             channel.openBlockNumber,
    //             channel.totalEscrowedText,
    //             channel.totalReleasedText,
    //             channel.senderSignature
    //         ]);

    //     let tx = channelTx(privateKey, nonce, gasPrice, '0x2334B0',
    //         channel.channelManagerAddress, channel.chainId, payload.data);

    //     return tx.serialize().toString('hex');
    // }
}

function TrustedWalletsFunctions() {
    var withdrawABI = lightChainTrustedWalletsABI.filter(item => item.name == "Withdraw")[0];
    var withdraw = new SolidityFunction(null, withdrawABI, "0x0");

    this.getWithdrawTx = function (privateKey, nonce, gasPrice,
         tokenConfiguration, value, balance, sig) {

        let payload = withdraw.toPayload(
            [
                value,
                balance,
                sig
            ]);

        var txParams = {
            nonce: nonce,
            gasPrice: gasPrice,
            gasLimit: '0x10C84',
            to: tokenConfiguration.walletManagerAddress,
            value: '0x00',
            data: payload.data,
            // EIP 155 chainId - mainnet: 1, ropsten: 3
            chainId: tokenConfiguration.chainId
        };

        const tx = new EthereumTx(txParams);
        tx.sign(privateKey);

        return tx.serialize().toString('hex');
    }

}


export let tokenFunctions = new TokenFunctions();

export let channelFunctions = new ChannelFunctions();
export let trustedWalletsFunctions = new TrustedWalletsFunctions();



