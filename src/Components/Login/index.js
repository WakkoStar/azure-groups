import React,{useEffect, useState} from 'react'

import config from "../../env/Config"
import {getAdminGroups, getUserDetails} from '../../API/GraphService';

import {connect} from 'react-redux';
import {setAdminGroupsRedux} from "../../Store/Actions"

import { UserAgentApplication } from 'msal';
import ClipLoader from "react-spinners/ClipLoader";

import NavBar from './NavBar';
import Welcome from './Welcome';
import Platform from '../Platform/index';

const Login = ({setAdminGroupsRedux, adminGroups}) => {
    const [user, setUser] = useState({isAuth: false, name: ""})
    const [session, setSession] = useState(undefined)
    const [accountIsLoaded, setAccountIsLoaded] = useState(false)

    useEffect(() => {
        const connectionAdmin = async() => {

            //Créer une session pour l'admin
            const session = new UserAgentApplication({
                auth: {
                    clientId: config.appId,
                    authority: "https://login.microsoftonline.com/98604871-595c-4bfa-86fd-a0b40f83c27f",
                    redirectURI: "http://localhost:3000"
                },
                cache: {
                    cacheLocation: "localStorage",
                    storeAuthStateInCookie: true
                }
            });
            //save the session
            setSession(session)
    
            //if already connected
            const admin = session.getAccount()
            if(admin){
                //Creer un access token
                session.acquireTokenSilent({
                    scopes: config.scopes,
                    authority : "https://login.microsoftonline.com/98604871-595c-4bfa-86fd-a0b40f83c27f"
                })
                .then((accessToken) =>{
                    // On recupere les informations depuis GraphService et on modifie le state
                    getUserDetails(accessToken)
                    .then(async(user) => {
                        //get groups
                        getAdminGroups(accessToken)
                        .then((adminGroups) => {
                            setAdminGroupsRedux(adminGroups)
                            setUser({isAuth: true, name: user.displayName })
                            setAccountIsLoaded(true)
                        })
                    })
                    .catch((err) => {
                        console.log(err)
                        alert("Nous n'avons pas réussi à récupérer vos données")
                    })
                })
                .catch((err) => {
                    console.log(err)
                    //l'utilisateur est déconnecté mais le cache a gardé le token, 
                    //il faut tout enlever et rafraichir la page
                    localStorage.clear()
                    window.location.reload();
                })
            }else{
                setAccountIsLoaded(true)
            }
        }
        connectionAdmin()
    },[setAdminGroupsRedux])

    const login = async() => {
        if(session){
            session.loginPopup(
                {
                scopes: config.scopes,
                prompt: "select_account"
            })
            .then(async() =>{
                //On récupere ses informations
                //Creer un access token
                const accessToken = await session.acquireTokenSilent({
                    scopes: config.scopes,
                    authority : "https://login.microsoftonline.com/98604871-595c-4bfa-86fd-a0b40f83c27f"
                });
                //S'il existe
                if (accessToken) {
                    // On recupere les informations depuis GraphService et on modifie le state
                    getUserDetails(accessToken)
                    .then(async(user) => {
                        //get groups
                        getAdminGroups(accessToken)
                        .then((adminGroups) => {
                            setAdminGroupsRedux(adminGroups)
                            setUser({isAuth: true, name: user.displayName })
                            setAccountIsLoaded(true)
                        })
                    })
                    .catch((err) => {
                        console.log(err)
                    })
                }
            })
            .catch((err) => {
                console.log(err)
                alert('Erreur de connexion')
            })
        }
    }
    //Fonction pour se deconnecter
    const logout = () => {
        session.logout();
    }

    return (
        <>
        <NavBar isAuth={user.isAuth} logout={logout}/>
        {
            user.isAuth ? (
            <Platform />
            ):(
            accountIsLoaded ? (
                <Welcome
                isAuthenticated={user.isAuth}
                user={user}
                authButtonMethod={user.isAuth ? "" : login} />
            ):(
                <div className="sweet-loading">
                <ClipLoader
                    size={150}
                    color={"#FFFFFF"}
                    loading={accountIsLoaded}
                />
                </div>
            )
            )
        }
        </>
    );
}

const mapDispatchToProps = (dispatch) => {
    return {
        setAdminGroupsRedux: (groups) => dispatch(setAdminGroupsRedux(groups)),
    }
}

const mapStateToProps = (state) => {
    return state;
}

export default connect(mapStateToProps, mapDispatchToProps)(Login);

