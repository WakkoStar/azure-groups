import React from 'react';
import config from './Config';
import {} from './GraphService';
import groups from './Groups';
import {getUsersfromMail, inviteUserfromMail, getIDfromUser, affectUsertoGroup, getMembersfromGroup, deleteMember} from './GraphService';
import ReactLoading from 'react-loading';

export default class List extends React.Component {
  constructor(props){

    super(props);

    this.state = {
      loading: true,
      user_selected: {},
      group_selected: {
        id:"",
        name:""
      },
      users_search: {},
      members_group : {}
    }
  }

  componentDidMount(){
    this.props.authCallback();
    this.searchUser(null, "");
    this.reloading();
  }

  reloading(){
    if(!this.state.loading){
      window.location.reload();
    }
    const timer = setTimeout(() => {
      this.setState({loading:false});
    }, 1000)
    return () => clearTimeout(timer);
  }

////SET LIST OF BUTTONS ////
  buttonsList = () => {
        var buttons = []

        groups.invite.map(

        (group, index) => {
            if(this.props.adminGroups[index] === group.id){
              buttons.push(
                  <button
                  onClick={(e) => this.selectGroup(e, group.id, group.name)}
                  key={index}
                  className={this.state.group_selected.id === group.id ? 'selected' : 'not-selected'}
                  >
                    {group.name}
                  </button>
                )
            }
        })
        if(buttons.length === 0) this.reloading();
        return buttons;
    }

    selectGroup = async(e, id, name) => {

      e.preventDefault();
      this.setState({group_selected:{id, name}, user_selected:{}})

      // Get the user's access token
        var accessToken = await window.msal.acquireTokenSilent({
          scopes: config.scopes
        });

      var members = await getMembersfromGroup(accessToken, id);
      this.setState({members_group: members.value});

    }

///SET RESEARCH MEMBERS////
   filterMembers = async(e, mail) => {
      e.preventDefault();
      await this.selectGroup(e, this.state.group_selected.id, this.state.group_selected.name );

      const members_group = []
      this.state.members_group.map(
        (member) => {
          if(member.mail == null) member.mail = member.displayName;
          if(member.mail.includes(mail)) members_group.push(member);
        }
      )
      this.setState({members_group});
   }

   searchUser = async(event, mail) => {
    // Get the user's access token
      var accessToken = await window.msal.acquireTokenSilent({
        scopes: config.scopes
      });

      var users_search = await getUsersfromMail(accessToken, mail);
      this.setState({users_search: users_search.value, input_email: mail});
  }

  list_search = () => {
    var list = [];

    if(this.state.users_search.length > 0 && this.state.members_group.length > 0 )
    {
      this.state.users_search.map(
        (user, index) => {
          let isTaken = false;

            this.state.members_group.map( (member) => {
              if(member.id == user.id) isTaken = true;
            })

          if(!isTaken) {
            list.push(
            <li key={index}>
              <p>{user.displayName}</p>
              <button onClick={(e) => this.addUser(e,user.id,user.mail)}>Inviter</button>
            </li>
          );
        }
    })}
    else
    {
        list.push(
          <li>
            <p>{this.state.input_email}</p>
            <button onClick={(e) => this.addUser(e,"",this.state.input_email)}>Inviter</button>
          </li>
        );
    }
    return list;
  }

  addUser = async(e, id, mail) => {
    e.preventDefault();
    var accessToken = await window.msal.acquireTokenSilent({
      scopes: config.scopes
    });
    let new_id = id;
    if(id === '')
    {
      //Créer un user
      var new_user = await inviteUserfromMail(accessToken, mail);
      new_id = await getIDfromUser(new_user);
    }

    await affectUsertoGroup(accessToken, this.state.group_selected.id, new_id);

    alert(mail + " à été ajouté au groupe " + this.state.group_selected.name)
    window.location.reload();
  }

///Get member list
  setMemberList = () => {

    var cells = [];

    this.state.members_group.map(
      (member, index) => {
        cells.push(
          <tr style={{backgroundColor: member.id == this.state.user_selected.id ? '#dee2e6' : 'transparent'}}>
            <th scope="row" key={index}>{index}</th>
            <td>{member.displayName}</td>
            <td>{member.mail}</td>
            <td onClick={(e) => this.selectUser(e, member)}><button>Sélectionner</button></td>
          </tr>
        );
      }
    );

    return cells;
  }

  selectUser = (e, member) => {
    e.preventDefault();
    this.setState({user_selected:member})
  }


//Handle members////
  inviteUser = async(e, user) => {
    e.preventDefault();
    // Get the user's access token
      var accessToken = await window.msal.acquireTokenSilent({
        scopes: config.scopes
      });

    await inviteUserfromMail(accessToken, user.mail);

    alert("Une invitation à été envoyée à " + user.mail );
    window.location.reload();
  }

  deleteUser = async(e,group_id, user) =>
  {
    e.preventDefault();
    // Get the user's access token
      var accessToken = await window.msal.acquireTokenSilent({
        scopes: config.scopes
      });

    await deleteMember(accessToken, group_id, user.id );

    alert("L'utilisateur " + user.mail + " à été supprimé " );
    window.location.reload();
  }

  render(){
    return(
      <section id="Groups">
        <article>
          <div id="group_nav">
            {this.state.loading ? <ReactLoading type={"bars"} color={"#0188cc"} height={"1vw"} width={"2vw"} />: this.buttonsList()}
          </div>
          <div style={{width:"100%"}} id="search">
            <h2>Rechercher un membre </h2>
            {this.state.group_selected.id === "" ?
            (
              <p>Veuillez sélectionnez un groupe</p>
            ) : (
              <input type="text" placeholder="Rechercher par mail" onChange={(e) => this.filterMembers(e, e.target.value)} />
            )}
          </div>
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
              {this.state.members_group.length > 0 ? this.setMemberList() : ""}
              </tbody>
            </table>
          </div>
          <div id="member_nav">
            <div style={{height:'20%'}}>
              <h2>Modifier un membre</h2>
              <p>Sélection : <strong>{this.state.user_selected.displayName}</strong></p>
              <button
                onClick={e => this.inviteUser(e, this.state.user_selected)}
                style={{marginRight: '0.5vw'}}
                disabled={!this.state.user_selected.id}>
                Réinviter
              </button>
              <button
                onClick={e => this.deleteUser(e, this.state.group_selected.id, this.state.user_selected)}
                disabled={!this.state.user_selected.id}>
                Supprimer
              </button>
            </div>
            <div style={{height:'80%'}}>
              <form autoComplete="off">
                <h2>Ajouter un membre</h2>
                <input type="text" name="email" id="email_azure" placeholder="Rechercher par mail" onChange={(e) => this.searchUser(e, e.target.value)}/>
                <div>
                <ul>
                {this.state.group_selected.id === ""? <p>Veuillez sélectionnez un groupe</p> : this.list_search()}
                </ul>
                </div>
              </form>
            </div>
          </div>
        </article>
      </section>
    )
  }
}
