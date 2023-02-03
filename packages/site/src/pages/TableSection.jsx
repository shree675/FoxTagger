import React, { useEffect, useState } from 'react';
import GetTableData from './GetTableData';

export default function TableSection() {
  const [data, setData] = useState([]);
  const [account, setAccount] = useState('');

  // get data from api and set it to data
  useEffect(() => {
    if (window.ethereum?.selectedAddress) {
      const account = window.ethereum.selectedAddress;
      setAccount(account);
      console.log('useeffect log :', account);
    }
  }, [account]);

  React.useEffect(() => {
    fetch(
      `https://api-goerli.etherscan.io/api?module=account&action=txlist&address=${account}&startblock=0&endblock=9999999999&sort=asc&apikey=1G563FEP4GAUAF4YUXJUBU363NB984HCWJ`,
    )
      .then((results) => results.json())
      .then((data) => {
        setData(data.result);
      });
  }, []);

  return (
    <div>
      <GetTableData props={data} />
    </div>
  );
}
