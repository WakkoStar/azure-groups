import React,{useState, useEffect} from 'react';
import config from '../env/Config';
import groups from '../env/Groups';
import {getUsersfromMail, inviteUserfromMail, getIDfromUser, affectUsertoGroup} from '../API/GraphService';

const MessageCheckbox = (props) => {
  let saisie = <p style={{color: '#0188cc'}}>Veuillez sélectionnez au moins un groupe</p>
  if(props.canSubmit) saisie = <p>Votre saisie est valide</p>;
  return saisie;
}

const Formpage = (props) => {

  const {adminGroups} = props
  const [userInvited, setUserInvited] = useState({})
  const [userSearch, setUserSearch] = useState([])
  const [inputEmail, setInputEmail] = useState(undefined)
  const [selectedGroups, setSelectedGroups] = useState([])
  const [canSubmit, setCanSubmit] = useState([])

  useEffect(() => {
    searchUser("");
  },[props])

  const searchUser = async(mail) => {
    // Get the user's access token
      const accessToken = await window.msal.acquireTokenSilent({
        scopes: config.scopes
      });

      getUsersfromMail(accessToken, mail)
      .then((users_search) => {
        setUserSearch(users_search.value)
      })

      setInputEmail(mail)
  }

  const inviteUser = async(e, user) => {
    e.preventDefault()
    const accessToken = await window.msal.acquireTokenSilent({
      scopes: config.scopes
    });
    let id = user.id
    if(id ===  ''){
      const new_user = await inviteUserfromMail(accessToken, user.email);
      id = await getIDfromUser(new_user);
      setUserInvited({id})
    }

    for (var i = 0; i < selectedGroups.length; i++) {
      await affectUsertoGroup(accessToken, selectedGroups[i], id);
    }

    alert("L'utilisateur " + user.email + " à été affecté au(x) groupe(s)" );
  }

  ///SET GROUPS
  const setGroups = (groupId, index) => {
    const selection = selectedGroups
    let props = canSubmit

    //select groups
    if(!selection.includes(groupId)){
      selection.push(groupId)
      props[index] = true
    }else{
      const index = selection.findIndex((group) => group === groupId)
      selection.splice(index, 1)
      props[index] = false
    }
    setSelectedGroups(selection)
    setCanSubmit(props)

  }

  const selectUser = (e, user) => {
    e.preventDefault()
    setUserInvited({id: user.id,email : user.mail})
  }

  const ListSearch = (props) => {
    const {user} = props
    if(user !== null ){
      return(
        <li key={user.id} style={{backgroundColor: user.mail === userInvited.email ? '#ececec' : 'white'}}>
          <p>{user.displayName}</p>
          <button onClick={(e) => selectUser(e,user)}>Selectionner</button>
        </li>
      )
    }else{
      return(
        <li key="0" style={{backgroundColor: inputEmail  === userInvited.email ? '#ececec' : 'white'}}>
          <p>{inputEmail}</p>
          <button onClick={(e) => selectUser(e,{id: "",email : inputEmail})}>Selectionner</button>
        </li>
      )
    }
  }

  ////SET CHECK BOXES ////
  const Checkboxes = (props) => {
    const {group, index} = props
    if(adminGroups[index] === group.id){
      return(
        <div className="checkboxes">
          <input
          type="submit"
          onClick={() => setGroups(group.id, index)}
          value={canSubmit[index] ? "true" : "false"}
          />
        </div>
      )
    }else{
      return <label>...</label>
    }
  }

  return(
    <section id="Invitation">
      <article>
        <div className="form">

          <div>
            <h1>Inviter un utilisateur</h1>
            <input
              type="text"
              name="email"
              placeholder="Rechercher par mail"
              onChange={(e) => searchUser(e.target.value)}
            />
            <div style={{overflowY: 'scroll'}}>
              <ul>
                {
                  userSearch.length !== 0 ? (
                    userSearch.map((user) => {
                      return <ListSearch key={user.id} user={user}/>
                    })
                  ):(
                    <ListSearch user={null}/>
                  )
                }
              </ul>
            </div>
          </div>
          <div>
          <MessageCheckbox canSubmit={canSubmit}/>
          {
            adminGroups.length > 0 ? (
              groups.invite.map((group, index) => {
                return <Checkboxes key={group.id} group={group} index={index}/>
              })
            ):(
              <p>Aucun groupe...</p>
            )
          }
          </div>
          <p style={{width: '100%'}}>
            Utilisateur sélectionné : {userInvited.email !== '' ? userInvited.email : 'aucun'}
          </p>
          <button
          disabled={userInvited.email === "" || !canSubmit}
          onClick={(e) => inviteUser(e, userInvited)}
          >
            Inscrire l'utilisateur
          </button>
        </div>
      </article>
    </section>
  )
}

export default Formpage
