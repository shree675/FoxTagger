import React from 'react';

const BackButton = ({ reset }: any) => {
  return (
    <div onClick={reset} className="flex back-chevron justify-center">
      &#8249;
    </div>
  );
};

export default BackButton;
