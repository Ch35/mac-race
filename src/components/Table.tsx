async function getData() {
  // TODO: fetch data from DB
}

export default async function Table() {
  const data = await getData();

  console.log({data}); //! d

  return (
    <></>
  );
}