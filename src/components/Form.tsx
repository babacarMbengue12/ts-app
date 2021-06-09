import React from "react";
import * as yup from "yup";

export function FormError({ error }: { error?: string }) {
  return (
    <div style={{ marginTop: 5, marginBottom: 5 }}>
      <small style={{ color: "#A00" }}>{error}</small>
    </div>
  );
}

interface ButtonProps {
  onPress: (e: any) => any;
  title?: string;
  loading: boolean;
  className?: string;
}

export function AppButton({
  onPress,
  title,
  className,
  loading,
  ...props
}: ButtonProps) {
  return (
    <button
      onClick={(e) => {
        if (loading) return;
        e.preventDefault();
        onPress(e);
      }}
      disabled={loading}
      className={`btn ${className}`}
      {...props}
    >
      {loading ? "chargement..." : title}
    </button>
  );
}
interface inputProps {
  error?: string;
  value?: string;
  name?: string;
  type?: string;
  label?: string;
  onChange: Function;
}
export function Input({
  error,
  onChange,
  value,
  label,
  name,
  type = "text",
}: inputProps) {
  return (
    <div className="mb-3">
      <label htmlFor={name} className="form-label">
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(name, e.target.value)}
        className="form-control"
        id={name}
        name={name}
        placeholder={label}
      />
      {!!error && <FormError error={error} />}
    </div>
  );
}
export const useFormData = (formData: {
  [key: string]: string;
}): [data: { [key: string]: string }, onDataChange: () => any] => {
  const [data, setData] = React.useState(formData);
  const onDataChange = React.useCallback(
    (
      fieldName?: string | { [key: string]: string },
      value?: string | { [key: string]: string }
    ) => {
      if (typeof fieldName === "object") {
        setData({ ...data, ...fieldName });
        return;
      }
      if (fieldName === null) {
        if (typeof value === "object") {
          setData(value);
        }
        return;
      }
      if (typeof fieldName === "string") {
        let keys = Object.keys(data);
        if (keys.includes(fieldName)) {
          let newdata = { ...data };
          //@ts-ignore
          newdata[fieldName] = value;
          setData(newdata);
        } else {
          throw new Error(fieldName + " is not a valid key");
        }
      }
    },
    [data, setData]
  );
  return [data, onDataChange];
};

export const useFormValidation = (
  initalErrors: { [key: string]: string },
  cbRules: Function
): [
  errors: { [key: string]: string },
  validate: Function,
  setErrors: Function
] => {
  const [errors, setErrors] = React.useState(initalErrors);
  const Schema = yup.object().shape(cbRules(yup));
  const validate = React.useCallback(
    (data) => {
      return new Promise((resolve, reject) => {
        Schema.validate(data, { abortEarly: false })
          .then(() => {
            setErrors({});
            resolve(data);
          })
          .catch(function (err) {
            console.log("error validation", err);
            let newErrors = {};
            for (let e of err.inner) {
              //@ts-ignore
              newErrors[e.path] = e.errors[0];
            }
            setErrors(newErrors);
            reject(newErrors);
          });
      });
    },
    [Schema, setErrors]
  );
  return [errors, validate, setErrors];
};
