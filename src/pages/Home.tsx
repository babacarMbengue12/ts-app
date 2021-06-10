import { gql, useQuery } from "@apollo/client";
import * as React from "react";
import { Redirect } from "react-router";
import { AppButton } from "../components/Form";

export interface HomeProps {
  history: any;
}

const Home = ({ history }: HomeProps) => {
  const token = localStorage.getItem("token");
  if (!token) return <Redirect to="/register" />;
  const [user, setUser] = React.useState(null);
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
  React.useEffect(() => {
    if (!query.loading) {
      const item = query.data?.accountsProfile;
      setUser(item);
    }
  }, [query.loading]);
  return (
    <div className="container">
      <h1>Home Page</h1>

      <h4>
        {/*@ts-ignore */}
        Logged in as {user?.firstName} {user?.lastName}
      </h4>
      <AppButton
        loading={false}
        onPress={() => {
          history.push("/account");
        }}
        className="btn-primary btn-block"
        title="Update Account"
      />
    </div>
  );
};

export default Home;
