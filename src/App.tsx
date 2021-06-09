import React, { Component } from "react";
import { ApolloProvider } from "@apollo/react-hooks";
import { ApolloClient } from "apollo-client";
import { InMemoryCache } from "apollo-cache-inmemory";
import { HttpLink } from "apollo-link-http";
import { setContext } from "apollo-link-context";
import moment from "moment";
import jwt_decode from "jwt-decode";
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Redirect,
} from "react-router-dom";
import Navbar from "./components/Navbar";
import Register from "./pages/Register";
import Home from "./pages/Home";
import Account from "./pages/Account";
const NETWORK_INTERFACE = "https://api.bazzile.ch";

export default class App extends Component {
  state = {
    isLoadingComplete: false,
    client: null,
    token: null,
  };
  async componentDidMount() {
    try {
      const token = localStorage.getItem("token");
      console.log("token token", token);
      if (!!token) {
        const { exp }: { exp: number } = jwt_decode(token);
        if (exp < moment().unix()) {
          localStorage.removeItem("token");
        } else {
          this.setState({ token });
        }
      } else {
        this.setState({ token: null });
      }
      await this.createCLient();
    } catch (e) {
      console.warn("error", e);
    } finally {
      this.setState({ isLoadingComplete: true });
    }
  }
  authLink = () => {
    return setContext((_, { headers }) => {
      const token = localStorage.getItem("token");
      return {
        headers: {
          ...headers,
          authorization: token ? `Bearer ${token}` : {},
        },
      };
    });
  };

  async createCLient() {
    const client = new ApolloClient({
      link: this.authLink().concat(new HttpLink({ uri: NETWORK_INTERFACE })),
      cache: new InMemoryCache(),
    });
    this.setState({ client });
  }

  render() {
    const { isLoadingComplete, client, token } = this.state;
    if (!isLoadingComplete || client === null) {
      return null;
    } else {
      return (
        //@ts-ignore
        <ApolloProvider client={client}>
          <div>
            <Router>
              <div>
                <Navbar />
                <div className="container">
                  <Switch>
                    <Route path="/register" exact component={Register} />
                    <Route path="/home" exact component={Home} />
                    <Route path="/account" exact component={Account} />
                    <Route
                      path="/logout"
                      exact
                      render={() => {
                        localStorage.removeItem("token");
                        //@ts-ignore
                        window.location = "/register";
                        return null;
                      }}
                    />
                    <Redirect to={token ? "/home" : "/register"} />
                  </Switch>
                </div>
              </div>
            </Router>
          </div>
        </ApolloProvider>
      );
    }
  }
}
