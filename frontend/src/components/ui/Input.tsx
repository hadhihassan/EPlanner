import React from "react";
type Props = React.InputHTMLAttributes<HTMLInputElement>;
const Input = (props: Props) => (
  <input
    className="w-full border rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-primary"
    {...props}
  />
);
export default Input;
