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
          id : "3cd6db62-d053-46c8-b824-b65506e14813"
        },
        {
          name : "Communes.gpseo",
          id : "3db2b423-69a7-4744-b048-db02a7708b8a"
        }
    ],
    admin : [
      {
        name : "habitat.admin.ag",
        id : "d52f7d12-8ec3-4bca-9c89-6ad009c1828d"
      },
      {
        name : "communes.admin.ag",
        id : "676c053a-3dcc-4931-9dff-e846b805f866"
      }
    ]
};
