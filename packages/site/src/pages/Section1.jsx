import React from 'react';
import TableSection from './TableSection';

export default function Section1() {
  return (
    <div className="d-flex flex-column h-100">
      <div className="info-section p-2">
        <h2>
          Hello!, {window.ethereum.selectedAddress.substring(0, 20) + '...'}
        </h2>
      </div>
      <div className="table-section p-2 flex-fill">
        <h4 className="fw-bold">Transactions</h4>
        <TableSection />
      </div>
    </div>
  );
}
