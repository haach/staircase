export const serialize = (data: any) => JSON.parse(JSON.stringify(data));
export const isTouchDevice = () => {
  var el = document.createElement('div');
  el.setAttribute('ongesturestart', 'return;'); // or try "ontouchstart"
  // @ts-ignore
  return typeof el.ongesturestart === 'function';
};

export const to_yyyyMMdd = (date: Date) => new Date(date).toISOString().slice(0, 10);

export const formatDate = (date: Date | string) =>
  new Date(date).toLocaleDateString('en-US', {year: 'numeric', month: 'long', day: 'numeric'});

export const nameOrEmail = (user: {email: string; name?: string}) =>
  user.name ? `${user.name} (${user.email})` : user.email;
