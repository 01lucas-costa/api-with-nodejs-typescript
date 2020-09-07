import { SetupServer } from '@src/server'
import supertest from 'supertest'

let server = new SetupServer()

beforeAll(async () => {
   server = new SetupServer()
   await server.init()
   global.testRequest = supertest(server.getApp())
})

afterAll( async () => await server.close() )
