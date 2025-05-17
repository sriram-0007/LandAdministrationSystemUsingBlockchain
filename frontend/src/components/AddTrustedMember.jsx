import React, { useState } from 'react';
import './AddTrustedMember.css';

const AddTrustedMember = ({ state }) => {
  const [formData, setFormData] = useState({
    address: '',
    name: '',
    aadharNumber: '',
    phoneNumber: '',
    email: ''
  });

  const [status, setStatus] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [txHash, setTxHash] = useState('');

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!state?.contract || !state?.signer) {
      setStatus("❌ Contract or signer not available.");
      return;
    }

    try {
      setIsSubmitting(true);
      setStatus("⏳ Submitting transaction...");
      setTxHash('');

      const contract = state.contract.connect(state.signer);
      const tx = await contract.addtrustedmembers(
        formData.address,
        formData.name,
        formData.aadharNumber,
        formData.phoneNumber,
        formData.email
      );

      console.log("🧾 Transaction submitted:", tx.hash);
      setTxHash(tx.hash);

      await tx.wait();

      console.log("✅ Transaction mined:", tx);
      setStatus("✅ Trusted member added successfully!");
    } catch (error) {
      console.error("❌ Error during transaction:", error);
      setStatus(`❌ Failed to add member: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="trusted-member-container">
      <h2>Add Trusted Member</h2>
      <p className="description">
        This page allows the Master Admin to add a new trusted member by providing their wallet address and identity details.
        Once submitted, the information is securely stored on the blockchain using a smart contract.
      </p>

      <form className="trusted-member-form" onSubmit={handleSubmit}>
        <input
          type="text"
          name="address"
          placeholder="Wallet Address"
          value={formData.address}
          onChange={handleChange}
          required
        />
        <input
          type="text"
          name="name"
          placeholder="Full Name"
          value={formData.name}
          onChange={handleChange}
          required
        />
        <input
          type="number"
          name="aadharNumber"
          placeholder="Aadhar Number"
          value={formData.aadharNumber}
          onChange={handleChange}
          required
        />
        <input
          type="number"
          name="phoneNumber"
          placeholder="Phone Number"
          value={formData.phoneNumber}
          onChange={handleChange}
          required
        />
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
          required
        />
        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Submitting..." : "Add Trusted Member"}
        </button>
      </form>

      {status && <p className="status-message">{status}</p>}

      {txHash && (
        <div className="transaction-details">
          <strong>Transaction Hash:</strong> {txHash} <br />
          <strong>To:</strong> {formData.address} <br />
          <strong>Name:</strong> {formData.name}
        </div>
      )}
    </div>
  );
};

export default AddTrustedMember;
