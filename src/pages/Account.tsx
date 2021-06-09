import { gql, useMutation, useQuery } from "@apollo/client";
import React from "react";
import { Redirect } from "react-router";
import {
  AppButton,
  Input,
  useFormData,
  useFormValidation,
} from "../components/Form";
const Account = ({ history }: { history: any }) => {
  const token = localStorage.getItem("token");
  const [user, setUser] = React.useState(null);
  const [loading, setLoading] = React.useState(false);
  const query = useQuery(gql`
    query accountsProfile {
      accountsProfile {
        birthdate
        email
        firstName
        id
        language
        lastName
        phoneCountryCode
        phoneNumber
      }
    }
  `);

  const [data, onChange] = useFormData({
    firstName: "",
    lastName: "",
    phoneNumber: "",
    birthdate: "",
    email: "",
  });
  const [errors, validate, setErrors] = useFormValidation({}, (Yup: any) => {
    return {
      email: Yup.string().required().email().label("Email"),
      lastName: Yup.string().required().label("Last Name"),
      firstName: Yup.string().required().label("First Name"),
      phoneNumber: Yup.string().required().label("Phone"),
      birthdate: Yup.string().required().label("Birth Date"),
    };
  });

  const [mutate] = useMutation(
    gql`
      mutation ProfileQuery(
        $birthdate: Date!
        $email: String!
        $firstName: String!
        $lastName: String!
        $phoneNumber: String!
      ) {
        accountsProfile(
          birthdate: $birthdate
          firstName: $firstName
          email: $email
          lastName: $lastName
          phoneNumber: $phoneNumber
        ) {
          id
          birthdate
          firstName
          firstName
          phoneNumber
        }
      }
    `
  );
  React.useEffect(() => {
    if (!query.loading) {
      const item = query.data.accountsProfile;
      setUser(item);
      //@ts-ignore
      onChange({
        firstName: item.firstName,
        lastName: item.lastName,
        phoneNumber: item.phoneNumber,
        birthdate: item.birthdate,
        email: item.email,
      });
    }
  }, [query.loading]);
  const onSubmit = React.useCallback(() => {
    validate(data)
      .then(async () => {
        setLoading(true);
        try {
          const { data: obj } = await mutate({
            variables: data,
          });
          console.log("updted", obj);
          alert("profile updated");
          history.push("/home");
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
  if (!token) return <Redirect to="/register" />;
  return (
    <div>
      <div className="row align-items-center justify-content-center mt-5">
        <div className="col-md-4">
          <h1>Update profile</h1>
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

          <AppButton
            title="Update"
            loading={loading}
            className="btn-primary btn-block"
            onPress={onSubmit}
          />
        </div>
      </div>
    </div>
  );
};

export default Account;
