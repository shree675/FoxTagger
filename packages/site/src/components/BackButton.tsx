import React from 'react';

const BackButton = ({ reset }: any) => {
  return (
    <div onClick={reset} className="text-8xl mr-4">
      &#8249;
    </div>
  );
};

export default BackButton;
