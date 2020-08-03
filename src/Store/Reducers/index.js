const initialState = {
    selectedGroup: {id: "", displayName: ""},
    members: [], 
    adminGroups: [{}],
    selectedMember: {id: ""}
};

function handleApp(state = initialState, action){

    let nextState;
    switch (action.type) {
        case 'SELECT_GROUP':
            nextState = {
                ...state,
                selectedGroup: {id: action.value.id, displayName: action.value.displayName}
            }
        return nextState;

        case 'SET_MEMBERS':
            nextState = {
                ...state,
                members: action.members
            }
        return nextState;
        
        case 'NEXT_LINK':
            nextState = {
                ...state,
                nextLink: action.link
            }
        return nextState;
        
        case 'SET_ADMIN_GROUPS':
            nextState = {
                ...state,
                adminGroups: action.groups
            }
        return nextState;
        
        case 'SELECT_MEMBER':
            nextState = {
                ...state,
                selectedMember: action.member
            }
        return nextState;

        default:
        return state;
    }
}

export default handleApp;