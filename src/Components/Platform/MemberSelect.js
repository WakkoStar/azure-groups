import React from "react"
import {selectMemberRedux, selectGroupRedux, setMembersRedux, setNextLink} from "../../Store/Actions"
import {connect} from "react-redux"
import config from "../../env/Config"
import {inviteUserfromMail, deleteMember, getMembersfromGroup} from "../../API/GraphService"
const Select = ({selectedMember, selectedGroup, selectMemberRedux, setNextLink, setMembersRedux}) => {

    //Handle members////
    const inviteUser = async(user) => {
        // Get the user's access token
        const accessToken = await window.msal.acquireTokenSilent({
        scopes: config.scopes
        });
        if(!user.mail){
            alert("L'utilisateur n'a pas d'adresse mail ! ")
            return null
        }
        inviteUserfromMail(accessToken, user.mail)
        .then(() => {
                alert("Une invitation à été envoyée à " + user.mail );
        })
        .catch(() => {
                alert("L'invitation n'a pas pu être envoyé à " + user.mail );
        });
        selectMemberRedux({id: ""})
    }

    const deleteUser = async(groupId, user) =>{
        const accessToken = await window.msal.acquireTokenSilent({
            scopes: config.scopes
        });

        deleteMember(accessToken, groupId, user.id )
        .then(() => {
            alert("L'utilisateur " + user.mail && user.mail + " à été supprimé " );
            getMembersfromGroup(accessToken, selectedGroup.id)
            .then(({value,'@odata.nextLink': nextLink}) => {
                setMembersRedux(value)
                console.log(value)
                setNextLink(nextLink)
            })
        })
        .catch(() => {
            alert("L'utilisateur n'a pas pu etre supprimé")
        })
        
        
        

        selectMemberRedux({id: ""})
    }

    return(
        <div style={{height:'20%'}}>
            <h2>Modifier un membre</h2>
            <p>Sélection : <strong>{selectedMember.displayName}</strong></p>
            <button
                onClick={() => inviteUser(selectedMember)}
                style={{marginRight: '0.5vw'}}
                disabled={!selectedMember.id}>
                Réinviter
            </button>
            <button
                onClick={() => deleteUser(selectedGroup.id, selectedMember)}
                disabled={!selectedMember.id}>
                Supprimer
            </button>
        </div>
    )
}

const mapDispatchToProps = (dispatch) => {
    return {
        setMembersRedux: (members) => dispatch(setMembersRedux(members)),
        selectGroupRedux: (group) => dispatch(selectGroupRedux(group)),
        selectMemberRedux: (member) => dispatch(selectMemberRedux(member)),
        setNextLink: (link) => dispatch(setNextLink(link))
    }
}

const mapStateToProps = (state) => {
    return state;
}

export default connect(mapStateToProps, mapDispatchToProps)(Select);
