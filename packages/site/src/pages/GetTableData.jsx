import React from 'react';
import DATA_local from './data';

const colorMap = {
  food: 'text-bg-primary',
  shopping: 'text-bg-success',
  transportation: 'text-bg-warning',
  entertainment: 'text-bg-danger',
  travel: 'text-bg-info',
};

const TabCol = styled.div`
   background-color: ${(props) => props.theme.colors.background.default};
    color: ${(props) => props.theme.colors.text.default};
`;

export default function GetTableData(props) {
  let DATA = props.props;
  console.log('api data :', DATA);

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

  const [filterAddress, setFilterAddress] = React.useState('all');

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
            <tr>
              <th colSpan={2}>Address</th>
              <th colSpan={1}>Date</th>
              <th colSpan={1}>Amount</th>
              <th colSpan={2}>Tags</th>
              <th colSpan={2}>Notes</th>
            </tr>
          </thead>
          <tbody>
            {finalData.map((item) => (
              <tr key={item._id}>
                <td colSpan={2}>{item.address}</td>
                <td colSpan={1}>{item.date}</td>
                <td colSpan={1}>{item.amount}</td>
                <td colSpan={2}>
                  <div>
                    {item.tags.map((tag) => (
                      <span
                        className={
                          'badge m-1 shadow rounded-2 ' + colorMap[tag]
                        }
                      >
                        {tag}
                        &nbsp;
                        <span class="badge bg-light text-muted rounded-circle opacity-50">
x
</span> 
                      </span>
                    ))}

<span class="badge bg-success shadow  text-white rounded opacity-50">
+
</span> 

                  </div>
                </td>
                <td colSpan={2}>{item.notes}</td>
              </tr>
            ))}
          </tbody>
        </table> 
      </div>
    </div>
  );
}
