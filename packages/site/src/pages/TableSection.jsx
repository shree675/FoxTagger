import React, { useEffect, useState } from 'react';
import GetTableData from './GetTableData';

export default function TableSection(props) {
  return (
    <div>
      <GetTableData props={props.props} />
    </div>
  );
}
