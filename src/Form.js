import React from 'react';
import config from './Config';
import {getUsersfromMail, inviteUserfromMail, getIDfromUser, affectUsertoGroup} from './GraphService';
import groups from './Groups';
import ReactLoading from 'react-loading';

function MessageCheckbox(props)
{
  let saisie = <p style={{color: '#0188cc'}}>Veuillez sélectionnez au moins un groupe</p>
  props.groups.map(
    (bool_group) => {
      if(bool_group) saisie = <p>Votre saisie est valide</p>;
    }
  )
  //else
  return saisie;
}

export default class Formpage extends React.Component {
  constructor(props){
    super(props);

    this.state = {
      loading : true,
      user_invited:{
        id:"",
        email:""
      },
      users_search: {},
      members: {},
      input_email:"",

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

  isNotAffected(){
    let isNotAffected = true;
    this.props.selected_groups.map(
      (group_bool) => {
        if(group_bool) isNotAffected = false;
      }
    )
    return isNotAffected;
  }

///SET RESEARCH MEMBERS////
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

    if(this.state.users_search.length > 0)
    {
      this.state.users_search.map(
        (user, index) => {
          list.push(
            <li key={index} style={{backgroundColor: user.mail === this.state.user_invited.email ? '#ececec' : 'white'}}>
              <p>{user.displayName}</p>
              <button onClick={(e) => this.selectUser(e,user.id,user.mail)}>Selectionner</button>
            </li>
          );
        }
      )
    }else{
        list.push(
          <li key="0" style={{backgroundColor: this.state.input_email  === this.state.user_invited.email ? '#ececec' : 'white'}}>
            <p>{this.state.input_email}</p>
            <button onClick={(e) => this.selectUser(e,"",this.state.input_email)}>Selectionner</button>
          </li>
        );
    }

    return list;
  }

  selectUser = (e, id, email) => {
    e.preventDefault();
    this.setState({user_invited:{id,email}});
  }

///SET TO GROUPS
  setGroups = (e, index) =>{
    var selected_groups = this.props.selected_groups;
    selected_groups[index] = selected_groups[index] === true ? false : true;
    this.setState({selected_groups});

    /*
    bien tout commenter
    */
  }

////SET CHECK BOXES ////
  checkboxes = () => {
        var inputs = []
        groups.invite.map(

        (group, index) => {
            if(this.props.adminGroups[index] === group.id){
              inputs.push(
                  <div key={index} className="checkboxes">
                    <input
                      key={index}
                      type="checkbox"
                      id={group.id}
                      name={group.name}
                      onChange={(e) => this.setGroups(e, index, group.name)}
                    />
                    <label>{group.name}</label>
                  </div>
              )
          }
      })
      if(inputs.length === 0 && this.props.adminGroups.length > 0) this.reloading();
      if(this.props.adminGroups.length === 0) inputs.push(<div><p>Aucun groupe.</p></div>)
      return inputs;
  }

//INVITE USER ON SUBMIT
  inviteUser = async(e, user, selected_groups) => {
    e.preventDefault();

    var accessToken = await window.msal.acquireTokenSilent({
      scopes: config.scopes
    });

    let id = user.id;
    if(user.id === '')
    {
      //Créer un user
      var new_user = await inviteUserfromMail(accessToken, user.email);
      id = await getIDfromUser(new_user);
      this.setState({user_invited:{id}});
    }

    selected_groups.map(
        async(bool, index) => {
          if(bool) await affectUsertoGroup(accessToken, this.props.adminGroups[index], id);
        }
    )

    alert("L'utilisateur " + user.email + " à été affecté au(x) groupe(s)" );
  }

render(){
    return(
      <section id="Invitation">
        <article>
          <form onSubmit={(e) => this.inviteUser(e,this.state.user_invited,this.props.selected_groups)} autoComplete="off">
            <div>
              <h1>Inviter un utilisateur</h1>
              <input type="text" name="email" id="email_azure" placeholder="Rechercher par mail" onChange={(e) => this.searchUser(e, e.target.value)}/>
              <div style={{overflowY: 'scroll'}}>
                <ul>
                {this.list_search()}
                </ul>
              </div>
            </div>
            <div>
              <MessageCheckbox groups={this.props.selected_groups} />
                {this.state.loading ? <ReactLoading type={"bars"} color={"#0188cc"} height={"1vw"} width={"2vw"} /> : this.checkboxes()}
            </div>
            <p style={{width: '100%'}}>Utilisateur sélectionné : {this.state.user_invited.email !== ''? this.state.user_invited.email : 'aucun'}</p>
            <button disabled={this.state.user_invited.email === "" || this.isNotAffected()}>Inscrire l'utilisateur</button>

          </form>
        </article>
      </section>
    )
  }
}
