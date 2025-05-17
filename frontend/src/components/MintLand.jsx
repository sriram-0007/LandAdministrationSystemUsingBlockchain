import React, { useState } from 'react';
import './MintLand.css';

const MintLand = ({ state }) => {
  const [formData, setFormData] = useState({
    to: '',
    district: '',
    taluk: '',
    village: '',
    pattaNumber: '',
    share: '',
  });

  const [loading, setLoading] = useState(false);
  const [transactionHash, setTransactionHash] = useState(null);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleMint = async (e) => {
    e.preventDefault();
    setLoading(true);
    setTransactionHash(null);
    setError(null);

    try {
      const tx = await state.contract.mint(
        formData.to,
        formData.district,
        formData.taluk,
        formData.village,
        parseInt(formData.pattaNumber),
        parseInt(formData.share)
      );

      await tx.wait();
      console.log("✅ Mint Transaction Executed:", tx);
      setTransactionHash(tx.hash);
    } catch (err) {
      console.error("❌ Error while minting:", err);
      setError("Failed to mint. Please check inputs or console for details.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mint-land-container">
      <h2>🏡 Mint New Land</h2>
      <p className="description">
        This page is used by the Master Admin to mint new land records on the blockchain. 
        The land is assigned to a trusted member by providing location details and ownership share. 
        Once submitted, the land details are securely stored and associated with the recipient’s wallet address.
      </p>

      <form className="mint-form" onSubmit={handleMint}>
        <label>👤 To Address:</label>
        <input type="text" name="to" value={formData.to} onChange={handleChange} required />

        <label>📍 District:</label>
        <input type="text" name="district" value={formData.district} onChange={handleChange} required />

        <label>🏘️ Taluk:</label>
        <input type="text" name="taluk" value={formData.taluk} onChange={handleChange} required />

        <label>🏡 Village:</label>
        <input type="text" name="village" value={formData.village} onChange={handleChange} required />

        <label>📜 Patta Number:</label>
        <input type="number" name="pattaNumber" value={formData.pattaNumber} onChange={handleChange} required />

        <label>🔗 Share (%):</label>
        <input type="number" name="share" value={formData.share} onChange={handleChange} required />

        <button type="submit" disabled={loading}>
          {loading ? 'Minting...' : 'Mint Land'}
        </button>
      </form>

      {transactionHash && (
        <p className="success-msg">✅ Transaction Hash: {transactionHash}</p>
      )}
      {error && (
        <p className="error-msg">{error}</p>
      )}
    </div>
  );
};

export default MintLand;
