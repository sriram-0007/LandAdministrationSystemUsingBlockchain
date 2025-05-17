import React, { useState, useEffect } from 'react';
import './Dashboard.css';

const Dashboard = ({ state, account, masterAddress }) => {
  const [trusted, setTrusted] = useState(null);
  const [tokens, setTokens] = useState([]);
  const [shares, setShares] = useState([]);
  const [lands, setLands] = useState([]);
  const [loadingTokens, setLoadingTokens] = useState(false);
  const [totalToken, setTotalToken] = useState(null);

  useEffect(() => {
    const init = async () => {
      if (state?.contract && account) {
        try {
          const tx = await state.contract.checkIfTrusted(account);
          setTrusted(tx);

          const total = await state.contract.getTotalToken();
          const totalCount = parseInt(total.toString());
          setTotalToken(totalCount);

          const fetchedLands = [];

          for (let i = 1; i < totalCount; i++) {
            try {
              const land = await state.contract.registeredLandDetails(i);

              // Filter out lands that are not minted (e.g. empty district string)
              if (!land.district || land.district.trim() === "") {
                continue;
              }

              fetchedLands.push({
                id: i,
                district: land.district,
                taluk: land.taluk,
                village: land.village,
                pattaNumber: land.pattaNumber.toString()
              });
            } catch (error) {
              console.error(`❌ Error fetching land #${i}:`, error);
            }
          }

          setLands(fetchedLands);
        } catch (err) {
          console.error("❌ Error during initial contract load:", err);
        }
      }
    };

    init();
  }, [state, account]);

  const getOwnedTokensAndShares = async () => {
    try {
      setLoadingTokens(true);
      const [tokenIds, tokenShares] = await state.contract.getOwnedTokensAndShares(account);
      setTokens(tokenIds.map(id => id.toString()));
      setShares(tokenShares.map(share => share.toString()));
    } catch (error) {
      console.error("❌ Error fetching tokens and shares:", error);
    } finally {
      setLoadingTokens(false);
    }
  };

  return (
    <div className="dashboardWrapper">
      <div className="dashboardHeader">
        <h2>Land Administration System</h2>
        <p className="subtitle">Manage your land ownership transparently with blockchain.</p>
        <p className="longDescription">
          Traditional land administration systems often suffer from inaccurate and unreliable records due to errors in data 
          collection and manipulation. This project tackles issues like data tampering, registration delays, and double 
          spending using Blockchain Technology (BCT).
          <br /><br />
          A smart contract built with Solidity enables secure and transparent transactions. It supports complex scenarios 
          such as shared ownership, partial transfers, and property restrictions. By combining features of ERC-20 and 
          ERC-721 token standards, the system ensures trust, transparency, and compatibility within the Ethereum ecosystem.
        </p>
      </div>


      {account && state?.contract ? (
        <div className="dashboardContainer">
          {/* TOP CONTAINER */}
          <div className="topContainer">
            {/* LEFT SIDE */}
            <div className="topLeft">
              <h3>👤 Account Details</h3>
              <p><strong>Connected Account:</strong><br /> {account}</p>
              {trusted !== null && (
                <p>
                  {(trusted || account?.toLowerCase() === masterAddress?.toLowerCase()) ? (
                    (account?.toLowerCase() === masterAddress?.toLowerCase())?(
                    <span>✅ This account is Master</span>
                    ):(
                    <span>✅ This account is a trusted member</span>
                    )
                  ) : (
                    <span>❌ This account is not trusted</span>
                  )}
                </p>
              )}

              <div className="ownedTokens">
                <h4>🏠 Owned Tokens</h4>
                <button onClick={getOwnedTokensAndShares} disabled={loadingTokens}>
                  {loadingTokens ? "Fetching..." : "Get Owned Tokens"}
                </button>

                {tokens.length > 0 ? (
                  <ul>
                    {tokens.map((tokenId, index) => (
                      <li key={index}>
                        Token ID: {tokenId}, Share: {shares[index]}%
                      </li>
                    ))}
                  </ul>
                ) : (
                  !loadingTokens && <p>No tokens owned.</p>
                )}
              </div>
            </div>

            {/* RIGHT SIDE */}
            <div className="topRight">
              <h3>📦 Total Tokens</h3>
              {totalToken !== null ? (
                <>
                  <p><strong>Total tokens minted:</strong> {totalToken-1}</p>
                  <p>Each token represents a land that has been minted and registered on the blockchain.</p>
                  <p>Note: Token ID starts from 1. If total is 1, it means 0 lands minted yet.</p>
                </>
              ) : (
                <p>Loading token info...</p>
              )}
            </div>
          </div>

          {/* BOTTOM CONTAINER */}
          <div className="bottomContainer fullPage">
            <h3>🌍 Registered Land Details</h3>
            {lands.length === 0 ? (
              <p>No lands have been minted yet.</p>
            ) : (
              <div className="landsList">
                {lands.map((land) => (
                  <div key={land.id} className="landCard">
                    <p><strong>Token ID:</strong> {land.id}</p>
                    <p><strong>District:</strong> {land.district}</p>
                    <p><strong>Taluk:</strong> {land.taluk}</p>
                    <p><strong>Village:</strong> {land.village}</p>
                    <p><strong>Patta Number:</strong> {land.pattaNumber}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : (
        <p>⚠️ Account or Contract not connected yet...</p>
      )}
    </div>
  );
};

export default Dashboard;
