export const serialize = (data: any) => JSON.parse(JSON.stringify(data));
export const isTouchDevice = () => {
  var el = document.createElement('div');
  el.setAttribute('ongesturestart', 'return;'); // or try "ontouchstart"
  // @ts-ignore
  return typeof el.ongesturestart === 'function';
};
