//@ts-check
import React, { useEffect, useState } from 'react';
import DATA_local from './data';
import { getStorage, setStorage } from '../utils/snap';
import { compact, toEth, toEthInt } from './utils/functions';
import 'chart.js/auto';
import { FixedNumber } from 'ethers';

import './tableDesign.css';
import { BigNumber } from 'ethers';
import { Doughnut } from 'react-chartjs-2';

const convert = {
  wei_eth: (wei) => {
    return toEth(BigNumber.from(wei.toString()));
  },
  wei_eth_int: (wei) => {
    return toEthInt(BigNumber.from(wei.toString()));
  },
  eth_wei: (eth) => {
    return (
      BigNumber.from(eth) * BigNumber.from('1000000000000000000')
    ).toString();
  },
  gwei_wei: (gwei) => {
    return (BigNumber.from(gwei) * BigNumber.from('1000000000')).toString();
  },
};

export default function GetTableData(props) {
  const [persistanceData, setPersistanceData] = useState({});
  const [uniqueTags, setUniqueTags] = useState(['default']);
  const [usageArray, setUsageArray] = useState([1, 2, 3, 4]);
  const [piedata, setPieData] = useState(null);

  const [limit, setLimit] = useState(10);
  const [unit, setUnit] = useState('eth');
  const [appData, setAppData] = useState('');

  async function handleSetLimit(Limit, unit) {
    let newPersistanceData = persistanceData;
    if (unit == 'eth') {
      newPersistanceData[accountNo].usage[filterTag].limit =
        convert.eth_wei(Limit);
    } else if (unit == 'gwei') {
      newPersistanceData[accountNo].usage[filterTag].limit =
        convert.gwei_wei(Limit);
    } else newPersistanceData[accountNo].usage[filterTag].limit = Limit;

    setPersistanceData(newPersistanceData);
    await setStorage(newPersistanceData);
    window.location.reload();
  }

  // get data from TableSection.jsx
  const [accountNo, setAccountNo] = useState(props.props);

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
    let newPersistanceData = await getStorage();
    let mainMapping = newPersistanceData[accountNo].mainMapping;
    if (!mainMapping) mainMapping = {};
    if (!mainMapping[address]) {
      mainMapping[address] = [];
    }
    if (!mainMapping[address].includes(tag)) {
      mainMapping[address].push(tag);

      let usage = newPersistanceData[accountNo].usage;
      if (!usage) usage = {};
      if (!usage[tag]) {
        usage[tag] = {
          limit: '1000000000000000000',
          used: '0',
          notified: false,
        };
      }
    }
    newPersistanceData[accountNo].latestHash =
      newPersistanceData[accountNo].prevHash;
    setPersistanceData(newPersistanceData);
    // console.log('newPersistanceData 97:', newPersistanceData);
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

      let usage = newPersistanceData[accountNo].usage;
      if (!usage) usage = {};
      if (usage[tag]) {
        delete usage[tag];
        setFilterTag('all');
      }
    }
    newPersistanceData[accountNo].latestHash =
      newPersistanceData[accountNo].prevHash;
    setPersistanceData(newPersistanceData);
    await setStorage(newPersistanceData);
    setData(heuristicFilter(newPersistanceData, appData));
  };

  const handleDeleteTag = async (address, tag) => {
    await removetag(address, tag);
  };

  const heuristicFilter = (persistanceData, apiData) => {
    if (!persistanceData || !apiData) return DATA_local;
    if (persistanceData[accountNo] == undefined) return DATA_local;
    let mainMapping = persistanceData[accountNo].mainMapping;
    let data = [];
    for (let i = 0; i < apiData.length; i++) {
      let tx = apiData[i];
      let to = tx.to;
      if (to !== props.props && to.startsWith('0x')) {
        let value = tx.value;
        let gas = tx.gas;
        let tags = [];

        tags = mainMapping[to] ? mainMapping[to] : [];
        let date = new Date(tx.timeStamp * 1000).toLocaleDateString();
        let time = new Date(tx.timeStamp * 1000).toLocaleTimeString();
        let dateTime = date + ' ' + time;

        let row = {
          address: to,
          amount: BigNumber.from(value).add(BigNumber.from(gas)).toString(),
          tags: tags,
          date: dateTime,
        };
        data.push(row);
      }
    }

    return data;
  };

  function handleUniqueTags() {
    try {
      let uT = Object.keys(persistanceData[accountNo].usage);
      setUniqueTags(uT);
    } catch (err) {
      // wait for the state to be updated
    }
  }

  useEffect(() => {
    const getPersistanceStorage = async () => {
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts',
      });

      setAccountNo(accounts[0]);

      // initialize persistent storage
      let storageData = await getStorage();
      setPersistanceData(storageData);

      let storageData2 = await getStorage();

      fetch(
        `https://api-goerli.etherscan.io/api?module=account&action=txlist&address=${props.props}&startblock=0&endblock=9999999999&sort=asc&apikey=UQUAAVHP952XT8JHMTIPDAHUJYYDVJPUGK`,
      )
        .then((results) => results.json())
        .then((data) => {
          if (data && data.message == 'OK') {
            const temp = data.result;
            setAppData(temp);
            // console.log('165', storageData2);
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

  useEffect(() => {
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

  useEffect(() => {
    let dataArray =
      persistanceData[accountNo] && persistanceData[accountNo].usage
        ? Object.values(persistanceData[accountNo].usage).map((item) => {
            return convert['wei_eth_int'](item.used);
          })
        : [...Array(uniqueTags.length).fill(10)];
    console.log('data array :', dataArray);
    setUsageArray(dataArray);
    console.log('unique tag', uniqueTags);

    let piedata = {
      labels: uniqueTags,
      datasets: [
        {
          label: 'Usage',
          data: usageArray,
          backgroundColor: [
            'rgba(255, 99, 132, 0.2)',
            'rgba(54, 162, 235, 0.2)',
            'rgba(255, 206, 86, 0.2)',
            'rgba(75, 192, 192, 0.2)',
            'rgba(153, 102, 255, 0.2)',
            'rgba(255, 159, 64, 0.2)',
            'rgba(255, 99, 132, 0.2)',
            'rgba(54, 162, 235, 0.2)',
            'rgba(255, 206, 86, 0.2)',
            'rgba(75, 192, 192, 0.2)',
            'rgba(255, 159, 64, 0.2)',
          ],
          borderColor: [
            'rgba(255, 99, 132, 1)',
            'rgba(54, 162, 235, 1)',
            'rgba(255, 206, 86, 1)',
            'rgba(75, 192, 192, 1)',
            'rgba(153, 102, 255, 1)',
            'rgba(255, 159, 64, 1)',
            'rgba(255, 99, 132, 1)',
            'rgba(54, 162, 235, 1)',
            'rgba(255, 206, 86, 1)',
            'rgba(75, 192, 192, 1)',
            'rgba(255, 159, 64, 1)',
          ],
          borderWidth: 1,
        },
      ],
    };

    setPieData(piedata);
  }, [persistanceData, uniqueTags]);

  useEffect(() => {
    handleUniqueTags();
  }, [data]);

  return (
    <div>
      <div className="row gx-1 gy-1">
        <div className="col-lg-9 col-md-6 col-12">
          <div className="col-12">
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
                  'btn btn-' +
                  (sortField === 'amount' ? 'primary' : 'secondary')
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
          <div className="col-12 text-end">
            <div className="dropdown">
              <button
                style={{ backgroundColor: 'black' }}
                className="btn btn-secondary dropdown-toggle"
                type="button"
                id="tagsList"
                data-bs-toggle="dropdown"
                onClick={() => handleUniqueTags()}
              >
                {filterTag === 'all' ? 'All tags' : filterTag}
              </button>
              <ul className="dropdown-menu" aria-labelledby="tagsList">
                <li>
                  <a
                    className="dropdown-item  fs-4 fw-bold"
                    href="#"
                    onClick={() => handleFilter('all')}
                  >
                    All tags
                  </a>
                </li>
                {uniqueTags.map((item) => (
                  <li>
                    <a
                      className="dropdown-item  fs-4"
                      href="#"
                      onClick={() => handleFilter(item)}
                    >
                      {item.charAt(0) + item.slice(1)}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            {filterTag !== 'all' ? (
              <div className="form-group m-1">
                <div className="row">
                  <div className="col">
                    <input
                      type="text"
                      className="form-control"
                      onChange={(e) => setLimit(e.target.value)}
                    />
                  </div>
                  <div className="col-3">
                    <select
                      className="fw-bold fs-4 form-select"
                      aria-label="Select Unit"
                      onChange={(e) => setUnit(e.target.value)}
                    >
                      <option value="wei" className="fs-4 fw-bold">
                        wei
                      </option>
                      <option value="gwei" className="fs-4 fw-bold">
                        gwei
                      </option>
                      <option value="eth" className="fs-4 fw-bold">
                        eth
                      </option>
                    </select>
                  </div>
                  <div className="col-3">
                    <button
                      className="btn btn-primary m-1 fs-5 fw-bold w-100"
                      onClick={async () => await handleSetLimit(limit, unit)}
                    >
                      Set Limit
                    </button>
                  </div>
                </div>
              </div>
            ) : null}
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
                onClick={() => {
                  handleFilterDate({
                    startDate: new Date('2000-01-01'),
                    endDate: new Date('2100-01-01'),
                  });
                  window.location.reload();
                }}
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
                              style={{ cursor: 'pointer' }}
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
                          style={{ cursor: 'pointer' }}
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
        <div className="col-lg-3 col-md-6 col-12">
          {usageArray.length > 0 && piedata && persistanceData[accountNo] ? (
            <>
              <h4 className="p-2 mt-3 fw-bold">Spending Breakdown</h4>
              <Doughnut data={piedata} />
              <h4 className="p-2 fw-bold">Tag Usage </h4>

              {uniqueTags.map((tag) => {
                let used, limit;
                try {
                  used = persistanceData[accountNo].usage[tag].used;
                  limit = persistanceData[accountNo].usage[tag].limit;
                } catch (err) {
                  used = 56;
                  limit = 100;
                }

                console.log(used, limit);

                const usedF = FixedNumber.from(used);
                const limitF = FixedNumber.from(limit);
                let percentage = Number(
                  (Number(usedF.divUnsafe(limitF).toString()) * 100).toFixed(2),
                );
                return (
                  <div className="" style={{ padding: 10 }}>
                    <div className="col-sm-auto"> {tag} </div>
                    <div className="row">
                      <div className="col-sm-auto"> {percentage} % </div>
                      <div
                        className="bg-light rounded border col"
                        style={{ padding: 0, height: 'fit-content' }}
                      >
                        <div
                          className="bg-success rounded"
                          style={{
                            height: 20,
                            width: percentage < 1 ? 1 : percentage,
                          }}
                        ></div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
}

/*
<>
              <div className="" style={{ padding: 10 }}>
                <h4 className="p-2 fw-bold">Tags Limits </h4>

                <div className="col-sm-auto"> ads </div>
                <div className="row">
                  <div className="col-sm-auto"> 43% </div>
                  <div
                    className="bg-light rounded border col"
                    style={{ padding: 0, height: 'fit-content' }}
                  >
                    <div
                      className="bg-success rounded"
                      style={{ height: 20, width: 43 + '%' }}
                    ></div>
                  </div>
                </div>
              </div>
            </>
*/
