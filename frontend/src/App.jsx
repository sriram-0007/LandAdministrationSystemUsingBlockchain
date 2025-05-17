import React, { useState, useEffect } from "react";
import { BrowserProvider, Contract } from "ethers"; // Correct import for ethers v6
import LandAdministration from "./LandAdministration.json"; // Your contract ABI
import Dashboard from "./components/Dashboard";
import { Routes,Route } from "react-router";
import AddTrustedMember from "./components/AddTrustedMember";
import MintLand from "./components/MintLand";
import TransferLand from "./components/TransferLand";
import PostLand from "./components/PostLand";
import BuyLand from "./components/BuyLand";

function App() {
  const [state, setState] = useState({
    provider: null,
    signer: null,
    contract: null,
  });
  const [account, setAccount] = useState("Not connected");
  const [isMaster, setIsMaster] = useState(false);
  const masterAddress = "0xD808E696ac77995dCea28A8379f0cd7271d62717"; // The master wallet address
  const [totalNoOfLand,setTotalNoOfLand]=useState("");

  // Function to initialize contract with the current account
  const initializeContract = async (newAccount = null) => {
    const contractAddress = "0x1ed2c20Ea59FF37a71124BD181158B4A11e7Ec88"; // Your contract address
    const contractABI = LandAdministration.abi; // Your contract ABI

    try {
      if (!window.ethereum) {
        alert("MetaMask is not installed. Please install it.");
        return;
      }

      const provider = new BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new Contract(contractAddress, contractABI, signer);
      console.log(contract.interface.fragments)

      // If a new account is provided, use that. Otherwise, fetch from MetaMask
      const accounts = newAccount ? [newAccount] : await window.ethereum.request({ method: "eth_accounts" });
      
      if (accounts.length > 0) {
        setAccount(accounts[0]);
        setIsMaster(accounts[0].toLowerCase() === masterAddress.toLowerCase());
      }

      setState({ provider, signer, contract });
    } catch (error) {
      console.error("Error connecting:", error);
    }
  };

  // **🔄 Listen for account changes dynamically**
  useEffect(() => {
    initializeContract(); // Initial contract setup

    if (window.ethereum) {
      window.ethereum.on("accountsChanged", (accounts) => {
        if (accounts.length > 0) {
          initializeContract(accounts[0]); // Update signer & account dynamically
        } else {
          setAccount("Not connected");
          setIsMaster(false);
        }
      });
    }

    // Cleanup event listener when component unmounts
    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener("accountsChanged", () => {});
      }
    };
  }, []);

  // Function to mint land (Requires master account)
  const mintLand = async () => {
    if (!state.contract) {
      alert("Contract not initialized");
      return;
    }

    if (!isMaster) {
      alert("Please switch to the master account in MetaMask.");
      return;
    }

    try {
      const district = "District Name";
      const taluk = "Taluk Name";
      const village = "Village Name";
      const pattaNumber = 256;
      const share = 10;

      const tx = await state.contract.mint("0xBa7F19F0B573d5c1A9df9395507134d695Ea529F", district, taluk, village, pattaNumber, share);
      console.log("Transaction: ", tx);
      alert("Land minted successfully!");
    } catch (error) {
      console.error("Error minting land:", error);
      alert("Failed to mint land");
    }
  };

  // Function to execute other actions (No master required)
  const someOtherFunction = async () => {
    if (state.contract && account !== "Not connected") {
      try {
        const tx = await state.contract.getTotalToken(); // Replace with actual function
        console.log("Transaction successful: ", tx);
        console.log(tx);
        setTotalNoOfLand(tx.toString());
        //alert("Action successful!");
      } catch (error) {
        console.error("Error with action:", error);
        alert("Action failed");
      }
    }
  };

  return (
    <>
   
    
      <Routes>
      <Route
        path="/"
        element={
          <Dashboard
            state={state}
            account={account}
            masterAddress={masterAddress}
          />
        }
      />
      <Route path="/addTrustedMember" element={<AddTrustedMember state={state} />} />
      <Route path="/mintLand" element={<MintLand state={state} />} />
      <Route path="/transferLand" element={<TransferLand state={state} />} />
      <Route path="/PostLand" element={<PostLand state={state} />} />
      <Route path="/BuyLand" element={<BuyLand state={state} />} />
    </Routes>
      
    </>
  );
}

export default App;
