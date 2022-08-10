interface InputProps extends React.HTMLProps<HTMLInputElement> {
  label: string;
}

export const InputGenerator = (fields: Array<InputProps>, prefix?: string) =>
  fields.map(({id, label, ...rest}) => (
    <div key={id}>
      <label htmlFor={prefix ? `${prefix}-${id}` : id}>{label}</label>
      <input id={prefix ? `${prefix}-${id}` : id} {...rest} />
    </div>
  ));
