import React, { useMemo, useState, useEffect } from 'react'
import {selectMemberRedux, setMembersRedux,setNextLink} from "../../Store/Actions"
import {connect} from "react-redux"
import {getMoreMembersfromGroup} from "../../API/GraphService"
import config from "../../env/Config"

const MemberList = ({setNextLink, nextLink, selectMemberRedux, setMembersRedux, members, selectedMember}) => {

    const LoadMore = () => {

        const loadMembers = async() => {
            // Get the user's access token
            const accessToken = await window.msal.acquireTokenSilent({
                scopes: config.scopes
            });

            getMoreMembersfromGroup(accessToken, nextLink, 50)
            .then(({value,'@odata.nextLink': newLink}) => {
                const allMembers = members.concat(value)
                setMembersRedux(allMembers)
                setNextLink(newLink)
            })
        }

        return(
            <tr>
                <th scope="row">#</th>
                <td></td>
                <td></td>
                <td onClick={() => loadMembers()}><button>Charger plus</button></td>
            </tr>
        )
    }


    const List = ({members = []}) => {
        let list = []
        
        for (var i = 0; i < members.length; i++) {
            const member = members[i]
                list[i] = (
                    <tr style={{backgroundColor: member.id === selectedMember.id ? '#dee2e6' : 'transparent'}} key={i}>
                    <th scope="row" key={i}>{i}</th>
                    <td>{member.displayName}</td>
                    <td>{member.mail}</td>
                    <td onClick={() => selectMemberRedux(member)}><button>Sélectionner</button></td>
                    </tr>
                )
            }
        //si un nextlink existe on peut demander de charger plus de membres
        if(nextLink) list.push(<LoadMore />)
        return list
    }

    return(
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
                    <List members={members}/>
                </tbody>
            </table>
        </div>
    )
}

const mapDispatchToProps = (dispatch) => {
    return {
        selectMemberRedux: (member) => dispatch(selectMemberRedux(member)),
        setMembersRedux: (members) => dispatch(setMembersRedux(members)),
        setNextLink: (link) => dispatch(setNextLink(link))
    }
}

const mapStateToProps = (state) => {
    return state;
}

export default connect(mapStateToProps, mapDispatchToProps)(MemberList);