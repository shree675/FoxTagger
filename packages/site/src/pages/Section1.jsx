import React, { useEffect, useState } from 'react';
import TableSection from './TableSection';

export default function Section1() {
  const [name, setName] = useState('Guest');

  useEffect(() => {
    if (window.ethereum?.selectedAddress) {
      const name = window.ethereum.selectedAddress.substring(0, 20) + '...';
      setName(name);
    }
  }, [name]);

  return (
    <div className="d-flex flex-column h-100">
      <div className="info-section p-2">
        <h2>Hello!, {name}</h2>
      </div>
      {name !== 'Guest' && (
        <div className="table-section p-2 flex-fill">
          <h4 className="fw-bold">Transactions</h4>
          <TableSection />
        </div>
      )}
    </div>
  );
}
