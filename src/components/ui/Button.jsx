import { Link } from "react-router-dom";
import { buttonClass } from "./buttonStyles";

export function Button({ variant, size, className, type = "button", ...props }) {
  return (
    <button
      type={type}
      className={buttonClass({ variant, size, className })}
      {...props}
    />
  );
}

export function ButtonLink({ variant, size, className, ...props }) {
  return <Link className={buttonClass({ variant, size, className })} {...props} />;
}

export function ButtonAnchor({ variant, size, className, ...props }) {
  return <a className={buttonClass({ variant, size, className })} {...props} />;
}
