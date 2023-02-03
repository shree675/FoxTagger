import React from 'react';

export default function Navbar() {
  return (
    <div className="d-flex flex-row justify-content-between w-100 p-1">
      <div className="p-1 mt-auto mb-auto">
        <h3>MetaMask Snap</h3>
      </div>
      <div className="p-1 mt-auto mb-auto">
        <button className="btn btn-primary">Connect</button>
      </div>
    </div>
  );
}
