import React, { useState, useEffect } from "react"

import config from "../../env/Config"

import {getMembersfromGroup} from "../../API/GraphService"

import {selectGroupRedux, setMembersRedux, setNextLink, selectMemberRedux} from "../../Store/Actions"

import {connect} from "react-redux"

function GroupList({setNextLink, selectedGroup, adminGroups, setMembersRedux, selectGroupRedux, selectMemberRedux}) {
    const [groups, setGroups] = useState([])

    const selectGroup = async({id, displayName}) => {
        selectGroupRedux({id, displayName})
        // Get the user's access token
        const accessToken = await window.msal.acquireTokenSilent({
            scopes: config.scopes
        });

        getMembersfromGroup(accessToken, id)
        .then(({value,'@odata.nextLink': nextLink}) => {
            setMembersRedux(value)
            setNextLink(nextLink)
        })

        //Reset selections and searchs
        document.getElementById("user_add").value = ''

        selectMemberRedux({id: ""})
    }

    const ButtonList = ({group, i}) => {
        const {id, displayName} = group
        return(
        <button
            onClick={() => selectGroup({id,displayName})}
            key={i}
            className={selectedGroup.id === group.id ? 'selected' : 'not-selected'}
        >
            {group.displayName}
        </button>
        )
    }

    return (
        <div id="group_nav">
            {
                groups.length > 0 ? (
                    groups.map((group, index) => {
                        return <ButtonList group={group} i={index} key={index} />
                    })
                ):(
                    <button
                        onClick={() => setGroups(adminGroups)}
                        className='not-selected'
                    >
                        Afficher les groupes
                    </button>
                )
            }
        </div>
    )
}


const mapDispatchToProps = (dispatch) => {
    return {
        selectGroupRedux: (group) => dispatch(selectGroupRedux(group)),
        setMembersRedux: (members) => dispatch(setMembersRedux(members)),
        setNextLink: (link) => dispatch(setNextLink(link)),
        selectMemberRedux: (member) => dispatch(selectMemberRedux(member))
    }
}

const mapStateToProps = (state) => {
    return state;
}

export default connect(mapStateToProps, mapDispatchToProps)(GroupList);
