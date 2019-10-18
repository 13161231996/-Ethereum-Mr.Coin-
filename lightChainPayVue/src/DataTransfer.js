import BigNumber from 'bignumber.js'

export function toClientChannelData(serverChannelData) {
    let decimals = serverChannelData.decimals;
    let clientData = { ...serverChannelData };
    clientData.deposit = new BigNumber(clientData.depositText)
    clientData.depositDisplay = clientData
        .deposit.shift(-decimals).toString();
    clientData.totalEscrowed = new BigNumber(clientData.totalEscrowedText)
    clientData.totalEscrowedDisplay = clientData
        .totalEscrowed.shift(-decimals).toString();
    clientData.totalReleased = new BigNumber(clientData.totalReleasedText)
    clientData.totalReleasedDisplay = clientData
        .totalReleased.shift(-decimals).toString();

    if (!clientData.payments) {
        clientData.payments = [];
    }
    clientData.payments.forEach(p => {
        p.amount = new BigNumber(p.amountText);
        p.amountDisplay = p.amount.shift(-decimals).toString();
    });
    return clientData;
}

export function toClientChannelRequestData(serverChannelRequestData) {
    let decimals = serverChannelRequestData.decimals;
    let clientData = { ...serverChannelRequestData };
    clientData.amount = new BigNumber(clientData.amountText)
    clientData.amountDisplay = clientData
        .amount.shift(-decimals).toString();

    return clientData;
}

export function toClientTrustedWalletSummaryData(
    serverTrustedWalletSummaryData, exchangeRates) {

    exchangeRates = exchangeRates.filter(er =>
        er.tokenCode == serverTrustedWalletSummaryData.tokenCode);
    let exchangeRate = new BigNumber(1);
    if (exchangeRates.length > 0) {
        exchangeRate = new BigNumber(exchangeRates[0].rate);
    }

    let decimals = serverTrustedWalletSummaryData.decimals;
    let clientData = { ...serverTrustedWalletSummaryData };

    clientData.deposit = new BigNumber(clientData.depositText)
    clientData.depositDisplay = clientData
        .deposit.shift(-decimals).toString();

    clientData.sentValue = new BigNumber(clientData.sentValueText)
    clientData.sentValueDisplay = clientData
        .sentValue.shift(-decimals).toString();

    clientData.senderBalance = clientData.deposit.minus(clientData.sentValue);
    clientData.senderBalanceDisplay = clientData
        .senderBalance.shift(-decimals).toFixed(2);

    clientData.receivedValue = new BigNumber(clientData.receivedValueText)
    clientData.receivedValueDisplay = clientData
        .receivedValue.shift(-decimals).toString();

    clientData.receiverWithdrawn = new BigNumber(clientData.receiverWithdrawnText)
    clientData.receiverWithdrawnDisplay = clientData
        .receiverWithdrawn.shift(-decimals).toString();

    clientData.receiverBalance = clientData.receivedValue.minus(clientData.receiverWithdrawn);
    clientData.receiverBalanceDisplay = clientData
        .senderBalance.shift(-decimals).toString();

    clientData.senderCurrencyBalance = new BigNumber(clientData.senderBalanceDisplay)
        .times(exchangeRate).toFixed(2);

    return clientData;
}
export function toClientTrustedWalletTransactionData(serverTrustedWalletTransactionData) {
    let decimals = serverTrustedWalletTransactionData.decimals;
    let clientData = { ...serverTrustedWalletTransactionData };

    clientData.tokenAmount = new BigNumber(clientData.tokenAmountText)
    clientData.tokenAmountDisplay = clientData
        .tokenAmount.shift(-decimals).toString();

    clientData.receiverBalance = new BigNumber(clientData.receiverBalanceText)
    clientData.receiverBalanceDisplay = clientData
        .receiverBalance.shift(-decimals).toString();

    return clientData;
}
