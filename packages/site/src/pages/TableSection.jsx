import React, { useEffect, useState } from 'react';
import GetTableData from './GetTableData';

export default function TableSection() {
  const [account, setAccount] = useState('');

  // get data from api and set it to data
  useEffect(() => {
    if (window.ethereum.selectedAddress) {
      const account = window.ethereum.selectedAddress;
      setAccount(account);
      console.log('useeffect log :', account);
    }
  }, [account]);

  return (
    <div>
      <GetTableData />
    </div>
  );
}
