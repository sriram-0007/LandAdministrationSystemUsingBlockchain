import React, { useState } from 'react';
import './TransferLand.css';

const TransferLand = ({ state }) => {
  const [formData, setFormData] = useState({
    from: '',
    to: '',
    tokenId: '',
    share: ''
  });

  const [loading, setLoading] = useState(false);
  const [txHash, setTxHash] = useState('');
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleTransfer = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setTxHash('');

    try {
      const tx = await state.contract.transferFrom(
        formData.from,
        formData.to,
        parseInt(formData.tokenId),
        parseInt(formData.share)
      );

      await tx.wait();
      console.log("✅ Transfer Transaction Executed:", tx);
      setTxHash(tx.hash);
    } catch (err) {
      console.error("❌ Transfer Failed:", err);
      setError("Transfer failed. Please check inputs or see console for more.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="transfer-land-container">
      <h2>🔄 Transfer Land Ownership</h2>
      <p className="description">
        This form allows you to transfer land ownership or a portion of share from one address to another. 
        Provide the current owner's address, recipient's address, land token ID, and share percentage to proceed with the transfer.
      </p>

      <form className="transfer-form" onSubmit={handleTransfer}>
        <label>👤 From Address:</label>
        <input type="text" name="from" value={formData.from} onChange={handleChange} required />

        <label>📥 To Address:</label>
        <input type="text" name="to" value={formData.to} onChange={handleChange} required />

        <label>🏷️ Token ID:</label>
        <input type="number" name="tokenId" value={formData.tokenId} onChange={handleChange} required />

        <label>📊 Share to Transfer (%):</label>
        <input type="number" name="share" value={formData.share} onChange={handleChange} required />

        <button type="submit" disabled={loading}>
          {loading ? "Transferring..." : "Transfer Share"}
        </button>
      </form>

      {txHash && <p className="success-msg">✅ Tx Hash: {txHash}</p>}
      {error && <p className="error-msg">{error}</p>}
    </div>
  );
};

export default TransferLand;
