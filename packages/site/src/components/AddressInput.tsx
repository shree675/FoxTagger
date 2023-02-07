import React, { useState } from 'react';
import { shortAddress } from '../utils/utils';
import Input from './Input';

const AddressInput = ({
  isNewMsg,
  onInputBlur,
  errorMsg,
  selectedConvo,
}: {
  isNewMsg: boolean;
  onInputBlur: (newAddress: string) => void;
  errorMsg: string;
  selectedConvo: any;
}) => {
  const [newAddress, setNewAddress] = useState('');
  return (
    <div className="flex">
      {isNewMsg ? (
        <>
          <Input
            setNewValue={setNewAddress}
            placeholder="Enter a wallet address"
            value={newAddress}
            onInputBlur={() => onInputBlur(newAddress)}
          />
          {errorMsg && (
            <span className="new-address flex-dir-col">{errorMsg}</span>
          )}
        </>
      ) : (
        <b className=" text-3xl mt-10 align-middle">
          {shortAddress(selectedConvo)}
        </b>
      )}
    </div>
  );
};

export default AddressInput;
