/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("ni61kz38wocnn77")

  collection.listRule = "@request.auth.id != \"\""
  collection.viewRule = "@request.auth.id != \"\""
  collection.createRule = "@request.auth.id != \"\""
  collection.deleteRule = "follower = @request.auth.id\n"

  return dao.saveCollection(collection)
}, (db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("ni61kz38wocnn77")

  collection.listRule = null
  collection.viewRule = null
  collection.createRule = "@request.auth.id = follower"
  collection.deleteRule = "@request.auth.id = follower\n"

  return dao.saveCollection(collection)
})
