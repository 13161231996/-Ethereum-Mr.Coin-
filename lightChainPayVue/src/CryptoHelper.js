import * as CryptoUtil from './CryptoUtil'
import ethereumjsUtil from 'ethereumjs-util'
import { Buffer } from 'buffer'
import BigNumber from 'bignumber.js'
import crypto from 'crypto';

function sign(channel, title, key) {
    const isSender = title.toLowerCase().indexOf("sender") > -1;
    const addressStr = isSender ? "address receiver" : "address sender";
    let str = "string message_id" + addressStr +
        "uint32 block_created" + "uint192 total_escrowed"
        + "uint192 total_released" + "address contract";
    let hash1 = ethereumjsUtil.keccak256(CryptoUtil.stringToBuffer(str));

    let titleBytes = CryptoUtil.stringToBuffer(title);
    let addressBytes = isSender ?
        Buffer.from(channel.receiverAddress.replace('0x', ''), 'hex')
        : Buffer.from(channel.senderAddress.replace('0x', ''), 'hex');

    let blockBytes = Buffer.from(
        new BigNumber(channel.openBlockNumber).toString(16).padStart(8, '0'), 'hex');
    let totalEscrowBytes = Buffer.from(
        channel.totalEscrowed.toString(16).padStart(48, '0'), 'hex');
    let totalReleasedBytes = Buffer.from(
        channel.totalReleased.toString(16).padStart(48, '0'), 'hex');

    let contractAddress = channel.channelManagerAddress.replace('0x', '');
    let contractAddressBytes = Buffer.from(contractAddress, 'hex');

    let buffer = Buffer.concat([
        titleBytes, addressBytes, blockBytes,
        totalEscrowBytes, totalReleasedBytes, contractAddressBytes]);

    let hash2 = ethereumjsUtil.keccak256(buffer);
    let msg = Buffer.concat([hash1, hash2]);

    let signature = CryptoUtil.hashAndSignMessage(msg, key);
    return signature;
}

export function recoverEthKey(ethKey, password) {
    let salt = CryptoUtil.hexToBuffer(ethKey.salt);
    let key = CryptoUtil.stretchPassword(password, salt,
        ethKey.pbkdf2Iterations);

    let signature = ethereumjsUtil.keccak256(key);
    if (signature.toString('hex') != ethKey.signature) {
        throw "Wrong eth password."
    }

    // let encKey = new Buffer(16);
    // key.copy(encKey, 0, 0, 16);
    // return encKey;
    return key;
}

export function signSenderProof(channel, key) {
    return sign(channel, "Sender proof signature", key);
}

export function signSenderClosingProof(channel, key) {
    return sign(channel, "Sender closing signature", key);
}

export function signReceiverClosingProof(channel, key) {
    return sign(channel, "Receiver closing signature", key);
}

export function signWalletPay(transaction, key) {
    let str = "string message_id" + "uint32 transaction_id" + "address contract";
    let hash1 = ethereumjsUtil.keccak256(CryptoUtil.stringToBuffer(str));

    let messageIdBytes = CryptoUtil.stringToBuffer("Trusted wallet pay signature");
    let transactionIdBytes = Buffer.from(
        new BigNumber(transaction.id).toString(16).padStart(8, '0'), 'hex');

    let contractAddress = transaction.walletAddress.replace('0x', '');
    let contractAddressBytes = Buffer.from(contractAddress, 'hex');

    let buffer = Buffer.concat([messageIdBytes, transactionIdBytes,
        contractAddressBytes]);

    let hash2 = ethereumjsUtil.keccak256(buffer);
    let msg = Buffer.concat([hash1, hash2]);

    let signature = CryptoUtil.hashAndSignMessage(msg, key);
    return signature;
}

export function signPaysApi(payment, uid, token) {
    const baseUrl = "http://120.24.157.18:7744";
    const notifyUrl = baseUrl + "/Home/PaysApiNotify";
    const returnUrl = baseUrl + "/Home/PaysApiFinished";
    let stringKey = payment.commodityName + "1"
        + notifyUrl + payment.id
        + payment.customerId + payment.currencyPrice.toFixed(2)
        + returnUrl + token + uid;

    const md5 = crypto.createHash('md5');
    let signature = md5.update(stringKey).digest('hex');

    return { uid, notifyUrl, returnUrl, signature };
}

