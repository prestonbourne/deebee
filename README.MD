# DEEBEE

## What is this ? 
Deebee is a lightweight, local JSON database for small applications. It's written in node and supports simple ORM/SQL like syntax. Deebee is not intended for use in production applications.

However, Deebee shines in the following use cases:
- Teaching new backend developers the basics of persistent storage and how Databases work under the hood.
- Testing your response handlers with a mock client application like [Postman](https://www.postman.com/) or [REST Client](https://marketplace.visualstudio.com/items?itemName=humao.rest-client)

## Usage

Deebee is written in Typescript and currently only works in Node environment. To get started run 

### Getting started

```zsh
npm i @prestonbourne/deebee
```

You can then import the main `Deebee` class and get started

```ts
import { DeeBee, Model } from "@prestonbourne/deebee";

const db = new DeeBee()
```

However, all this does get `DeeBee` up and running in your filesystem. To begin adding storing data, you need to:

1. Define a model/schema, think of this as a contract between you and the database, it tells the database, every time I pass in one of these, it will have the following properties.

2. Insert your first row, this will be the first set of data written to your computers hard disk, should be an object that matches the schema you previously defined. DB will ensure the data matches the schema and store it in JSON

3. At this point, you should be able to see a folder called `/deebee` with your data and schemas inside of it.