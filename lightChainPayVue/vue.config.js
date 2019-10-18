module.exports = {
    filenameHashing: false,
    //outputDir: "../../WorldPayPrototype/wwwroot/sender-app",
    pages: {
        senderApp: {
            entry: 'src/senderAppMain.js'
        },
        receiverApp: {
            entry: 'src/receiverAppMain.js'
        },
        walletMonitorApp: {            
            entry: 'src/wallet-monitor/main.js'
        },
        // trustedWalletApp: {            
        //     entry: 'src/trusted-wallet/main.js'
        // },
        channelDashboardApp: {            
            entry: 'src/channel-dashboard/main.js'
        },
        orderServiceApp:{
            entry:'src/order-service/main.js'
        }
    }
}