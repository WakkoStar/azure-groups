import React from 'react';
const NavBar = (props) => {

    const logout = () => {
        props.logout()
    }

    return (
      <header>
        {
          props.isAuth ? (
            <nav>
                <ul>
                    <li>
                      <div>
                        <img src="https://upload.wikimedia.org/wikipedia/fr/8/87/Grand_paris_seine_et_oise.png" alt=""/>
                      </div>
                    </li>
                    <li onClick={logout}>Se déconnecter</li>
                </ul>
            </nav>
          ):""
        }
      </header>
    )
}

export default NavBar
