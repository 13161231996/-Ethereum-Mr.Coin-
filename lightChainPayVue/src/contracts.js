export let tokenABI = [{ "constant": true, "inputs": [], "name": "name", "outputs": [{ "name": "", "type": "string" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": false, "inputs": [{ "name": "_spender", "type": "address" }, { "name": "_value", "type": "uint256" }], "name": "approve", "outputs": [{ "name": "", "type": "bool" }], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": false, "inputs": [], "name": "mint", "outputs": [], "payable": true, "stateMutability": "payable", "type": "function" }, { "constant": true, "inputs": [], "name": "totalSupply", "outputs": [{ "name": "", "type": "uint256" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [], "name": "multiplier", "outputs": [{ "name": "", "type": "uint256" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": false, "inputs": [{ "name": "_from", "type": "address" }, { "name": "_to", "type": "address" }, { "name": "_value", "type": "uint256" }], "name": "transferFrom", "outputs": [{ "name": "", "type": "bool" }], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": true, "inputs": [], "name": "decimals", "outputs": [{ "name": "", "type": "uint8" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": false, "inputs": [], "name": "transferFunds", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": false, "inputs": [], "name": "kill", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": true, "inputs": [], "name": "version", "outputs": [{ "name": "", "type": "string" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [{ "name": "_owner", "type": "address" }], "name": "balanceOf", "outputs": [{ "name": "", "type": "uint256" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [], "name": "owner_address", "outputs": [{ "name": "", "type": "address" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [], "name": "symbol", "outputs": [{ "name": "", "type": "string" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": false, "inputs": [{ "name": "_to", "type": "address" }, { "name": "_value", "type": "uint256" }], "name": "transfer", "outputs": [{ "name": "", "type": "bool" }], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": true, "inputs": [{ "name": "_owner", "type": "address" }, { "name": "_spender", "type": "address" }], "name": "allowance", "outputs": [{ "name": "", "type": "uint256" }], "payable": false, "stateMutability": "view", "type": "function" }, { "inputs": [{ "name": "initial_supply", "type": "uint256" }, { "name": "token_name", "type": "string" }, { "name": "token_symbol", "type": "string" }, { "name": "decimal_units", "type": "uint8" }], "payable": false, "stateMutability": "nonpayable", "type": "constructor" }, { "anonymous": false, "inputs": [{ "indexed": true, "name": "_to", "type": "address" }, { "indexed": true, "name": "_num", "type": "uint256" }], "name": "Minted", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": true, "name": "_from", "type": "address" }, { "indexed": true, "name": "_to", "type": "address" }, { "indexed": false, "name": "_value", "type": "uint256" }], "name": "Transfer", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": true, "name": "_owner", "type": "address" }, { "indexed": true, "name": "_spender", "type": "address" }, { "indexed": false, "name": "_value", "type": "uint256" }], "name": "Approval", "type": "event" }];
export let channelABI = [
	{
		"constant": false,
		"inputs": [
			{
				"name": "_witness",
				"type": "address"
			}
		],
		"name": "addWitness",
		"outputs": [],
		"payable": false,
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"constant": false,
		"inputs": [
			{
				"name": "_sender_address",
				"type": "address"
			},
			{
				"name": "_receiver_address",
				"type": "address"
			},
			{
				"name": "_open_block_number",
				"type": "uint32"
			},
			{
				"name": "_total_escrowed",
				"type": "uint192"
			},
			{
				"name": "_total_released",
				"type": "uint192"
			},
			{
				"name": "_witness_closing_sig",
				"type": "bytes"
			}
		],
		"name": "cooperativeClose",
		"outputs": [],
		"payable": false,
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"constant": false,
		"inputs": [
			{
				"name": "_receiver_address",
				"type": "address"
			},
			{
				"name": "_deposit",
				"type": "uint192"
			}
		],
		"name": "createChannel",
		"outputs": [],
		"payable": false,
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"constant": false,
		"inputs": [
			{
				"name": "_sender_address",
				"type": "address"
			},
			{
				"name": "_receiver_address",
				"type": "address"
			},
			{
				"name": "_open_block_number",
				"type": "uint32"
			},
			{
				"name": "_sender_percent",
				"type": "uint8"
			}
		],
		"name": "disputeResolve",
		"outputs": [],
		"payable": false,
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"constant": false,
		"inputs": [],
		"name": "kill",
		"outputs": [],
		"payable": false,
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"constant": false,
		"inputs": [
			{
				"name": "_sender_address",
				"type": "address"
			},
			{
				"name": "_receiver_address",
				"type": "address"
			},
			{
				"name": "_deposit",
				"type": "uint192"
			},
			{
				"name": "_sender_sig",
				"type": "bytes"
			}
		],
		"name": "proxyCreateChannel",
		"outputs": [],
		"payable": false,
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"constant": false,
		"inputs": [
			{
				"name": "_principal_address",
				"type": "address"
			},
			{
				"name": "_value",
				"type": "uint192"
			}
		],
		"name": "proxyWalletTopUp",
		"outputs": [],
		"payable": false,
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"constant": false,
		"inputs": [
			{
				"name": "_sender_address",
				"type": "address"
			},
			{
				"name": "_receiver_address",
				"type": "address"
			},
			{
				"name": "_open_block_number",
				"type": "uint32"
			}
		],
		"name": "settle",
		"outputs": [],
		"payable": false,
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"constant": false,
		"inputs": [
			{
				"name": "_value",
				"type": "uint192"
			}
		],
		"name": "walletTopUp",
		"outputs": [],
		"payable": false,
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"name": "_token_address",
				"type": "address"
			},
			{
				"name": "_challenge_period",
				"type": "uint32"
			}
		],
		"payable": false,
		"stateMutability": "nonpayable",
		"type": "constructor"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"name": "_sender_address",
				"type": "address"
			},
			{
				"indexed": false,
				"name": "_value",
				"type": "uint256"
			}
		],
		"name": "WalletToppedUp",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"name": "_sender_address",
				"type": "address"
			},
			{
				"indexed": true,
				"name": "_receiver_address",
				"type": "address"
			},
			{
				"indexed": false,
				"name": "_deposit",
				"type": "uint192"
			}
		],
		"name": "ChannelCreated",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"name": "_sender_address",
				"type": "address"
			},
			{
				"indexed": true,
				"name": "_receiver_address",
				"type": "address"
			},
			{
				"indexed": true,
				"name": "_open_block_number",
				"type": "uint32"
			},
			{
				"indexed": false,
				"name": "_total_escrowed",
				"type": "uint192"
			},
			{
				"indexed": false,
				"name": "_total_released",
				"type": "uint192"
			},
			{
				"indexed": false,
				"name": "_receiver_tokens",
				"type": "uint192"
			}
		],
		"name": "ChannelSettled",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"name": "_sender_address",
				"type": "address"
			},
			{
				"indexed": true,
				"name": "_receiver_address",
				"type": "address"
			},
			{
				"indexed": true,
				"name": "_open_block_number",
				"type": "uint32"
			},
			{
				"indexed": false,
				"name": "_withdrawn_balance",
				"type": "uint192"
			}
		],
		"name": "ChannelWithdrawn",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"name": "_sender_address",
				"type": "address"
			},
			{
				"indexed": true,
				"name": "_receiver_address",
				"type": "address"
			},
			{
				"indexed": true,
				"name": "_open_block_number",
				"type": "uint32"
			},
			{
				"indexed": false,
				"name": "_sender_percent",
				"type": "uint8"
			}
		],
		"name": "DisputeResolved",
		"type": "event"
	},
	{
		"constant": true,
		"inputs": [],
		"name": "challenge_period",
		"outputs": [
			{
				"name": "",
				"type": "uint32"
			}
		],
		"payable": false,
		"stateMutability": "view",
		"type": "function"
	},
	{
		"constant": true,
		"inputs": [],
		"name": "channel_deposit_limit",
		"outputs": [
			{
				"name": "",
				"type": "uint256"
			}
		],
		"payable": false,
		"stateMutability": "view",
		"type": "function"
	},
	{
		"constant": true,
		"inputs": [
			{
				"name": "",
				"type": "bytes32"
			}
		],
		"name": "channels",
		"outputs": [
			{
				"name": "deposit",
				"type": "uint192"
			},
			{
				"name": "open_block_number",
				"type": "uint32"
			}
		],
		"payable": false,
		"stateMutability": "view",
		"type": "function"
	},
	{
		"constant": true,
		"inputs": [
			{
				"name": "",
				"type": "bytes32"
			}
		],
		"name": "closing_requests",
		"outputs": [
			{
				"name": "is_from_sender",
				"type": "bool"
			},
			{
				"name": "is_proofed",
				"type": "bool"
			},
			{
				"name": "closing_total_escrowed",
				"type": "uint192"
			},
			{
				"name": "closing_total_released",
				"type": "uint192"
			},
			{
				"name": "settle_block_number",
				"type": "uint32"
			}
		],
		"payable": false,
		"stateMutability": "view",
		"type": "function"
	},
	{
		"constant": true,
		"inputs": [
			{
				"name": "",
				"type": "bytes32"
			}
		],
		"name": "dispute_escrows",
		"outputs": [
			{
				"name": "",
				"type": "uint192"
			}
		],
		"payable": false,
		"stateMutability": "view",
		"type": "function"
	},
	{
		"constant": true,
		"inputs": [
			{
				"name": "_sender_address",
				"type": "address"
			},
			{
				"name": "_receiver_address",
				"type": "address"
			},
			{
				"name": "_nonce",
				"type": "uint32"
			},
			{
				"name": "_deposit",
				"type": "uint192"
			},
			{
				"name": "_sig",
				"type": "bytes"
			}
		],
		"name": "extractCreateChannelSignature",
		"outputs": [
			{
				"name": "",
				"type": "address"
			}
		],
		"payable": false,
		"stateMutability": "view",
		"type": "function"
	},
	{
		"constant": true,
		"inputs": [
			{
				"name": "_sender_address",
				"type": "address"
			},
			{
				"name": "_receiver_address",
				"type": "address"
			},
			{
				"name": "_open_block_number",
				"type": "uint32"
			},
			{
				"name": "_total_escrowed",
				"type": "uint192"
			},
			{
				"name": "_total_released",
				"type": "uint192"
			},
			{
				"name": "_witness_closing_sig",
				"type": "bytes"
			}
		],
		"name": "extractWitnessClosingSignature",
		"outputs": [
			{
				"name": "",
				"type": "address"
			}
		],
		"payable": false,
		"stateMutability": "view",
		"type": "function"
	},
	{
		"constant": true,
		"inputs": [
			{
				"name": "_sender_address",
				"type": "address"
			},
			{
				"name": "_receiver_address",
				"type": "address"
			},
			{
				"name": "_open_block_number",
				"type": "uint32"
			},
			{
				"name": "_total_escrowed",
				"type": "uint192"
			},
			{
				"name": "_total_released",
				"type": "uint192"
			},
			{
				"name": "_witness_proof_sig",
				"type": "bytes"
			}
		],
		"name": "extractWitnessProofSignature",
		"outputs": [
			{
				"name": "",
				"type": "address"
			}
		],
		"payable": false,
		"stateMutability": "view",
		"type": "function"
	},
	{
		"constant": true,
		"inputs": [
			{
				"name": "_sender_address",
				"type": "address"
			},
			{
				"name": "_receiver_address",
				"type": "address"
			},
			{
				"name": "_open_block_number",
				"type": "uint32"
			}
		],
		"name": "getChannelInfo",
		"outputs": [
			{
				"name": "",
				"type": "bytes32"
			},
			{
				"name": "",
				"type": "uint192"
			},
			{
				"name": "",
				"type": "uint32"
			},
			{
				"name": "",
				"type": "uint192"
			},
			{
				"name": "",
				"type": "uint192"
			},
			{
				"name": "",
				"type": "uint192"
			}
		],
		"payable": false,
		"stateMutability": "view",
		"type": "function"
	},
	{
		"constant": true,
		"inputs": [
			{
				"name": "_sender_address",
				"type": "address"
			},
			{
				"name": "_receiver_address",
				"type": "address"
			},
			{
				"name": "_open_block_number",
				"type": "uint32"
			}
		],
		"name": "getKey",
		"outputs": [
			{
				"name": "data",
				"type": "bytes32"
			}
		],
		"payable": false,
		"stateMutability": "pure",
		"type": "function"
	},
	{
		"constant": true,
		"inputs": [],
		"name": "owner_address",
		"outputs": [
			{
				"name": "",
				"type": "address"
			}
		],
		"payable": false,
		"stateMutability": "view",
		"type": "function"
	},
	{
		"constant": true,
		"inputs": [],
		"name": "token",
		"outputs": [
			{
				"name": "",
				"type": "address"
			}
		],
		"payable": false,
		"stateMutability": "view",
		"type": "function"
	},
	{
		"constant": true,
		"inputs": [
			{
				"name": "",
				"type": "address"
			}
		],
		"name": "token_wallets",
		"outputs": [
			{
				"name": "balance",
				"type": "uint192"
			},
			{
				"name": "channel_nonce",
				"type": "uint32"
			}
		],
		"payable": false,
		"stateMutability": "view",
		"type": "function"
	},
	{
		"constant": true,
		"inputs": [],
		"name": "version",
		"outputs": [
			{
				"name": "",
				"type": "string"
			}
		],
		"payable": false,
		"stateMutability": "view",
		"type": "function"
	},
	{
		"constant": true,
		"inputs": [
			{
				"name": "",
				"type": "bytes32"
			}
		],
		"name": "withdrawn_balances",
		"outputs": [
			{
				"name": "",
				"type": "uint192"
			}
		],
		"payable": false,
		"stateMutability": "view",
		"type": "function"
	},
	{
		"constant": true,
		"inputs": [
			{
				"name": "",
				"type": "uint256"
			}
		],
		"name": "witnesses",
		"outputs": [
			{
				"name": "",
				"type": "address"
			}
		],
		"payable": false,
		"stateMutability": "view",
		"type": "function"
	}
];

export let lightChainTrustedWalletsABI = [
	{
		"constant": true,
		"inputs": [],
		"name": "channel_deposit_limit",
		"outputs": [
			{
				"name": "",
				"type": "uint256"
			}
		],
		"payable": false,
		"stateMutability": "view",
		"type": "function"
	},
	{
		"constant": false,
		"inputs": [],
		"name": "kill",
		"outputs": [],
		"payable": false,
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"constant": false,
		"inputs": [
			{
				"name": "_value",
				"type": "uint256"
			}
		],
		"name": "topUp",
		"outputs": [],
		"payable": false,
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"constant": true,
		"inputs": [
			{
				"name": "",
				"type": "address"
			}
		],
		"name": "withdrawn_balances",
		"outputs": [
			{
				"name": "",
				"type": "uint256"
			}
		],
		"payable": false,
		"stateMutability": "view",
		"type": "function"
	},
	{
		"constant": true,
		"inputs": [],
		"name": "version",
		"outputs": [
			{
				"name": "",
				"type": "string"
			}
		],
		"payable": false,
		"stateMutability": "view",
		"type": "function"
	},
	{
		"constant": true,
		"inputs": [],
		"name": "owner_address",
		"outputs": [
			{
				"name": "",
				"type": "address"
			}
		],
		"payable": false,
		"stateMutability": "view",
		"type": "function"
	},
	{
		"constant": false,
		"inputs": [
			{
				"name": "_value",
				"type": "uint256"
			},
			{
				"name": "_balance",
				"type": "uint256"
			},
			{
				"name": "_sig",
				"type": "bytes"
			}
		],
		"name": "Withdraw",
		"outputs": [],
		"payable": false,
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"constant": true,
		"inputs": [],
		"name": "token",
		"outputs": [
			{
				"name": "",
				"type": "address"
			}
		],
		"payable": false,
		"stateMutability": "view",
		"type": "function"
	},
	{
		"constant": true,
		"inputs": [
			{
				"name": "",
				"type": "address"
			}
		],
		"name": "deposits",
		"outputs": [
			{
				"name": "",
				"type": "uint256"
			}
		],
		"payable": false,
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"name": "_token_address",
				"type": "address"
			}
		],
		"payable": false,
		"stateMutability": "nonpayable",
		"type": "constructor"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"name": "_sender_address",
				"type": "address"
			},
			{
				"indexed": false,
				"name": "_value",
				"type": "uint256"
			}
		],
		"name": "WalletToppedUp",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"name": "_receiver_address",
				"type": "address"
			},
			{
				"indexed": false,
				"name": "_value",
				"type": "uint256"
			}
		],
		"name": "WalletWithdraw",
		"type": "event"
	}
];
