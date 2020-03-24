import React, { Component } from 'react';
import { BrowserRouter as Router, Route } from 'react-router-dom';
import NavBar from './NavBar';
import Welcome from './Welcome';
import config from './Config';
import { UserAgentApplication } from 'msal';
import Formpage from './Form';
import List from './List';
import "./App.sass"
import groups from './Groups';
import {getAdminGroups, getUserDetails} from './GraphService';

class App extends Component  {
  constructor(props){
    super(props);

    //Créer une session pour l'admin
    this.userAgentApplication = new UserAgentApplication({
          auth: {
              clientId: config.appId,
              authority: "https://login.microsoftonline.com/fd87095d-65db-4894-98c3-4f76bdd06eb2",
              redirectURI: "https://azure-groups.herokuapp.com/"
          },
          cache: {
              cacheLocation: "localStorage",
              storeAuthStateInCookie: true
          }
      });

    //Récuperer le compte de l'admin
    var admin = this.userAgentApplication.getAccount();

    //Create state
    this.state = {
      isAuthenticated: (admin !== null),
      user: {},
      error: null,
      adminGroups: [],
      selected_groups: []
    };

    //Si l'admin existe : recuperer ses informations
    if (admin) this.getUserProfile();
  }


  //fonction pour se connecter
  async login() {
    try {
      //L'admin selectionne son compte
      await this.userAgentApplication.loginPopup(
          {
            scopes: config.scopes,
            prompt: "select_account"
        });
      //On récupere ses informations
      await this.getUserProfile();
    }
    catch(err) {
      //Si rien, on modifie l'user et on affiche l'erreur
      var error = {};
      if (typeof(err) === 'string') {
        var errParts = err.split('|');
        error = errParts.length > 1 ?
          { message: errParts[1], debug: errParts[0] } :
          { message: err };
      } else {
        error = {
          message: err.message,
          debug: JSON.stringify(err)
        };
      }
      this.setState({
        isAuthenticated: false,
        user: {},
        error: error
      });
    }
  }

  //Fonction pour se deconnecter
  logout() {
    this.userAgentApplication.logout();
  }

  //fonction pour recuperer les informations de l'admin
  async getUserProfile() {
      try {
        //Creer un access token
        var accessToken = await this.userAgentApplication.acquireTokenSilent({
          scopes: config.scopes,
          authority : "https://login.microsoftonline.com/fd87095d-65db-4894-98c3-4f76bdd06eb2"
        });

        //S'il existe
        if (accessToken) {
          // On recupere les informations depuis GraphService et on modifie le state
          var user = await getUserDetails(accessToken);
          this.setState({
            isAuthenticated: true,
            user: {
              displayName: user.displayName,
              email: user.mail || user.userPrincipalName
            },
            error: null
          });
        }
      }
      catch(err) {
        //Sinon recuperer l'erreur et l'afficher
        var error = {};
        if (typeof(err) === 'string') {
          var errParts = err.split('|');
          error = errParts.length > 1 ?
            { message: errParts[1], debug: errParts[0] } :
            { message: err };
        } else {
          error = {
            message: err.message,
            debug: JSON.stringify(err)
          };
        }

        this.setState({
          isAuthenticated: false,
          user: {},
          error: error
        });
      }
  }

  setAdminGroups = async() => {

    // Get the user's access token
      var accessToken = await window.msal.acquireTokenSilent({
        scopes: config.scopes
      });

    var adminGroups = await getAdminGroups(accessToken, groups.admin, groups.invite);
    this.setState({adminGroups});

    var selected_groups = [];
    groups.invite.map(
      (group, index) => {
        selected_groups.push(false);
      }
    )
    this.setState({selected_groups})
  }
  render(){
    return (
      <Router>
        <NavBar isAuthenticated={this.state.isAuthenticated}/>
        <Route exact path="/"
          render={() =>
            <Welcome
              isAuthenticated={this.state.isAuthenticated}
              user={this.state.user}
              authButtonMethod={this.state.isAuthenticated ? this.logout.bind(this) : this.login.bind(this)} />
          } />
          {this.state.isAuthenticated ?
            (
              <Route exact path="/inviter-utilisateur"
                render={() =>
                  <Formpage
                    adminGroups={this.state.adminGroups}
                    selected_groups={this.state.selected_groups}
                    authCallback={this.setAdminGroups} />
                } />
            ) : (
              ""
            )
          }
          {this.state.isAuthenticated ?
            (
              <Route exact path="/liste-utilisateur"
                render={() =>
                  <List
                  adminGroups={this.state.adminGroups}
                  selected_groups={this.state.selected_groups}
                  authCallback={this.setAdminGroups} />
                } />
            ) : (
              ""
            )
          }

      </Router>
    );
  }
}

export default App;
