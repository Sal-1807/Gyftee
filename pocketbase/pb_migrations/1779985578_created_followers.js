/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const collection = new Collection({
    "id": "ni61kz38wocnn77",
    "created": "2026-05-28 16:26:18.684Z",
    "updated": "2026-05-28 16:26:18.684Z",
    "name": "followers",
    "type": "base",
    "system": false,
    "schema": [
      {
        "system": false,
        "id": "9jf8zxwu",
        "name": "follower",
        "type": "relation",
        "required": true,
        "presentable": false,
        "unique": false,
        "options": {
          "collectionId": "_pb_users_auth_",
          "cascadeDelete": false,
          "minSelect": null,
          "maxSelect": 1,
          "displayFields": null
        }
      },
      {
        "system": false,
        "id": "4jf53vsh",
        "name": "following",
        "type": "relation",
        "required": true,
        "presentable": false,
        "unique": false,
        "options": {
          "collectionId": "_pb_users_auth_",
          "cascadeDelete": false,
          "minSelect": null,
          "maxSelect": 1,
          "displayFields": null
        }
      }
    ],
    "indexes": [
      "CREATE UNIQUE INDEX `idx_hS4kqBf` ON `followers` (\n  `follower`,\n  `following`\n)"
    ],
    "listRule": null,
    "viewRule": null,
    "createRule": "@request.auth.id = follower",
    "updateRule": null,
    "deleteRule": "@request.auth.id = follower\n",
    "options": {}
  });

  return Dao(db).saveCollection(collection);
}, (db) => {
  const dao = new Dao(db);
  const collection = dao.findCollectionByNameOrId("ni61kz38wocnn77");

  return dao.deleteCollection(collection);
})
