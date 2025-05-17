import React, { useState, useEffect } from 'react';
import { parseEther, formatEther } from 'ethers'; // Ethers v6 import
import "./PostLand.css"
const PostLand = ({ state }) => {
  const [formData, setFormData] = useState({
    tokenId: '',
    amount: '',
    share: ''
  });

  const [status, setStatus] = useState('');
  const [txHash, setTxHash] = useState('');
  const [postedLands, setPostedLands] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!state?.contract || !state?.signer) {
      setStatus("❌ Contract or signer not connected.");
      return;
    }

    try {
      setIsSubmitting(true);
      setStatus("⏳ Posting land...");
      setTxHash('');

      const contract = state.contract.connect(state.signer);
      const tx = await contract.postLand(
        parseInt(formData.tokenId),
        parseEther(formData.amount),
        parseInt(formData.share)
      );

      setTxHash(tx.hash);
      await tx.wait();

      setStatus("✅ Land posted successfully!");
      fetchPostedLands(); // Refresh the list
    } catch (error) {
      console.error("❌ Error:", error);
      setStatus(`❌ Error: ${error.reason || error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const fetchPostedLands = async () => {
    if (!state?.contract) return;
    try {
      const lands = await state.contract.getPostedLandDetails();
      setPostedLands(lands);
    } catch (error) {
      console.error("Failed to fetch posted lands:", error);
    }
  };

  useEffect(() => {
    fetchPostedLands();
  }, [state]);

  return (
    <div className="post-land-container">
      <h2>Post Your Land for Sale</h2>
      <form className="post-land-form" onSubmit={handleSubmit}>
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
          name="amount"
          placeholder="Amount in ETH"
          value={formData.amount}
          onChange={handleChange}
          required
        />
        <input
          type="number"
          name="share"
          placeholder="Share (%)"
          value={formData.share}
          onChange={handleChange}
          required
        />
        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Posting..." : "Post Land"}
        </button>
      </form>

      {status && <p className="status-message">{status}</p>}
      {txHash && (
        <div className="transaction-details">
          <strong>Tx Hash:</strong> {txHash}
        </div>
      )}

      <hr style={{ margin: '2rem 0' }} />
      <h3>📋 Lands Currently Posted for Sale</h3>
      {postedLands.length === 0 ? (
        <p>No lands posted yet.</p>
      ) : (
        <table className="land-table">
          <thead>
            <tr>
              <th>Token ID</th>
              <th>Seller</th>
              <th>Share (%)</th>
              <th>Amount (ETH)</th>
            </tr>
          </thead>
          <tbody>
            {postedLands.map((land, index) => (
              <tr key={index}>
                <td>{land.tokenId.toString()}</td>
                <td>{land.seller}</td>
                <td>{land.share.toString()}</td>
                <td>{formatEther(land.amount)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default PostLand;
