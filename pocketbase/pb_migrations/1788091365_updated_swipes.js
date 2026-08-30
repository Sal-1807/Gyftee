/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("02u9goxfqkjf5fv")

  // update collection data
  unmarshal({
    "listRule": "user = @request.auth.id || (@collection.followers:f.follower ?= @request.auth.id && @collection.followers:f.following ?= user)",
    "viewRule": "user = @request.auth.id || (@collection.followers:f.follower ?= @request.auth.id && @collection.followers:f.following ?= user)"
  }, collection)

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("02u9goxfqkjf5fv")

  // update collection data
  unmarshal({
    "listRule": "@request.auth.id != \"\"",
    "viewRule": "@request.auth.id != \"\""
  }, collection)

  return app.save(collection)
})
