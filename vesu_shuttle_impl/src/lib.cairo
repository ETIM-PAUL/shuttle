#[starknet::contract]
mod VesuVaultInteraction {
    use starknet::{
        ContractAddress, get_caller_address, get_contract_address
    };
    use starknet::storage::{
        Map,
        StoragePointerReadAccess,
        StoragePointerWriteAccess,
        StorageMapReadAccess,
        StorageMapWriteAccess,
    };
    use super::{IVesuVaultDispatcherTrait, IERC20DispatcherTrait};

    // ============ STORAGE ============
    #[storage]
    struct Storage {
        vesu_vault: ContractAddress, // Address of the Vesu vWBTC contract
        wbtc_token: ContractAddress, // Address of the underlying WBTC token
        user_total_deposited: Map<ContractAddress, u256>,
        user_total_withdrawn: Map<ContractAddress, u256>,
        user_total_redeemed: Map<ContractAddress, u256>,
    }

    // ============ EVENTS ============
    #[event]
    #[derive(Drop, starknet::Event)]
    enum Event {
        DepositMade: DepositMade,
        WithdrawalMade: WithdrawalMade,
        RedemptionMade: RedemptionMade,
    }

    #[derive(Drop, starknet::Event)]
    struct DepositMade {
        #[key]
        user: ContractAddress,
        assets: u256,
        shares: u256,
    }

    #[derive(Drop, starknet::Event)]
    struct WithdrawalMade {
        #[key]
        user: ContractAddress,
        assets: u256,
        shares: u256,
    }

    #[derive(Drop, starknet::Event)]
    struct RedemptionMade {
        #[key]
        user: ContractAddress,
        shares: u256,
        assets: u256,
    }

    // ============ CONSTRUCTOR ============
    #[constructor]
    fn constructor(
        ref self: ContractState,
        vesu_vault_address: ContractAddress,
        wbtc_token_address: ContractAddress,
    ) {
        self.vesu_vault.write(vesu_vault_address);
        self.wbtc_token.write(wbtc_token_address);
    }

    // ============ IMPLEMENTATION ============
    #[abi(embed_v0)]
    impl VesuVaultInteractionImpl of super::IVesuVaultInteraction<ContractState> {
        // ----- READ FUNCTIONS -----
        fn get_user_total_deposited(self: @ContractState, user: ContractAddress) -> u256 {
            self.user_total_deposited.read(user)
        }

        fn get_user_total_withdrawn(self: @ContractState, user: ContractAddress) -> u256 {
            self.user_total_withdrawn.read(user)
        }

        fn get_user_total_redeemed(self: @ContractState, user: ContractAddress) -> u256 {
            self.user_total_redeemed.read(user)
        }

        // ----- WRITE FUNCTIONS -----
        fn deposit_to_vesu(ref self: ContractState, assets: u256) -> u256 {
            assert(assets > 0, 'Amount must be greater than 0');

            let caller = get_caller_address();
            let this_contract = get_contract_address();
            let vault_address = self.vesu_vault.read();
            let wbtc_address = self.wbtc_token.read();

            // Transfer WBTC from user to this contract
            let wbtc_token = super::IERC20Dispatcher { contract_address: wbtc_address };
            let transfer_success = wbtc_token.transfer_from(caller, this_contract, assets);
            assert(transfer_success, 'WBTC transfer failed');

            // Approve vault
            let approve_success = wbtc_token.approve(vault_address, assets);
            assert(approve_success, 'Approval failed');

            // Deposit into Vesu vault
            let vault = super::IVesuVaultDispatcher { contract_address: vault_address };
            let shares = vault.deposit(assets, caller);

            // Update totals
            let current_deposited = self.user_total_deposited.read(caller);
            self.user_total_deposited.write(caller, current_deposited + assets);

            self.emit(DepositMade { user: caller, assets, shares });
            shares
        }

        fn withdraw_from_vesu(ref self: ContractState, assets: u256) -> u256 {
            assert(assets > 0, 'Amount must be greater than 0');

            let caller = get_caller_address();
            let vault_address = self.vesu_vault.read();

            let vault = super::IVesuVaultDispatcher { contract_address: vault_address };
            let shares = vault.withdraw(assets, caller, caller);

            let current_withdrawn = self.user_total_withdrawn.read(caller);
            self.user_total_withdrawn.write(caller, current_withdrawn + assets);

            self.emit(WithdrawalMade { user: caller, assets, shares });
            shares
        }

        fn redeem_from_vesu(ref self: ContractState, shares: u256) -> u256 {
            assert(shares > 0, 'Shares must be greater than 0');

            let caller = get_caller_address();
            let vault_address = self.vesu_vault.read();

            let vault = super::IVesuVaultDispatcher { contract_address: vault_address };
            let assets = vault.redeem(shares, caller, caller);

            let current_redeemed = self.user_total_redeemed.read(caller);
            self.user_total_redeemed.write(caller, current_redeemed + assets);

            self.emit(RedemptionMade { user: caller, shares, assets });
            assets
        }

        // ----- HELPERS -----
        fn approve_wbtc_for_vault(ref self: ContractState, amount: u256) -> bool {
            let vault_address = self.vesu_vault.read();
            let wbtc_address = self.wbtc_token.read();
            let wbtc_token = super::IERC20Dispatcher { contract_address: wbtc_address };
            wbtc_token.approve(vault_address, amount)
        }

        fn get_vesu_vault_address(self: @ContractState) -> ContractAddress {
            self.vesu_vault.read()
        }

        fn get_wbtc_address(self: @ContractState) -> ContractAddress {
            self.wbtc_token.read()
        }
    }
}

// ============ INTERFACES ============
#[starknet::interface]
trait IVesuVaultInteraction<TContractState> {
    fn get_user_total_deposited(self: @TContractState, user: ContractAddress) -> u256;
    fn get_user_total_withdrawn(self: @TContractState, user: ContractAddress) -> u256;
    fn get_user_total_redeemed(self: @TContractState, user: ContractAddress) -> u256;

    fn deposit_to_vesu(ref self: TContractState, assets: u256) -> u256;
    fn withdraw_from_vesu(ref self: TContractState, assets: u256) -> u256;
    fn redeem_from_vesu(ref self: TContractState, shares: u256) -> u256;

    fn approve_wbtc_for_vault(ref self: TContractState, amount: u256) -> bool;
    fn get_vesu_vault_address(self: @TContractState) -> ContractAddress;
    fn get_wbtc_address(self: @TContractState) -> ContractAddress;
}

#[starknet::interface]
trait IVesuVault<TContractState> {
    fn deposit(ref self: TContractState, assets: u256, receiver: ContractAddress) -> u256;
    fn withdraw(
        ref self: TContractState,
        assets: u256,
        receiver: ContractAddress,
        owner: ContractAddress
    ) -> u256;
    fn redeem(
        ref self: TContractState,
        shares: u256,
        receiver: ContractAddress,
        owner: ContractAddress
    ) -> u256;
}

#[starknet::interface]
trait IERC20<TContractState> {
    fn transfer(ref self: TContractState, recipient: ContractAddress, amount: u256) -> bool;
    fn transfer_from(
        ref self: TContractState,
        sender: ContractAddress,
        recipient: ContractAddress,
        amount: u256
    ) -> bool;
    fn approve(ref self: TContractState, spender: ContractAddress, amount: u256) -> bool;
    fn allowance(self: @TContractState, owner: ContractAddress, spender: ContractAddress) -> u256;
}

use starknet::ContractAddress;
