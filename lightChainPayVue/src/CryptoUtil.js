import CryptoJS from 'crypto-js'
import { Buffer } from 'buffer'
import crypto from 'crypto'
import ethereumjsUtil from 'ethereumjs-util'

export function wordArrayToBuffer(wordArray) {
    return Buffer.from(wordArray.toString(CryptoJS.enc.Hex), 'hex');
}

export function bufferToWordArray(buffer) {
    return CryptoJS.enc.Hex.parse(buffer.toString('hex'));
}

export function hexToBuffer(hex) {
    return Buffer.from(hex, 'hex');
}

export function hexToWordArray(hex) {
    return CryptoJS.enc.Hex.parse(hex);
}

export function stringToBuffer(str) {
    return Buffer.from(str, "utf8");
}

export function bufferToString(buf) {
    return buf.toString("utf8");
}

export function idToBuffer(id) {
    try {
        return hexToBuffer(id.replace(/-/g, ""))
    } catch (e) {
        throw new Error("An error occured while converted the trade UUID to a buffer.")
    }
}

export function stretchPasswordOld(password, salt, pbkdf2Iterations, keySize) {
    keySize = void 0 === keySize ? 256 : keySize;
    let pbkdf2 = CryptoJS.PBKDF2(password, salt.toString(), {
        keySize: keySize / 32, iterations: pbkdf2Iterations
    });

    return wordArrayToBuffer(pbkdf2);
}

export function stretchPassword(password, salt, pbkdf2Iterations, keySize) {
    keySize = void 0 === keySize ? 256 : keySize;
    let pbkdf2 = CryptoJS.PBKDF2(password, bufferToWordArray(salt), {
        keySize: keySize / 32, iterations: pbkdf2Iterations
    });

    return wordArrayToBuffer(pbkdf2);
}

export function generateECPrivateKey() {
    return crypto.randomBytes(32);
}

export function generateIV() {
    return crypto.randomBytes(16);
}

export function encryptAES(payload, key, iv, padding) {
    payload = bufferToWordArray(payload);
    key = bufferToWordArray(key);
    iv = bufferToWordArray(iv);
    let ciphertext = CryptoJS.AES.encrypt(payload, key,
        {
            iv: iv,
            mode: CryptoJS.mode.CBC,
            padding: padding || CryptoJS.pad.NoPadding
        }).ciphertext;

    return wordArrayToBuffer(ciphertext);
}

export function decryptAES(payload, key, iv, padding) {
    payload = bufferToWordArray(payload);
    key = bufferToWordArray(key);
    iv = bufferToWordArray(iv);
    padding = padding || CryptoJS.pad.NoPadding;
    let decrypted = CryptoJS.AES.decrypt({ ciphertext: payload }, key,
        { iv: iv, mode: CryptoJS.mode.CBC, padding: padding });

    return wordArrayToBuffer(decrypted);
}

export function privateKeyToAddress(privateKey) {
    var t = ethereumjsUtil.privateToPublic(privateKey);
    return "0x" + ethereumjsUtil.publicToAddress(t).toString("hex");
}

export function signMessage(message, key) {
    if (32 !== message.length)
        throw new Error("Message must be 32 bytes!");
    var n = ethereumjsUtil.ecsign(message, key);
    return ethereumjsUtil.toRpcSig(n.v, n.r, n.s)
}

export function hashAndSignMessage(message, key) {
    let hash = ethereumjsUtil.keccak(message, 256);
    return signMessage(hash, key);
}
