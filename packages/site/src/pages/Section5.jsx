import React, { useEffect, useState } from 'react';
import TableSection from './TableSection';

export default function Section5() {
  const value = 60;
  const tag = 'entertainment and movies';

  return (
    <div className="" style={{ padding: 10 }}>
      <h4 className="p-2 fw-bold">Tags Limits </h4>

      <div className="col-sm-auto"> {tag} </div>
      <div className="row">
        <div className="col-sm-auto"> {value}% </div>
        <div
          className="bg-light rounded border col"
          style={{ padding: 0, height: 'fit-content' }}
        >
          <div
            className="bg-success rounded"
            style={{ height: 20, width: value + '%' }}
          ></div>
        </div>
      </div>
    </div>
  );
}
