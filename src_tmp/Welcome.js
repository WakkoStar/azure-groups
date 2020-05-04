import React from 'react';

function WelcomeContent(props)
{
  //S'il est authenthifié : afficher ses informations
  if(props.isAuthenticated)
  {
    return(
      <article>
        <h1>{props.user.displayName}</h1>
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

export default class Welcome extends React.Component
{
  render(){
    return(
      <section id="Jumbotron">
        <WelcomeContent
          isAuthenticated={this.props.isAuthenticated}
          user={this.props.user}
          authButtonMethod={this.props.authButtonMethod} />
      </section>
    );
  }
}
