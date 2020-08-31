export const selectGroupRedux = (group) => (
    {
        type :'SELECT_GROUP',
        value: group
    }
)

export const setMembersRedux = (members) => (
    {
        type:'SET_MEMBERS',
        members
    }
)

export const setNextLink = (link) => (
    {
        type:'NEXT_LINK',
        link
    }
)
export const setAdminGroupsRedux = (groups) => (
    {
        type: 'SET_ADMIN_GROUPS',
        groups
    }
)

export const selectMemberRedux = (member) => (
    {
        type: 'SELECT_MEMBER',
        member
    }
)