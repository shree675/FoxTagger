import React, { useEffect, useState } from 'react';
import TableSection from './TableSection';

export default function Section5() {
  const value = 60;
  const tag = 'entertainment and movies';

  return (
    <div className="" style={{ padding: 10 }}>
      <h4 className="p-2 fw-bold">Tags Limits </h4>

      <div class="col-sm-auto"> {tag} </div>
      <div class="row">
        <div class="col-sm-auto"> {value}% </div>
        <div
          class="bg-light rounded border col"
          style={{ padding: 0, height: 'fit-content' }}
        >
          <div
            class="bg-success rounded"
            style={{ height: 20, width: value + '%' }}
          ></div>
        </div>
      </div>
    </div>
  );
}
