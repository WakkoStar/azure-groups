import React, { useState, useEffect } from 'react';

import { BrowserRouter as Router, Route } from 'react-router-dom';
import { UserAgentApplication } from 'msal';

import NavBar from '../Components/NavBar';
import Welcome from '../Components/Welcome';
import List from '../Components/List';

import config from '../env/Config';
import groups from '../env/Groups';

import "./App.sass"

import {getAdminGroups, getUserDetails} from '../API/GraphService';

const App = () => {

  const [user, setUser] = useState({isAuth: false, name: ""})
  const [adminGroups, setAdminGroups] = useState([])
  const [session, setSession] = useState(undefined)

  useEffect(() => {
    createSessionForAdmin()
  },[])

  const createSessionForAdmin = async() => {
    //Créer une session pour l'admin
    const session = new UserAgentApplication({
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
    const admin = session.getAccount()
    if(admin) await getUserProfile(session)
    //save the session
    setSession(session)
  }

  const setGroupsForAdmins = async(user) => {
    // Get the user's access token
      const accessToken = await window.msal.acquireTokenSilent({
        scopes: config.scopes
      });

      getAdminGroups(accessToken, groups)
      .then((adminGroups) => {
        setAdminGroups(adminGroups)
        setUser({isAuth: true, name: user.displayName })
      })
  }

  const getUserProfile = async(session) => {

    //Creer un access token
    const accessToken = await session.acquireTokenSilent({
      scopes: config.scopes,
      authority : "https://login.microsoftonline.com/fd87095d-65db-4894-98c3-4f76bdd06eb2"
    });

    //S'il existe
    if (accessToken) {
        // On recupere les informations depuis GraphService et on modifie le state
        getUserDetails(accessToken)
        .then(async(user) => {
          await setGroupsForAdmins(user)
        })
        .catch((err) => {
          console.log(err)
        })
    }
  }

  const login = async() => {
    if(session){
      session.loginPopup(
        {
          scopes: config.scopes,
          prompt: "select_account"
      })
      .then(async() =>{
        //On récupere ses informations
        await getUserProfile(session);
      })
      .catch((err) => {
        console.log(err)
      })
    }
  }

  //Fonction pour se deconnecter
  const logout = () => {
    session.logout();
  }

  const PrivateRoutes = () => {
    if(user.isAuth){
      return (
        <Route exact path="/liste-utilisateur">
            <List groups={adminGroups}/>
        </Route>
      )
    }

    return "";
  }

  return (
    <Router>
      <NavBar isAuthenticated={user.isAuth}/>
      <Route exact path="/"
        render={() =>
          <Welcome
            isAuthenticated={user.isAuth}
            user={user}
            authButtonMethod={user.isAuth ? logout : login} />
        } />
        <PrivateRoutes />
    </Router>
  );
}

export default App
