import { gql, useMutation } from "@apollo/client";
import React from "react";
import { Redirect } from "react-router";
import {
  AppButton,
  Input,
  useFormData,
  useFormValidation,
} from "../components/Form";
const Register = ({ history }: { history: any }) => {
  const token = localStorage.getItem("token");

  const [loading, setLoading] = React.useState(false);
  const [data, onChange] = useFormData({
    firstName: "",
    lastName: "",
    phoneNumber: "",
    birthdate: "",
    email: "",
    password: "",
    phoneCountryCode: "+221",
  });
  const [errors, validate, setErrors] = useFormValidation({}, (Yup: any) => {
    return {
      email: Yup.string().required().email().label("Email"),
      password: Yup.string().required().label("Password"),
      lastName: Yup.string().required().label("Last Name"),
      firstName: Yup.string().required().label("First Name"),
      phoneNumber: Yup.string().required().label("Phone"),
      birthdate: Yup.string().required().label("Birth Date"),
    };
  });

  const [mutate] = useMutation(
    gql`
      mutation RegisterQuery(
        $birthdate: Date!
        $email: String!
        $firstName: String!
        $lastName: String!
        $password: String!
        $phoneCountryCode: String!
        $phoneNumber: String!
      ) {
        accountsSignup(
          birthdate: $birthdate
          password: $password
          firstName: $firstName
          email: $email
          lastName: $lastName
          phoneCountryCode: $phoneCountryCode
          phoneNumber: $phoneNumber
        )
      }
    `
  );
  const onSubmit = React.useCallback(() => {
    validate(data)
      .then(async () => {
        setLoading(true);
        try {
          const {
            data: { accountsSignup },
          } = await mutate({
            variables: data,
          });
          console.log("loggedIn", accountsSignup);
          localStorage.setItem("token", accountsSignup);
          //@ts-ignore
          window.location = "/home";
        } catch (ex: any) {
          console.log("error gql", ex.graphQLErrors);
          const { graphQLErrors = null } = ex;
          setLoading(false);
          if (graphQLErrors) {
            const message = graphQLErrors[0] ? graphQLErrors[0].message : "";
            if (message.includes("duplicate key")) {
              setErrors({
                email: "l'email existe déjà, veuillez en choisir un autre",
              });
              return;
            } else {
              const newError = {};
              Object.keys(graphQLErrors[0].details).map((k) => {
                //@ts-ignore
                newError[k] = graphQLErrors[0].details[k].join("\n");
              });
              setErrors(newError);
            }
          } else {
            setErrors({
              email: "une erreur inattendue s'est produite, veuillez réessayer",
            });
          }
        }
      })
      .catch((ex: any) => {
        console.log("error validate", ex);
      });
  }, [data, validate, history]);
  if (token) return <Redirect to="/home" />;
  return (
    <div>
      <div className="row align-items-center justify-content-center mt-5">
        <div className="col-md-4">
          <h1>Register</h1>
          <Input
            name="email"
            value={data.email}
            onChange={onChange}
            error={errors.email}
            label="Email"
            type="email"
          />
          <Input
            name="firstName"
            value={data.firstName}
            onChange={onChange}
            error={errors.firstName}
            label="First Name"
          />
          <Input
            name="lastName"
            value={data.lastName}
            onChange={onChange}
            error={errors.lastName}
            label="Last Name"
          />
          <Input
            name="phoneNumber"
            value={data.phoneNumber}
            onChange={onChange}
            error={errors.phoneNumber}
            type="tel"
            label="Phone Number"
          />
          <Input
            name="birthdate"
            value={data.birthdate}
            onChange={onChange}
            error={errors.birthdate}
            label="Birth Date"
            type="date"
          />
          <Input
            name="password"
            value={data.password}
            onChange={onChange}
            error={errors.password}
            label="Password"
            type="password"
          />
          <AppButton
            title="Register"
            loading={loading}
            className="btn-primary btn-block"
            onPress={onSubmit}
          />
        </div>
      </div>
    </div>
  );
};

export default Register;
