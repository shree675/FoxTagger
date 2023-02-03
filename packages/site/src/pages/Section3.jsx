import React from 'react';

export default function Section3() {
  return (
    <div className="container m-0 p-0 mt-1">
      <h4 className="p-2 fw-bold">Ongoing Transactions</h4>
      <ol className="list-group list-group-numbered overflow-y-scroll">
        <li className="list-group-item d-flex justify-content-between align-items-start">
          <div className="ms-2 me-auto">
            <div className="fw-bold">Subheading</div>
            Content for list item
          </div>
          <span className="badge bg-primary rounded-pill">14</span>
        </li>
        <li className="list-group-item d-flex justify-content-between align-items-start">
          <div className="ms-2 me-auto">
            <div className="fw-bold">Subheading</div>
            Content for list item
          </div>
          <span className="badge bg-primary rounded-pill">14</span>
        </li>
      </ol>
    </div>
  );
}
