import { User } from "@src/models/user"

describe('User functional test', () => {
   beforeEach( async() => {
      await User.deleteMany({})
   })

   describe('When creating a new user', () => {
      it('should successfully create a new user', async () => {
         const newUser = {
            name: 'Jhon Doe',
            email: 'jhon@email.com',
            password: '12345'
         }

         const response = await global.testRequest.post('/users').send(newUser)
         expect(response.status).toBe(201)
         expect(response.body).toEqual(expect.objectContaining(newUser))
      })

      it('should return 422 when there is a validation error', async () => {
         const newUser = {
            email: 'jhon@email.com',
            password: '12345'
         }

         const response = await global.testRequest.post('/users').send(newUser)
         expect(response.status).toBe(422)
         expect(response.body).toEqual({
            code: 422,
            error: 'User validation failed: name: Path `name` is required.'
         })
      })

      it('Should return 409 when the email already exists', async () => {
         const newUser = {
            name: 'Jhon Doe',
            email: 'jhon@email.com',
            password: '12345'
         }

         await global.testRequest.post('/users').send(newUser)
         const response = await global.testRequest.post('/users').send(newUser)

         expect(response.status).toBe(409)
         expect(response.body).toEqual({
            code: 409,
            error: 'User validation failed: email: already exists in the database.'
         })
      })
   })
})