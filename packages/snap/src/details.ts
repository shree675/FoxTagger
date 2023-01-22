var counter = 0;

export const storeDetails = async (transaction: Record<string, unknown>) => {
  //   console.log(transaction);
  const newTransaction: { from: any; to: any; value: any } = {
    from: transaction.from,
    to: transaction.to,
    value: transaction.value,
  };

  console.log("transaction:", newTransaction);

  // await wallet.request({
  //   method: "snap_manageState",
  //   params: ["update", { hello: "world" }],
  // });

  // // returns null
  // const persistedData = await wallet.request({
  //   method: "snap_manageState",
  //   params: ["get"],
  // });

  // console.log(persistedData);

  await wallet.request({
    method: "snap_manageState",
    params: ["clear"],
  });

  return {
    test: `${counter++}`,
  };
};
