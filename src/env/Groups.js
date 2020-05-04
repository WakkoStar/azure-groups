module.exports = {
    invite : [
      /*
      L'index du groupe de invite doit avoir le meme index du groupe admin
      (Exemple : habitat : invite(0) et admin(0), communes : invite(1) et admin(1))
        {
          name : le nom du groupe que l'on veut,
          id: l'id du groupe Azure AD
        },
      */
        {
          name : "Habitat.gpseo",
          id : "ee109a66-f87d-4933-8cc1-562047148e39"
        },
        {
          name : "Communes.gpseo",
          id : "325b8174-e8ad-45dd-94c1-94ee8da896f1"
        }
    ],
    admin : [
      {
        name : "habitat.admin.ag",
        id : "fad2da0c-cc32-4f77-afe1-d23ea2be329a"
      },
      {
        name : "communes.admin.ag",
        id : "110c5ab2-d2c6-48f5-8c41-d1bac5b59562"
      }
    ]
};
