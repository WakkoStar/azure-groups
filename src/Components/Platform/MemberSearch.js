import React, { useEffect, useState, useLayoutEffect } from 'react'
import {getMembersfromGroupSearch, getMembersfromGroup} from "../../API/GraphService"
import config from '../../env/Config';
import { Observable, fromEvent} from 'rxjs';
import { throttleTime } from 'rxjs/operators';

import {connect} from "react-redux"
import {setMembersRedux, setNextLink} from "../../Store/Actions"

const Search = ({setMembersRedux, selectedGroup, setNextLink}) => {
    const [mailReact, setMailReact] = useState('')
    const [mail, setMail] = useState('')

    useEffect(() => {
        const filterMembers = async() => {
            // Get the user's access token
            const accessToken = await window.msal.acquireTokenSilent({
                scopes: config.scopes
            }); 
            //Refresh group for each request
            const members = await getMembersfromGroupSearch(accessToken, selectedGroup.id, mail)
            const {value, '@odata.nextLink': nextLink} = members
            setMembersRedux(value)
            setNextLink(nextLink)
        }
        filterMembers()
    },[mail, selectedGroup, setMembersRedux, setNextLink])
    
    

    return(
        <div style={{width:"100%"}} id="search">
            <h2>Rechercher un membre </h2>
            {
                selectedGroup.id !== "" ?(
                <>
                    <input
                        type="text"
                        placeholder="Rechercher par mail"
                        id="user_search"
                        onChange={(e) => setMailReact(e.target.value)}
                    />
                    <button onClick={() => setMail(mailReact)} title="Rechercher">
                        Rechercher
                    </button>
                </>
                ) : (
                <p>Veuillez sélectionnez un groupe</p>
                )
            }
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

export default connect(mapStateToProps, mapDispatchToProps)(Search);
