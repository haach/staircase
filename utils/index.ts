export const serialize = (data: any) => JSON.parse(JSON.stringify(data));
export const isTouchDevice = () => {
  var el = document.createElement('div');
  el.setAttribute('ongesturestart', 'return;'); // or try "ontouchstart"
  // @ts-ignore
  return typeof el.ongesturestart === 'function';
};
export const toYYYYMMDD = (date: Date | string) => {
  const DATE = new Date(date);
  const year = DATE.getFullYear();
  const month = DATE.getMonth() + 1;
  const day = DATE.getDate();
  return `${year}-${month}-${day}`;
};

export const formatDate = (date: Date | string) =>
  new Date(date).toLocaleDateString('en-US', {year: 'numeric', month: 'long', day: 'numeric'});
