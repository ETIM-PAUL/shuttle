# Shuttle - Bitcoin Yield Platform

A modern DeFi platform that enables users to bridge Bitcoin to Starknet and deploy it to yield-generating protocols in a single flow.

## 🌐 Live Demo - https://www.loom.com/share/516ade566cf44f93a0e2af8e9c99aeb0?sid=a154d135-1942-4da1-ac4f-2cdcb8da542b

**[Launch Application →](https://your-shuttle-app.vercel.app)**

## 📖 Description

Shuttle Frontend is a Vute-based web application that simplifies the process of earning yield on Bitcoin. It allows users to:

- **Bridge Bitcoin to Wrapped Bitcoin (WBTC)** on Starknet using Atomiq Labs SDK
- **Deploy to yield protocols** like Vesu Lending and Troves Vault
- **Monitor portfolio** performance and balances

The platform integrates with Xverse wallet for Bitcoin transactions and for L2 interactions, providing a seamless cross-chain experience.

---

## 🎯 Key Features

### Core Functionality
- 🔄 **One-Click Bridge & Deploy**: Bridge BTC → WBTC → Protocol in a single flow
- 💰 **Multi-Protocol Support**: Vesu Lending (Prime & Re7xBTC) and Troves Vault (WBTC Evergreen)
- 📊 **Real-Time APY Display**: Live interest rates and protocol statistics
- 🔐 **Non-Custodial**: Users maintain full control of their assets
- 📱 **Responsive Design**: Optimized for desktop and mobile devices
- 🔐 **Swap Back**: Users can swap back their WBTC to BTC in cases of network or power outage while depositing WBTC to a protocol. 

### Wallet Integration
- 🦊 **Xverse Wallet**: Bitcoin transaction signing, BTC balances and prize.

### DeFi Features
- 📈 **Yield Farming**: Automated strategies via Troves
- 🏦 **Lending Markets**: Supply WBTC on Vesu for interest
- 💱 **Swap Back to BTC**: Redeem positions and bridge back

---

## 🏗️ Architecture & Flow

### User Journey Flow

```
1. Connect Wallet
   └─ Xverse (Bitcoin) + Starknet Wallet
   
2. Bridge & Deploy
   ├─ Input BTC Amount
   ├─ Select Protocol (Vesu/Troves)
   ├─ Choose Pool/Strategy
   └─ Confirm Transaction
   
3. Transaction Processing
   ├─ BTC → WBTC Bridge (Atomiq)
   │  └─ ~20-50 minutes (Bitcoin confirmations)
   ├─ Deploy to Starknet Protocol
   │  └─ ~2-5 minutes (L2 finality)
   └─ Yield Position Active
   
4. Portfolio Management
   ├─ View Balances
   └─ Track APY/Returns
```

### Technical Stack Diagram

```
┌─────────────────────────────────────────────┐
│           Frontend (React + Vite)           │
├─────────────────────────────────────────────┤
│  • React Router (Navigation)                │
│  • Redux Toolkit (State Management)         │
│  • Tailwind CSS (Styling)                   │
└─────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────┐
│         Wallet & Blockchain SDKs            │
├─────────────────────────────────────────────┤
│  • Sats Connect (Xverse)                    │
│  • @starknet-io/get-starknet                │
│  • @atomiqlabs/sdk (Bridge)                 │
│  • Starknet.js (Contract Interactions)      │
└─────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────┐
│          Blockchain Networks                │
├─────────────────────────────────────────────┤
│  Bitcoin Mainnet ←→ Atomiq Bridge ←→ Starknet│
│                                             │
│  Protocols: Vesu, Troves                    │
└─────────────────────────────────────────────┘
```

---

## 🛠️ Technology Stack

### Frontend Framework
- **React 19.1.1** - UI library
- **Vite 7.1.7** - Build tool and dev server
- **React Router 6.0.2** - Client-side routing
- **React Helmet** - Document head management

### State Management
- **Redux Toolkit 2.6.1** - Global state
- **React Context API** - Wallet and protocol state

### Styling
- **Tailwind CSS 4.1.13** - Utility-first CSS
- **Framer Motion 10.16.4** - Animations
- **Lucide React 0.484.0** - Icon library
- **CVA** - Class variance authority for component variants

### Blockchain & Web3
- **Starknet.js 7.1.0** - Starknet interactions
- **Sats Connect 4.1.x** - Xverse wallet integration
- **@atomiqlabs/sdk 6.0.3** - Bitcoin ↔ Starknet bridge
- **@scure/btc-signer 2.0.1** - Bitcoin transaction signing
- **Viem 2.38.0** - Ethereum utilities

### UI Components
- **Radix UI** - Headless UI primitives
- **React Hot Toast 2.6.0** - Notifications

### Development Tools
- **PostCSS** - CSS processing
- **Autoprefixer** - CSS vendor prefixes
- **Vite Plugin Node Polyfills** - Node.js compatibility

---

## 📦 Installation & Setup

### Prerequisites
```bash
Node.js >= 18.0.0
npm >= 9.0.0 or yarn >= 1.22.0
```

### Clone Repository
```bash
git clone https://github.com/your-org/shuttle-frontend.git
cd shuttle-frontend/frontend
```

### Install Dependencies
```bash
npm install
# or
yarn install
```

### Environment Variables
Create `.env` file in the `frontend` directory:

```env
# API Keys
VITE_XVERSE_API_KEY=your_xverse_api_key_here
VITE_XVERSE_ENDPOINT=your_xverse_endpoint_here

# Starknet RPC
VITE_STARKNET_RPC=https://starknet-mainnet.public.blastapi.io/rpc/v0_8
```

### Run Development Server
```bash
npm run dev
# or
yarn dev
```

Access at: `http://localhost:5173`

### Build for Production
```bash
npm run build
# or
yarn build
```

### Preview Production Build
```bash
npm run preview
# or
yarn preview
```

---

## 📁 Project Structure

```
frontend/
├── public/
│   └── shuttle.png                 # App icon
├── src/
│   ├── api/
│   │   └── index.js               # API calls (BTC price, protocol data)
│   ├── assets/
│   │   └── react.svg              # Static assets
│   ├── components/
│   │   ├── ui/
│   │   │   ├── Button.jsx         # Reusable button component
│   │   │   ├── Checkbox.jsx       # Checkbox component
│   │   │   ├── Header.jsx         # App header with wallet connection
│   │   │   ├── Input.jsx          # Form input component
│   │   │   ├── Select.jsx         # Dropdown select component
│   │   │   └── TransactionStatusOverlay.jsx  # Transaction progress modal
│   │   ├── AppIcon.jsx            # Icon wrapper (Lucide)
│   │   ├── AppImage.jsx           # Image component with error handling
│   │   ├── ErrorBoundry.jsx       # Error boundary component
│   │   └── ScrollToTop.jsx        # Scroll restoration on route change
│   ├── context/
│   │   └── global.jsx             # Global state context
│   ├── pages/
│   │   ├── bridge-and-deploy/
│   │   │   ├── components/
│   │   │   │   ├── BridgeInputPanel.jsx          # BTC amount input
│   │   │   │   ├── ProtocolSelectionCard.jsx     # Protocol selection UI
│   │   │   │   └── TransactionPreviewPanel.jsx   # Transaction summary
│   │   │   └── index.tsx          # Main bridge & deploy page
│   │   ├── wallet/
│   │   │   └── index.jsx          # Wallet/portfolio page
│   │   └── NotFound.jsx           # 404 page
│   ├── utils/
│   │   ├── cn.js                  # Tailwind class merge utility + constants
│   │   ├── main_vesu_abi.js       # Vesu contract ABI
│   │   ├── main_trooves_abi.js    # Troves contract ABI
│   │   ├── main_wbtc_abi.js       # WBTC token ABI
│   │   ├── protocol_int.js        # Protocol interaction functions
│   │   ├── xverse_handler.js      # Xverse wallet functions
│   │   └── vesu_impl_abi.js       # Vesu implementation ABI
│   ├── App.css                    # Global styles
│   ├── App.jsx                    # Root component
│   ├── Routes.jsx                 # Route configuration
│   ├── index.css                  # Tailwind imports + CSS variables
│   ├── main.jsx                   # Application entry point
│   └── starknet-types-08.js       # Starknet type definitions
├── .eslintrc.cjs                  # ESLint configuration
├── index.html                     # HTML template
├── package.json                   # Dependencies and scripts
├── postcss.config.js              # PostCSS configuration
├── tailwind.config.js             # Tailwind CSS configuration
└── vite.config.js                 # Vite configuration
```

---

## 🔧 Core Modules

### 1. Wallet Integration (`src/utils/xverse_handler.js`)

```javascript
// Connect Xverse wallet
export const connectXverseWallet = async () => {
  const response = await request('wallet_connect', null);
  // Returns: payment, ordinals, and starknet addresses
}

// Get BTC balance
export const getBtcBalance = async (address) => {
  // Returns balance in BTC
}

// Get WBTC balance on Starknet
export const getVesu_WBTC_Balance = async (userAddress) => {
  // Returns formatted WBTC balance
}
```

### 2. Bridge & Swap (`src/pages/bridge-and-deploy/index.tsx`)

```javascript
// Initialize Atomiq swapper
const swapper = Factory.newSwapper({
  chains: { STARKNET: { rpcUrl: RPC_URL } },
  bitcoinNetwork: BitcoinNetwork.MAINNET,
});

// Create swap: BTC → WBTC
const swap = await swapper.swap(
  Tokens.BITCOIN.BTC,
  Tokens.STARKNET.WBTC,
  amount,
  exactIn,
  undefined,
  starknetAddress
);

// Get PSBT and sign with Xverse
const { psbt, signInputs } = await swap.getFundedPsbt({
  address: walletAddress,
  publicKey: publicKey
});

// Wait for Bitcoin confirmations
await swap.waitForBitcoinTransaction();

// Auto-claim or manual claim
await swap.waitTillClaimedOrFronted();
```

### 3. Protocol Deposits (`src/utils/protocol_int.js`)

```javascript
// Vesu deposit
const vesuContract = new Contract(Main_Vesu_Abi, vesuAddress, wallet);
await vesuContract.deposit(assets, receiver);

// Troves deposit
const trovesContract = new Contract(Main_Trooves_Abi, trovesAddress, wallet);
await trovesContract.deposit(assets, receiver);
```

### 4. Global State Management (`src/context/global.jsx`)

```javascript
const GlobalContext = {
  // Wallet state
  isWalletConnected,
  walletAddress,
  starknetAddress,
  btcBalance,
  wBTCBalance,
  
  // Protocol state
  protocols: [
    { id: 'vesu-lending', pools: [...] },
    { id: 'troves-vault', pools: [...] }
  ],
  
  // Actions
  handleConnect,
  handleGetWBTCBal
}
```

## 🔐 Security Features

1. **Non-Custodial**: Users sign all transactions
2. **Contract Audits**: All integrated protocols are audited
3. **Error Boundaries**: Graceful error handling
4. **Input Validation**: Client-side validation for all inputs

---

## 📊 Supported Protocols

### Vesu Lending
- **Prime Pool**: Lower risk, instant withdrawal
- **Re7xBTC Pool**: Higher APY, variable rates
- **Type**: Lending/Borrowing
- **Lock Period**: None

### Troves Vault
- **Evergreen WBTC Strategy**: Automated yield farming
- **Type**: Auto-compounding vault

---

## 🌐 Network & Contract Addresses

### Starknet Mainnet
```javascript
WBTC: 0x03fe2b97c1fd336e750087d68b9b867997fd64a2661ff3ca5a7c771641e8e7ac
Vesu Prime: 0x04ecb0667140b9f45b067d026953ed79f22723f1cfac05a7b26c3ac06c88f56c
Vesu Main: 0x0131cc09160f144ec5880a0bc1a0633999030fa6a546388b5d0667cb171a52a0
Troves Vault: 0x05a4c1651b913aa2ea7afd9024911603152a19058624c3e425405370d62bf80c
```


## 📈 Performance Optimizations

- **Code Splitting**: Dynamic imports for routes
- **Lazy Loading**: Images and components loaded on demand
- **Memoization**: React.memo for expensive components
- **Debouncing**: Input handlers debounced
- **CSS Purging**: Unused Tailwind classes removed in production


## 🐛 Known Issues & Limitations

1. **Bitcoin Confirmations**: BTC bridging takes 20-50 minutes.
2. **Wallet Support**: Currently Xverse for Bitcoin.

---

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

---

## 📄 License

This project is licensed under the MIT License.

---

## 👥 Team & Support
- **Email**: etimpaul22@gmail.com
- **Telegram**: @Joe_Oracle

---

## 🙏 Acknowledgments

- **Atomiq Labs** - Bitcoin ↔ Starknet bridge SDK
- **Vesu Protocol** - Lending markets
- **Troves Finance** - Vault strategies
- **Xverse** - Bitcoin wallet
- **Starknet Foundation** - L2 infrastructure

---

## 📚 Additional Resources

- [Starknet Documentation](https://docs.starknet.io)
- [Atomiq Labs SDK](https://docs.atomiq.xyz)
- [Xverse Wallet Docs](https://docs.xverse.app)
- [Vesu Protocol](https://vesu.xyz)
- [Troves Finance](https://troves.fi)

---

**Built with ❤️ for the Bitcoin DeFi and Starknet ecosystem**