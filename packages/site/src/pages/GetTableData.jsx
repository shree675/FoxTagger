//@ts-check

import React, { useEffect, useState } from 'react';
import DATA_local from './data';
import { getStorage, setStorage } from '../utils/snap';
import { compact, toEth } from './utils/functions';

import './tableDesign.css';
import { BigNumber } from 'ethers';
const convert = {
  wei_eth: (wei) => {
    return toEth(BigNumber.from(wei.toString()));
  },
  eth_wei: (eth) => {
    return (BigNumber.from(wei) * BigNumber('1000000000000000000')).toString();
  },
};

export default function GetTableData() {
  const [persistanceData, setPersistanceData] = useState({});
  const [uniqueTags, setUniqueTags] = useState([]);
  const [appData, setAppData] = useState('');

  // todo : this is a hack, need to fix this
  const [accountNo, setAccountNo] = useState(
    '0x32f2e9ff23d7651beaa893d3a84ba26e7d848ab1',
  );
  const [data, setData] = React.useState([]);
  const [dateRange, setDateRange] = React.useState({
    startDate: new Date('2000-01-01'),
    endDate: new Date('2100-01-01'),
  });
  const [sortDirection, setSortDirection] = React.useState('desc');
  const [sortField, setSortField] = React.useState('date');
  const [filterTag, setFilterTag] = React.useState('all');
  const [filterDateRange, setFilterDateRange] = React.useState({
    startDate: new Date(),
    endDate: new Date(0),
  });
  const [cM, setCM] = React.useState([]);
  const [tag, setTag] = React.useState([]);

  const colorMap = (tag) => {
    if (cM[tag]) return cM[tag];

    let color = Math.floor(Math.random() * 16777215).toString(16);
    while (parseInt(color, 16) < 0x333333) {
      color = Math.floor(Math.random() * 16777215).toString(16);
    }

    let newCM = cM;
    newCM[tag] = '#' + color;
    setCM(newCM);

    return color;
  };

  const addtag = async (address, tag) => {
    console.log('add tag');
    let newPersistanceData = await getStorage();
    let mainMapping = newPersistanceData[accountNo].mainMapping;
    if (!mainMapping) mainMapping = {};
    if (!mainMapping[address]) {
      mainMapping[address] = [];
    }
    if (!mainMapping[address].includes(tag)) {
      mainMapping[address].push(tag);
    }
    setPersistanceData(newPersistanceData);
    await setStorage(newPersistanceData);
    setData(heuristicFilter(newPersistanceData, appData));
  };

  const handleAddTag = async (address) => {
    let tag = prompt('Enter tag name');
    if (tag == '' || tag == null) {
      return;
    }
    await addtag(address, tag);
  };

  const removetag = async (address, tag) => {
    let newPersistanceData = await getStorage();
    let mainMapping = newPersistanceData[accountNo].mainMapping;
    if (!mainMapping) mainMapping = {};
    if (!mainMapping[address]) {
      mainMapping[address] = [];
    }
    if (mainMapping[address].includes(tag)) {
      mainMapping[address] = mainMapping[address].filter((t) => t !== tag);
    }
    setPersistanceData(newPersistanceData);
    await setStorage(newPersistanceData);
    setData(heuristicFilter(newPersistanceData, appData));
  };

  const handleDeleteTag = async (address, tag) => {
    await removetag(address, tag);
  };

  const heuristicFilter = (persistanceData, apiData) => {
    if (!persistanceData || !apiData) return DATA_local;
    // if (persistanceData[accountNo] == undefined) return DATA_local;
    let mainMapping = persistanceData[accountNo].mainMapping;
    console.log('mainMapping 97:', mainMapping);
    let data = [];
    for (let i = 0; i < apiData.length; i++) {
      let tx = apiData[i];
      let to = tx.to;
      let value = tx.value;
      let tags = [];

      tags = mainMapping[to] ? mainMapping[to] : [];
      let date = new Date(tx.timeStamp * 1000).toLocaleDateString();
      let time = new Date(tx.timeStamp * 1000).toLocaleTimeString();
      let dateTime = date + ' ' + time;

      let row = {
        address: to,
        amount: value,
        tags: tags,
        date: dateTime,
      };
      data.push(row);
    }

    return data;
  };

  useEffect(() => {
    if (window.ethereum.selectedAddress) {
      const accountNo = window.ethereum.selectedAddress;
      setAccountNo(accountNo);
      console.log('useeffect log 2:', accountNo);
    }
  }, [accountNo]);

  useEffect(() => {
    const getPersistanceStorage = async () => {
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts',
      });
      // ensure acccounts is not null or undefined
      // if (!accounts) {
      //   return;
      // }
      console.log('accounts :', accounts);
      setAccountNo(accounts[0]);

      // initialize persistent storage
      let storageData = await getStorage();
      console.log('persistance storage :', storageData);
      setPersistanceData(storageData);

      let template = {
        abc: 'def',
        '0x58fbf7339825d9dcb0d37c19cd04485880c0a894': {
          mainMapping: {
            '0xd2ad654a5d7d42535e31c975b67274fa7687fddd': ['todo'],
            '0xd3c5967d94d79f17bdc493401c33f7e8897c5f81': [
              'transportation',
              'food',
            ],
            '0x8ced5ad0d8da4ec211c17355ed3dbfec4cf0e5b9': ['food'],
          },
          usage: {
            todo: {
              limit: '1000000000000000000',
              used: '999999999999999999',
              notified: false,
            },
          },
          latestHash: '',
        },

        '0x32f2e9ff23d7651beaa893d3a84ba26e7d848ab1': {
          mainMapping: {
            '0xd2ad654a5d7d42535e31c975b67274fa7687fddd': ['todo'],
            '0xd3c5967d94d79f17bdc493401c33f7e8897c5f81': [
              'transportation',
              'food',
            ],
            '0x8ced5ad0d8da4ec211c17355ed3dbfec4cf0e5b9': ['food'],
          },
          usage: {
            todo: {
              limit: '1000000000000000000',
              used: '999999999999999999',
              notified: true,
            },
          },
          latestHash: '',
        },
      };

      if (!storageData['abc']) {
        await setStorage(template);
      }

      let storageData2 = await getStorage();

      fetch(
        `https://api-goerli.etherscan.io/api?module=account&action=txlist&address=${accountNo}&startblock=0&endblock=9999999999&sort=asc&apikey=5I4X9SEH42B1Z325WBZIFJ1WNCE1VN1IVW`,
      )
        .then((results) => results.json())
        .then((data) => {
          if (data && data.message == 'OK') {
            const temp = data.result;
            setAppData(temp);
            console.log('sachin ka data :', temp);
            console.log('165', storageData2);
            setData(heuristicFilter(storageData2, temp));
          }
        });
    };
    getPersistanceStorage();
  }, []);

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handleFilter = (tag) => {
    setFilterTag(tag);
  };

  const handleFilterDate = (dateRange) => {
    setFilterDateRange(dateRange);
  };

  React.useEffect(() => {
    console.log('data local:', DATA_local);
    setData(DATA_local);

    setFilterDateRange(dateRange);
  }, [dateRange]);

  const finalData = data
    .filter((item) => {
      if (filterTag === 'all') {
        return true;
      } else {
        return item.tags.includes(filterTag);
      }
    })
    .filter((item) => {
      if (
        new Date(item.date) >= new Date(filterDateRange.startDate) &&
        new Date(item.date) <= new Date(filterDateRange.endDate)
      ) {
        return true;
      } else {
        return false;
      }
    })
    .sort((a, b) => {
      if (sortField === 'date') {
        return sortDirection === 'asc'
          ? new Date(a.date) - new Date(b.date)
          : new Date(b.date) - new Date(a.date);
      } else {
        return sortDirection === 'asc'
          ? a.amount - b.amount
          : b.amount - a.amount;
      }
    });

  return (
    <div>
      <div className="row gx-1 gy-1">
        <div className="col-lg-6 col-12">
          <div className="btn-group">
            <button
              className={
                'btn btn-' + (sortField === 'date' ? 'primary' : 'secondary')
              }
              onClick={() => handleSort('date')}
            >
              Date
            </button>
            <button
              className={
                'btn btn-' + (sortField === 'amount' ? 'primary' : 'secondary')
              }
              onClick={() => handleSort('amount')}
            >
              Amount
            </button>
            <button
              className={
                'btn disabled btn-' +
                (sortDirection === 'asc' ? 'success' : 'danger')
              }
            >
              {sortDirection === 'asc' ? 'Asc' : 'Desc'}
            </button>
          </div>
        </div>
        <div className="col-lg-6 col-12 text-end">
          <div className="btn-group">
            <button
              className={
                'btn btn-' + (filterTag === 'all' ? 'primary' : 'secondary')
              }
              onClick={() => handleFilter('all')}
            >
              All
            </button>
            <button
              className={
                'btn btn-' + (filterTag === 'food' ? 'primary' : 'secondary')
              }
              onClick={() => handleFilter('food')}
            >
              Food
            </button>
            <button
              className={
                'btn btn-' + (filterTag === 'travel' ? 'primary' : 'secondary')
              }
              onClick={() => handleFilter('travel')}
            >
              Travel
            </button>
            <button
              className={
                'btn btn-' +
                (filterTag === 'shopping' ? 'primary' : 'secondary')
              }
              onClick={() => handleFilter('shopping')}
            >
              Shopping
            </button>
            <button
              className={
                'btn btn-' +
                (filterTag === 'entertainment' ? 'primary' : 'secondary')
              }
              onClick={() => handleFilter('entertainment')}
            >
              Entertainment
            </button>
          </div>
        </div>
      </div>
      <div className="d-flex justify-content-end">
        <div className="form-group m-1">
          <input
            type="date"
            className="form-control"
            onChange={(e) =>
              setDateRange({ ...dateRange, startDate: e.target.value })
            }
          />
        </div>
        <div className="form-group m-1">
          <input
            type="date"
            className="form-control"
            onChange={(e) =>
              setDateRange({ ...dateRange, endDate: e.target.value })
            }
          />
          <button
            className="btn btn-primary m-1"
            onClick={() => handleFilterDate(dateRange)}
          >
            Filter Date
          </button>
          <button
            className="btn btn-primary m-1"
            onClick={() =>
              handleFilterDate({
                startDate: new Date('2000-01-01'),
                endDate: new Date('2100-01-01'),
              })
            }
          >
            Reset Date
          </button>
        </div>
      </div>
      <div className="table-responsive">
        <table className="table text-muted">
          <thead>
            <tr className="text-dark fs-3">
              <th colSpan={2}>Address</th>
              <th colSpan={1}>Date</th>
              <th colSpan={1}>Amount</th>
              <th colSpan={2}>Tags</th>
            </tr>
          </thead>
          <tbody className="text-dark">
            {finalData.map((item) => (
              <tr key={item._id}>
                <td colSpan={2} className="align-middle">
                  {compact(item.address)}
                </td>
                <td colSpan={1} className="align-middle">
                  {item.date}
                </td>
                <td colSpan={1} className="align-middle">
                  {convert['wei_eth'](item.amount)}
                </td>
                <td colSpan={2}>
                  <div>
                    {item.tags.map((tag) => (
                      <span
                        className={
                          'badge pe-3 ps-3 p-2 m-1 shadow rounded-pill '
                        }
                        style={{ backgroundColor: colorMap(tag) }}
                      >
                        <span className="align-middle">{tag}</span>
                        <span
                          className="text-dark fw-bold fs-4 ms-2 align-middle"
                          onClick={async () =>
                            await handleDeleteTag(item.address, tag)
                          }
                        >
                          <i className="bi bi-x text-light rounded-pill ps-1 pe-1 align-middle"></i>
                        </span>
                      </span>
                    ))}
                    <span
                      className="badge bg-success shadow text-white rounded-pill"
                      onClick={async () => {
                        await handleAddTag(item.address);
                      }}
                    >
                      +
                    </span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
