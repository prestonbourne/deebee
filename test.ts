import { DeeBee, Model } from "./main";

const userModel = new Model('users', {
 id: 'number',
 username: 'string',
 email: 'string'
})

const todoModel = new Model('todos', {
 id: 'number',
 isComplete: 'boolean',
})

const db = new DeeBee()

