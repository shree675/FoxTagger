//@ts-check

import React, { useEffect, useState } from 'react';
import TableSection from './TableSection';
import { compact } from './utils/functions';

let flag = false;
export default function Section1(props) {
  const [name, setName] = useState('Guest');

  useEffect(() => {
    if (window?.ethereum?.selectedAddress == undefined) {
      return;
    }

    if (window?.ethereum?.selectedAddress) {
      flag = true;
      setName(window.ethereum.selectedAddress);
    }
  }, [name]);

  return (
    <div className="d-flex flex-column h-100">
      <div className="info-section p-2">
        <h2>Hello, {flag ? compact(name) : name}</h2>
      </div>
      {name !== 'Guest' && (
        <div className="table-section p-2 flex-fill">
          <h4 className="fw-bold">Transactions</h4>
          <TableSection props={name} />
        </div>
      )}
    </div>
  );
}
