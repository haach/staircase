/** @jsxImportSource @emotion/react */
import {css} from '@emotion/react';

interface InputProps extends React.HTMLProps<HTMLInputElement> {
  label: string;
}

export const InputGenerator = (fields: Array<InputProps>, prefix?: string) =>
  fields.map(({id, label, prefix, ...rest}) => (
    <div key={id}>
      <label htmlFor={prefix ? `${prefix}-${id}` : id}>{label}</label>
      <input
        id={prefix ? `${prefix}-${id}` : id}
        {...rest}
        css={css`
          width: 100%;
          border: 1px solid grey;
          border-radius: 4px;
          padding: 2px 6px;
        `}
      />
    </div>
  ));
