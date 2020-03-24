var graph = require('@microsoft/microsoft-graph-client');
var generator = require('generate-password');
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
  let users = await client.api('/users').select('id,displayName,mail').get();
  //Si le mail n'est pas vide récuperer les users a partir de la saisie
  if(mail !== "")
  {
    users = await client.api('/users').select('id,displayName,mail').filter('startswith(mail,\'' + mail + '\')').get();
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
          inviteRedirectUrl: "https://azure-groups.herokuapp.com/",
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

  const user = await client.api("/groups/"+id_group+"/members/"+id_user+"/$ref").delete();
  return user;
}



/**RECUPERER LES MEMBRES **/
//récuperer les membres d'un groupes
export async function getMembersfromGroup(accessToken, id_group)
{
  const client = getAuthenticatedClient(accessToken);
  //get members
  const members = await client.api('groups/'+id_group+'/members').get();
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

//Recuperer les groupes dans lequel fait partie l'admin
export async function getAdminGroups(accessToken, groups_admin, groups_invite)
{
  //get admin details
  var admin = await getUserDetails(accessToken);
  //l'admin fait partie des groupes
  var adminGroups = [];
  //Verifier pour chaque groupe que l'admin appartient aux groupes
  groups_admin.map(
    async(group_admin,index) => {
      try {
          await checkUserIsMember(accessToken,group_admin.id, admin.id);
          adminGroups.push(groups_invite[index].id);
      } catch (e) {
        adminGroups.push("");
      }
    });

  return adminGroups;
}
