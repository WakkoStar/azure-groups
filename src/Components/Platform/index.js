import React from "react"
import GroupList from "./GroupList"
import MemberSearch from "./MemberSearch"
import MemberList from "./MemberList"
import MemberSelect from "./MemberSelect"
import MemberAdd from "./MemberAdd"
const Platform = () => {

    return(
        <section id="Groups">
        <article>
            <GroupList/>
            <MemberSearch />
            <MemberList />
            <div id="member_nav">
                <MemberSelect/>
                <MemberAdd />    
            </div>
        </article>
        </section>
    )
}

export default Platform