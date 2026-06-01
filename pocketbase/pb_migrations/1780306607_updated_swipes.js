/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("02u9goxfqkjf5fv")

  collection.listRule = "@request.auth.id != \"\""
  collection.viewRule = "@request.auth.id != \"\""
  collection.createRule = "user = @request.auth.id"

  return dao.saveCollection(collection)
}, (db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("02u9goxfqkjf5fv")

  collection.listRule = "user = @request.auth.id"
  collection.viewRule = "user = @request.auth.id"
  collection.createRule = "@request.auth.id != \"\""

  return dao.saveCollection(collection)
})
