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

export default function GetTableData(props) {
  const [persistanceData, setPersistanceData] = useState({});
  const [uniqueTags, setUniqueTags] = useState([]);
  const [appData, setAppData] = useState('');
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
    let mainMapping = newPersistanceData.mainMapping;
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
      alert('Tag name cannot be empty');
      return;
    }
    await addtag(address, tag);
  };

  const removetag = async (address, tag) => {
    let newPersistanceData = await getStorage();
    let mainMapping = newPersistanceData.mainMapping;
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
    let mainMapping = persistanceData.mainMapping;
    console.log('mainMapping 97:', mainMapping);
    let data = [];
    for (let i = 0; i < apiData.length; i++) {
      let tx = apiData[i];
      let to = tx.from;
      let value = tx.value;
      let tags = [];

      // console.log(mainMapping.has(to));
      // if (mainMapping[to] && mainMapping[to].length > 0) {
      //   tags = mainMapping[to];
      // }
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
    const getPersistanceStorage = async () => {
      const accounts = await window.ethereum?.request({
        method: 'eth_requestAccounts',
      });
      // ensure acccounts is not null or undefined
      console.log('accounts :', accounts);
      if (!accounts) {
        return;
      }

      // initialize persistent storage
      let storageData = await getStorage();
      console.log('persistance storage :', storageData);
      setPersistanceData(storageData);

      let template = {
        mainMapping: {
          '0x71c7656ec7ab88b098defb751b7401b5f6d8976f': [
            'food2',
            'entertainment',
          ],
          '0xd3c5967d94d79f17bdc493401c33f7e8897c5f81': [
            'transportation',
            'food',
          ],
          '0x8ced5ad0d8da4ec211c17355ed3dbfec4cf0e5b9': ['food'],
        },
        usage: {},
        latestHash: '',
      };

      let genData = await setStorage(template);
      console.log('genData :', genData);

      let storageData2 = await getStorage();

      fetch(
        `https://api-goerli.etherscan.io/api?module=account&action=txlist&address=0x71C7656EC7ab88b098defB751B7401B5f6d8976F&startblock=0&endblock=9999999999&sort=asc&apikey=FFJRFMXZPG2H3K9QEMQ25Z1PZS67CIU8DJ`,
      )
        .then((results) => results.json())
        .then((data) => {
          if (data && data.message == 'OK') {
            const temp = data.result;
            setAppData(temp);
            console.log('sachin ka data :', temp);
            setData(heuristicFilter(storageData2, temp));
          }
        });

      // if (!storageData) {
      //   storageData = {};
      //   storageData[account] = { mainMapping: {}, usage: {}, latestHash: '' };
      //   await setStorage(storageData);
      // } else if (!storageData[account]) {
      //   // an account already exists so set the same mainMapping for the new account
      //   let prevAccount = null;
      //   for (const existingAccount in storageData) {
      //     if (Object.prototype.hasOwnProperty.call(storageData, existingAccount)) {
      //       if (existingAccount.startsWith('0x')) {
      //         prevAccount = existingAccount;
      //       }
      //     }
      //   }

      //   if (prevAccount === null || prevAccount === undefined) {
      //     console.error(
      //       'Persistent storage has not been initialized correctly.',
      //     );
      //     storageData[account] = { mainMapping: {}, usage: {}, latestHash: '' };
      //   } else {
      //     const { mainMapping } = storageData[prevAccount];
      //     const { usage } = storageData[prevAccount];

      //     for (const tag in usage) {
      //       if (Object.prototype.hasOwnProperty.call(usage, tag)) {
      //         usage[tag].limit = 0;
      //         // used field will be updated later by a cron job
      //         usage[tag].used = 0;
      //         usage[tag].notified = false;
      //       }
      //     }

      //     storageData[account] = {
      //       mainMapping,
      //       usage,
      //       latestHash: '',
      //     };
      //   }

      //   await setStorage(storageData);
      // }
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
