import React from 'react';
import { NavLink as RouterNavLink } from 'react-router-dom';
import { NavItem } from 'reactstrap';
const NavBar = (props) => {

    return (
      <header>
        <nav>
            <div>
              <img src="https://upload.wikimedia.org/wikipedia/fr/8/87/Grand_paris_seine_et_oise.png" alt=""/>
              <h1>Azure groups</h1>
            </div>
            <ul>
                <NavItem>
                  <RouterNavLink to="/" className="nav-link" exact>Connexion</RouterNavLink>
                </NavItem>
                {props.isAuthenticated ?
                (
                  <NavItem>
                    <RouterNavLink to="/inviter-utilisateur" className="nav-link" exact>Inviter</RouterNavLink>
                  </NavItem>
                ): (
                  ""
                )}
                {props.isAuthenticated ?
                (
                  <NavItem>
                    <RouterNavLink to="/liste-utilisateur" className="nav-link" exact>Groupes</RouterNavLink>
                  </NavItem>
                ) : (
                  ""
                )}

            </ul>
        </nav>
      </header>
    )
}

export default NavBar
