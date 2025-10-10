export const VESU_IMPL_ABI = [
    {
      "type": "impl",
      "name": "VesuVaultInteractionImpl",
      "interface_name": "vesu_shuttle::IVesuVaultInteraction"
    },
    {
      "type": "struct",
      "name": "core::integer::u256",
      "members": [
        {
          "name": "low",
          "type": "core::integer::u128"
        },
        {
          "name": "high",
          "type": "core::integer::u128"
        }
      ]
    },
    {
      "type": "enum",
      "name": "core::bool",
      "variants": [
        {
          "name": "False",
          "type": "()"
        },
        {
          "name": "True",
          "type": "()"
        }
      ]
    },
    {
      "type": "interface",
      "name": "vesu_shuttle::IVesuVaultInteraction",
      "items": [
        {
          "type": "function",
          "name": "get_user_total_deposited",
          "inputs": [
            {
              "name": "user",
              "type": "core::starknet::contract_address::ContractAddress"
            }
          ],
          "outputs": [
            {
              "type": "core::integer::u256"
            }
          ],
          "state_mutability": "view"
        },
        {
          "type": "function",
          "name": "get_user_total_withdrawn",
          "inputs": [
            {
              "name": "user",
              "type": "core::starknet::contract_address::ContractAddress"
            }
          ],
          "outputs": [
            {
              "type": "core::integer::u256"
            }
          ],
          "state_mutability": "view"
        },
        {
          "type": "function",
          "name": "get_user_total_redeemed",
          "inputs": [
            {
              "name": "user",
              "type": "core::starknet::contract_address::ContractAddress"
            }
          ],
          "outputs": [
            {
              "type": "core::integer::u256"
            }
          ],
          "state_mutability": "view"
        },
        {
          "type": "function",
          "name": "deposit_to_vesu",
          "inputs": [
            {
              "name": "assets",
              "type": "core::integer::u256"
            }
          ],
          "outputs": [
            {
              "type": "core::integer::u256"
            }
          ],
          "state_mutability": "external"
        },
        {
          "type": "function",
          "name": "withdraw_from_vesu",
          "inputs": [
            {
              "name": "assets",
              "type": "core::integer::u256"
            }
          ],
          "outputs": [
            {
              "type": "core::integer::u256"
            }
          ],
          "state_mutability": "external"
        },
        {
          "type": "function",
          "name": "redeem_from_vesu",
          "inputs": [
            {
              "name": "shares",
              "type": "core::integer::u256"
            }
          ],
          "outputs": [
            {
              "type": "core::integer::u256"
            }
          ],
          "state_mutability": "external"
        },
        {
          "type": "function",
          "name": "approve_wbtc_for_vault",
          "inputs": [
            {
              "name": "amount",
              "type": "core::integer::u256"
            }
          ],
          "outputs": [
            {
              "type": "core::bool"
            }
          ],
          "state_mutability": "external"
        },
        {
          "type": "function",
          "name": "get_vesu_vault_address",
          "inputs": [],
          "outputs": [
            {
              "type": "core::starknet::contract_address::ContractAddress"
            }
          ],
          "state_mutability": "view"
        },
        {
          "type": "function",
          "name": "get_wbtc_address",
          "inputs": [],
          "outputs": [
            {
              "type": "core::starknet::contract_address::ContractAddress"
            }
          ],
          "state_mutability": "view"
        }
      ]
    },
    {
      "type": "constructor",
      "name": "constructor",
      "inputs": [
        {
          "name": "vesu_vault_address",
          "type": "core::starknet::contract_address::ContractAddress"
        },
        {
          "name": "wbtc_token_address",
          "type": "core::starknet::contract_address::ContractAddress"
        }
      ]
    },
    {
      "type": "event",
      "name": "vesu_shuttle::VesuVaultInteraction::DepositMade",
      "kind": "struct",
      "members": [
        {
          "name": "user",
          "type": "core::starknet::contract_address::ContractAddress",
          "kind": "key"
        },
        {
          "name": "assets",
          "type": "core::integer::u256",
          "kind": "data"
        },
        {
          "name": "shares",
          "type": "core::integer::u256",
          "kind": "data"
        }
      ]
    },
    {
      "type": "event",
      "name": "vesu_shuttle::VesuVaultInteraction::WithdrawalMade",
      "kind": "struct",
      "members": [
        {
          "name": "user",
          "type": "core::starknet::contract_address::ContractAddress",
          "kind": "key"
        },
        {
          "name": "assets",
          "type": "core::integer::u256",
          "kind": "data"
        },
        {
          "name": "shares",
          "type": "core::integer::u256",
          "kind": "data"
        }
      ]
    },
    {
      "type": "event",
      "name": "vesu_shuttle::VesuVaultInteraction::RedemptionMade",
      "kind": "struct",
      "members": [
        {
          "name": "user",
          "type": "core::starknet::contract_address::ContractAddress",
          "kind": "key"
        },
        {
          "name": "shares",
          "type": "core::integer::u256",
          "kind": "data"
        },
        {
          "name": "assets",
          "type": "core::integer::u256",
          "kind": "data"
        }
      ]
    },
    {
      "type": "event",
      "name": "vesu_shuttle::VesuVaultInteraction::Event",
      "kind": "enum",
      "variants": [
        {
          "name": "DepositMade",
          "type": "vesu_shuttle::VesuVaultInteraction::DepositMade",
          "kind": "nested"
        },
        {
          "name": "WithdrawalMade",
          "type": "vesu_shuttle::VesuVaultInteraction::WithdrawalMade",
          "kind": "nested"
        },
        {
          "name": "RedemptionMade",
          "type": "vesu_shuttle::VesuVaultInteraction::RedemptionMade",
          "kind": "nested"
        }
      ]
    }
  ];