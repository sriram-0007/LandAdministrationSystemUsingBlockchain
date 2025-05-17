import React, { useState } from 'react';
import { parseEther } from 'ethers'; // Ethers v6
import "./BuyLand.css"
const BuyLand = ({ state }) => {
  const [formData, setFormData] = useState({
    tokenId: '',
    seller: '',
    amount: ''
  });

  const [status, setStatus] = useState('');
  const [txHash, setTxHash] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleBuy = async (e) => {
    e.preventDefault();
    if (!state?.contract || !state?.signer) {
      setStatus("❌ Contract or signer not connected.");
      return;
    }

    try {
      setIsSubmitting(true);
      setStatus("⏳ Processing transaction...");
      setTxHash('');

      const { tokenId, seller, amount } = formData;

      const contract = state.contract.connect(state.signer);
      const tx = await contract.buyLand(
        parseInt(tokenId),
        seller,
        {
          value: parseEther(amount)
        }
      );

      setTxHash(tx.hash);
      await tx.wait();

      setStatus("✅ Land purchase successful!");
    } catch (err) {
      console.error("Buy error:", err);
      setStatus(`❌ Error: ${err.reason || err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="buy-land-container">
      <h2>Buy Land</h2>
      <form className="buy-land-form" onSubmit={handleBuy}>
        <input
          type="number"
          name="tokenId"
          placeholder="Token ID"
          value={formData.tokenId}
          onChange={handleChange}
          required
        />
        <input
          type="text"
          name="seller"
          placeholder="Seller Address"
          value={formData.seller}
          onChange={handleChange}
          required
        />
        <input
          type="text"
          name="amount"
          placeholder="Amount (ETH)"
          value={formData.amount}
          onChange={handleChange}
          required
        />
        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Buying..." : "Buy Land"}
        </button>
      </form>

      {status && <p className="status-message">{status}</p>}
      {txHash && (
        <div className="transaction-details">
          <strong>Tx Hash:</strong> {txHash}
        </div>
      )}
    </div>
  );
};

export default BuyLand;
