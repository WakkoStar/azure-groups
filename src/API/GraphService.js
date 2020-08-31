

var graph = require('@microsoft/microsoft-graph-client');
//Initialiser le client sur Microsoft graph
function getAuthenticatedClient(accessToken)
{
  // Initialize Graph client
  const client = graph.Client.init({
    // Use the provided access token to authenticate
    // requests
    authProvider: (done) => {
      done(null, accessToken.accessToken);
    }
  });

  return client;
}

//Recuperer le client courant
export async function getUserDetails(accessToken)
{
  const client = getAuthenticatedClient(accessToken);
  //Le client courant
  const user = await client.api('/me').get();
  return user;
}



/*** RECUPERER LES INFOS USERS ****/
//Recuperer les users recherchés
export async function getUsersfromMail(accessToken, mail)
{
  const client = getAuthenticatedClient(accessToken);
  //Recupere tout les users
  let users = await client.api('/users').select('id,displayName,mail').top(10).get();
  //Si le mail n'est pas vide récuperer les users a partir de la saisie
  if(mail !== "")
  {
    users = await client.api('/users').select('id,displayName,mail').top(10).filter('startswith(mail,\'' + mail + '\')').get();
  }
  return users;
}

//recuperer id de l'user sous forme de promise
export async function getIDfromUser(user)
{
  //id
  const id = user.invitedUser.id;
  return id;
}

//recuperer user a partir de l'id
export async function getUserfromID(accessToken ,id)
{
  const client = getAuthenticatedClient(accessToken);
  //get user
  const user = await client.api('/users/'+id).select('id, displayName, mail').get();
  return user;
}



/***CONTROLER LES MEMBRES **/
//Créer un utilisateur
export async function inviteUserfromMail(accessToken, mail)
{
  const client = getAuthenticatedClient(accessToken);

  const invitation = await client.api('/invitations')
    .post({
        invitedUserEmailAddress: mail.toLowerCase(),
        inviteRedirectUrl: `https://myapps.microsoft.com/?tenantid=98604871-595c-4bfa-86fd-a0b40f83c27f&login_hint=${mail.toLowerCase()}`,
        sendInvitationMessage: true,
        invitedUserDisplayName: mail.slice(0,mail.indexOf('@')).toLowerCase()
    });
  return invitation;
}

//Affecter l'user selectionné au groupe désiré
export async function affectUsertoGroup(accessToken, id_group, id_user)
{
  const client = getAuthenticatedClient(accessToken);

  //creer un membre
  const member = client.api('/groups/'+ id_group +'/members/$ref')
    .post({
      '@odata.id': "https://graph.microsoft.com/v1.0/users/" + id_user
    });

  return member;
}

//supprimer un membre d'un groupe
export async function deleteMember(accessToken, id_group, id_user)
{
  const client = getAuthenticatedClient(accessToken);

  let user = await client.api("/groups/"+id_group+"/members/"+id_user+"/$ref").delete();
}



/**RECUPERER LES MEMBRES **/
//récuperer les membres d'un groupes
export async function getMembersfromGroup(accessToken, id_group)
{
  const client = getAuthenticatedClient(accessToken);
  //get members
  const members = await client.api('groups/'+id_group+'/members').top(20).get();
  return members;
}

export async function getMembersfromGroupSearch(accessToken, id_group, mail)
{
  const client = getAuthenticatedClient(accessToken);

  if( mail === ''){
    const members = await client.api('groups/'+id_group+'/members').top(20).get();
    return members
  }

  const members = await client.api('groups/'+id_group+'/members').top(999).get();
  const searchMembers = await searchMore(members, client)

  const allMembers = searchMembers.value.map((member) => {
      if(!member.mail) return{...member, mail: member.displayName}
      return {...member}
  })
  const filterMembers = allMembers.filter(
      (member) => member.mail && member.mail.toLowerCase().includes(mail.toLowerCase())
  )

  return {...searchMembers, value: filterMembers, '@odata.nextLink': undefined}
}

const searchMore = async(members, client) => {
    const {'@odata.nextLink': isNextLink } = members
    if(isNextLink){ 
        const currentMembers  = await client.api(isNextLink.slice(32)).top(999).get();
        return {...currentMembers, value: currentMembers.value.concat(await searchMore(currentMembers, client))}
    }else{
        return members
    }
}


export async function getMoreMembersfromGroup(accessToken, req, top)
{
  const client = getAuthenticatedClient(accessToken);
  //get members
  const members = await client.api(req.slice(32)).top(top).get();
  return members;
}

//Vérifier s'il l'user fait partie du groupes
export async function checkUserIsMember(accessToken,id_group, id_user)
{
  const client = getAuthenticatedClient(accessToken);

  //get user from group
  const user = await client.api("/groups/"+id_group+"/members/"+id_user+"/$ref").get();
  return user
}

export async function getMemberOf(accessToken){
  const client = getAuthenticatedClient(accessToken);

  const list =  await client.api("/me/memberOf").select('id, displayName').top(900).get()
  return list
}

//Vérifier s'il l'admin est propriétaire du groupe
export async function checkUserIsOwner(accessToken,id_group, id_user)
{
  const client = getAuthenticatedClient(accessToken);

  //get user from group
  const admin = await client.api("/groups/"+id_group+"/owners/"+id_user+"/$ref").get();
  return admin
}

//Recuperer les groupes dans lequel fait partie l'admin et retourne les groupes invités
export async function getAdminGroups(accessToken)
{
  //get admin details
  var admin = await getUserDetails(accessToken);
  var groups_admin = await getMemberOf(accessToken)
  //l'admin fait partie des groupes
  var adminGroups = [];
  //Verifier pour chaque groupe que l'admin appartient aux groupes
  groups_admin.value.map(
    async(group_admin) => {
      try {
          await checkUserIsOwner(accessToken,group_admin.id, admin.id);
          adminGroups.push(group_admin);
      } catch (e) {
      }
    });
  
  return adminGroups;
}
