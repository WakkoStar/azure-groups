import React, { useState, useEffect } from "react"
import config from "../../env/Config"
import {getUsersfromMail, inviteUserfromMail, getIDfromUser, affectUsertoGroup, getMembersfromGroup} from "../../API/GraphService"
import {setNextLink, setMembersRedux} from "../../Store/Actions"
import {connect} from "react-redux"
const useObservable = observable => {
    const [state, setState] = useState();
  
    useEffect(() => {
      const sub = observable.subscribe(setState);
      return () => sub.unsubscribe();
    }, [observable]);
  
    return state;
  };

const MemberAdd = ({members, selectedGroup, setNextLink, setMembersRedux}) => {
    const [userSearch, setUserSearch] = useState([])
    const [inputEmail, setInputEmail] = useState('')
    

    useEffect(() => {
        searchUser("")
    },[selectedGroup])

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
        affectUsertoGroup(accessToken, selectedGroup.id, new_id)
        .then(
            () => {
                alert(mail + " à été ajouté au groupe " + selectedGroup.displayName)
                getMembersfromGroup(accessToken, selectedGroup.id)
                .then(({value,'@odata.nextLink': nextLink}) => {
                    setMembersRedux(value)
                    setNextLink(nextLink)
                })
            }
        )
        .catch(
            () => {
                alert("L'utilisateur n'a pas pu etre ajouté")
            }
        )
        
    }

    const ListSearch = ({user, i}) => {
        if(user !== null){
            //filter members already is the group
            let isTaken = members.some(({id}) => id === user.id);
            //display all available users
            if(!isTaken) {
                return (
                    <li key={i}>
                    <p>{user.displayName}</p>
                    <button onClick={() => addUser(user.id,user.mail)}>Inviter</button>
                    </li>
                )
            }
            //Search for only one user and is taken
            if(isTaken && userSearch.length === 1 && inputEmail === userSearch[0].mail) {
                return (
                    <li>
                    <p>L'utilisateur est déjà dans le groupe</p>
                    </li>
                )
            }
        }else{
            if(selectedGroup.id !== ""){
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

        return null
    }   

    return (
        <div style={{height:'80%'}}>
            <div className="form">
            <h2>Ajouter un membre</h2>
            <input
                type="text"
                autoComplete="off"
                name="email"
                placeholder="Rechercher par mail"
                id="user_add"
                onChange={(e) => searchUser(e.target.value)}
            />
            <div>
                <ul>
                {
                    userSearch.length > 0 && members.length > 0 ? (
                    userSearch.map((user, index) => {
                        return <ListSearch user={user} i={index} key={index}/>
                    })
                    ):(
                        <ListSearch user={null} i={0}/>
                    )
                }
                </ul>
            </div>
            </div>
        </div>
    )
}

const mapDispatchToProps = (dispatch) => {
    return {
        setMembersRedux: (members) => dispatch(setMembersRedux(members)),
        setNextLink: (link) => dispatch(setNextLink(link))
    }
}

const mapStateToProps = (state) => {
    return state;
}

export default connect(mapStateToProps, mapDispatchToProps)(MemberAdd);