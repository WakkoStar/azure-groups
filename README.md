#Azure-Groups

L'interface est codé en Javascript avec le framework React et le backend utilisé est Microsoft Graph pour les requêtes réseaux.

## Documentation de l'application relative aux plateformes

####Fichiers importants
- App.js : Fichier racine
- Navbar.js : Fichier pour la navigation
- Config.js : Configuration de l'application et de l'annuaire Azure AD
- Groups.js : Fichier pour controler les groupes
- GraphService.js : Méthodes pour les requetes réseaux

####Page importantes :
- Form.js : Page "Inviter"
- List.js : Page "Groupe"
- Welcome.js : Page "Connexion"

## Comment ajouter un groupe

Dans le fichier `Groups.js` tout les groupes sont listés en 2 parties :
`admin` contient des personnes pouvant éditer les groupes `invite` qui contient les personnes pouvant accéder aux plateformes.

Une plateforme possède donc deux groupes un `admin` et un `invite`. Ces deux groupes doivent possèder le même index pour leur fonctionnement.

####Fichier `Groups.js`
```json
{
    "invite" : [
        {
          "name" : "Habitat.gpseo",
          "id" : "ee109a66-f87d-4933-8cc1-562047148e39"
        },
        {
          "name" : "Communes.gpseo",
          "id" : "325b8174-e8ad-45dd-94c1-94ee8da896f1"
        }
    ],
    "admin" : [
      {
        "name" : "habitat.admin.ag",
        "id" : "fad2da0c-cc32-4f77-afe1-d23ea2be329a"
      },
      {
        "name" : "communes.admin.ag",
        "id" : "110c5ab2-d2c6-48f5-8c41-d1bac5b59562"
      }
    ]
}
```
