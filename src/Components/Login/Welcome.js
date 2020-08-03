import React from 'react';

const Welcome = (props) => {

  const SetIsAuth = () => {
    //S'il est authenthifié : afficher ses informations
    if(props.isAuthenticated)
    {
      return(
        <article>
          <h1>{props.user.name}</h1>
          <h2>Bienvenue dans votre espace AZURE GROUPS</h2>
          <div>
            <button onClick={props.authButtonMethod}>Se deconnecter</button>
            <p>Vous êtes connecté</p>
          </div>
        </article>
      );
    }
    //Sinon seuelement un bouton de connexion
    return (
      <article>
        <div>
          <button onClick={props.authButtonMethod}>Se connecter</button>
          <p>Veuillez vous connecter</p>
        </div>
      </article>
    )
  }

  return(
    <section id="Jumbotron">
      <SetIsAuth
        isAuthenticated={props.isAuthenticated}
        user={props.user}
        authButtonMethod={props.authButtonMethod} />
    </section>
  )

}

export default Welcome;
