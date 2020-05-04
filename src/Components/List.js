import React,{useState, useEffect} from 'react';
import config from '../env/Config';
import groups from '../env/Groups';
import {getUsersfromMail, inviteUserfromMail, getIDfromUser, affectUsertoGroup, getMembersfromGroup, deleteMember} from '../API/GraphService';

const List = (props) => {

  const {adminGroups} = props
  const[userSelected, setSelectUser] = useState({})
  const[groupSelected, setGroupSelected] = useState({id:""})
  const[memberGroup, setMemberGroups] = useState([])
  const[userSearch, setUserSearch] = useState([])
  const [inputEmail, setInputEmail] = useState(undefined)

  useEffect(() => {
    searchUser("")
  },[props])

  const filterMembers = async(mail) => {
    // Get the user's access token
    const accessToken = await window.msal.acquireTokenSilent({
      scopes: config.scopes
    });
    //Refresh group for each request
    getMembersfromGroup(accessToken, groupSelected.id)
    .then((members) => {
      const {value} = members
      //Correct null mails
      for (var i = 0; i < value.length; i++) {
        if(!value[i].mail) value[i].mail = value[i].displayName
      }
      const filterMembers = value.filter((member) => member.mail.includes(mail))
      setMemberGroups(filterMembers);
    })
  }

  const selectGroup = async(id, name) => {
    setGroupSelected({id, name})
    // Get the user's access token
      const accessToken = await window.msal.acquireTokenSilent({
        scopes: config.scopes
      });

    getMembersfromGroup(accessToken, id)
    .then((members) => {
          setMemberGroups(members.value)
    })
  }

  const searchUser = async(mail) => {
    const accessToken = await window.msal.acquireTokenSilent({
      scopes: config.scopes
    });

    getUsersfromMail(accessToken, mail)
    .then((userSearch) => {
      setUserSearch(userSearch.value)
    })

    setInputEmail(mail)
  }

  const addUser = async(id, mail) => {
    const accessToken = await window.msal.acquireTokenSilent({
      scopes: config.scopes
    })

    let new_id = id;
    if(new_id === '')
    {
      //Créer un user
      const new_user = await inviteUserfromMail(accessToken, mail);
      new_id = await getIDfromUser(new_user);
    }
    await affectUsertoGroup(accessToken, groupSelected.id, new_id);

    alert(mail + " à été ajouté au groupe " + groupSelected.name)
    window.location.reload();
  }

  //Handle members////
  const inviteUser = async(user) => {
    // Get the user's access token
    const accessToken = await window.msal.acquireTokenSilent({
      scopes: config.scopes
    });

    await inviteUserfromMail(accessToken, user.mail);
    alert("Une invitation à été envoyée à " + user.mail );
  }

  const deleteUser = async(groupId, user) =>{
      const accessToken = await window.msal.acquireTokenSilent({
        scopes: config.scopes
      });

    await deleteMember(accessToken, groupId, user.id );

    alert("L'utilisateur " + user.mail + " à été supprimé " );
    window.location.reload();
  }

  const ListSearch = ({user, i}) => {
    if(user !== null){
        let isTaken = false;
        //filter members already is the group
        for (var i = 0; i < memberGroup.length; i++) {
          if(memberGroup[i].id === user.id) isTaken = true;
        }

        if(!isTaken) {
          return (
            <li key={i}>
              <p>{user.displayName}</p>
              <button onClick={() => addUser(user.id,user.mail)}>Inviter</button>
            </li>
          )
        }
    }else{
        if(groupSelected.id !== ""){
            return (
              <li>
                <p>{inputEmail}</p>
                <button onClick={() => addUser("",inputEmail)}>Inviter</button>
              </li>
            )
        }else{
            return (
              <li>
                <p>Veuillez selectionnez un groupe</p>
              </li>
            )
        }
  }

    return false
  }

  const MemberList = () => {
    let list = []

    for (var i = 0; i < memberGroup.length; i++) {
      const member = memberGroup[i]
      list[i] = (
        <tr style={{backgroundColor: member.id === userSelected.id ? '#dee2e6' : 'transparent'}}>
          <th scope="row" key={i}>{i}</th>
          <td>{member.displayName}</td>
          <td>{member.mail}</td>
          <td onClick={() => setSelectUser(member)}><button>Sélectionner</button></td>
        </tr>
      )
    }
    return list
  }

  const ButtonList = ({group, i}) => {
    if(adminGroups[i] === group.id){
          return(
            <button
              onClick={() => selectGroup(group.id, group.name)}
              key={i}
              className={groupSelected.id === group.id ? 'selected' : 'not-selected'}
            >
            {group.name}
            </button>
          )
    }else{
      return false
    }
  }

  return(
    <section id="Groups">
      <article>

        <div id="group_nav">
          {
            adminGroups.length > 0 ? (
              groups.invite.map((group, index) => {
                return <ButtonList group={group} i={index}/>
              })
            ):(
                <p>Aucun groupe</p>
            )
          }
        </div>

        <div style={{width:"100%"}} id="search">
          <h2>Rechercher un membre </h2>
          {
            groupSelected.id !== "" ?(
              <input
                type="text"
                placeholder="Rechercher par mail"
                onChange={(e) => filterMembers(e.target.value)}
              />
            ) : (
              <p>Veuillez sélectionnez un groupe</p>
            )
          }
        </div>

        <div id="table">
          <table>
            <thead>
              <tr>
                <th scope="col">#</th>
                <th scope="col">Login</th>
                <th scope="col">Mail</th>
                <th scope="col">Modifier</th>
              </tr>
            </thead>
            <tbody>
              <MemberList/>
            </tbody>
          </table>
        </div>

        <div id="member_nav">
          <div style={{height:'20%'}}>
            <h2>Modifier un membre</h2>
            <p>Sélection : <strong>{userSelected.displayName}</strong></p>
            <button
              onClick={() => inviteUser(userSelected)}
              style={{marginRight: '0.5vw'}}
              disabled={!userSelected.id}>
              Réinviter
            </button>
            <button
              onClick={() => deleteUser(groupSelected.id, userSelected)}
              disabled={!userSelected.id}>
              Supprimer
            </button>
          </div>

          <div style={{height:'80%'}}>
            <form autoComplete="off">
              <h2>Ajouter un membre</h2>
              <input
                type="text"
                name="email"
                placeholder="Rechercher par mail"
                onChange={(e) => searchUser(e.target.value)}
              />
              <div>
                <ul>
                  {
                    userSearch.length > 0 && memberGroup.length > 0 ? (
                      userSearch.map((user, index) => {
                        return <ListSearch user={user} i={index}/>
                      })
                    ):(
                      <ListSearch user={null} i={0}/>
                    )
                  }
                </ul>
              </div>
            </form>
          </div>
        </div>

      </article>
    </section>
  )
}

export default List
