import { User } from '@src/models/user';
import AuthService from '@src/services/auth';

describe('User functional test', () => {
   beforeEach(async () => {
      await User.deleteMany({});
   });

   describe('When creating a new user', () => {
      it('should successfully create a new user with excrypted password', async () => {
         const newUser = {
            name: 'Jhon Doe',
            email: 'jhon@email.com',
            password: '12345',
         };

         const response = await global.testRequest.post('/users').send(newUser);
         expect(response.status).toBe(201);

         await expect(
            AuthService.comparePassword(
               newUser.password,
               response.body.password
            )
         ).resolves.toBeTruthy();

         expect(response.body).toEqual(
            expect.objectContaining({
               ...newUser,
               ...{ password: expect.any(String) },
            })
         );
      });

      it('should return a validation error when a field is missing', async () => {
         const newUser = {
            email: 'jhon@email.com',
            password: '12345',
         };

         const response = await global.testRequest.post('/users').send(newUser);
         expect(response.status).toBe(400);
         expect(response.body).toEqual({
            code: 400,
            error: 'Bad Request',
            message: 'User validation failed: name: Path `name` is required.',
         });
      });

      it('Should return 409 when the email already exists', async () => {
         const newUser = {
            name: 'Jhon Doe',
            email: 'jhon@email.com',
            password: '12345',
         };

         await global.testRequest.post('/users').send(newUser);
         const response = await global.testRequest.post('/users').send(newUser);

         expect(response.status).toBe(409);
         expect(response.body).toEqual({
            code: 409,
            error: 'Conflict',
            message:
               'User validation failed: email: already exists in the database.',
         });
      });
   });

   describe('When authenticating a user', () => {
      it('should generate a token for a valid user', async () => {
         const newUser = {
            name: 'Jhon Doe',
            email: 'jhon@email.com',
            password: '12345',
         };

         await new User(newUser).save();
         const response = await global.testRequest
            .post('/users/authenticate')
            .send({ email: newUser.email, password: newUser.password });

         expect(response.body).toEqual(
            expect.objectContaining({ token: expect.any(String) })
         );
      });

      it('should return UNAUTHORIZED if the user with the given email is not found', async () => {
         const response = await global.testRequest
            .post('/users/authenticate')
            .send({ email: 'some_email@mail.com', password: '878943541578' });

         expect(response.status).toBe(401);
      });

      it('should return UNAUTHORIZED if the user is found but the password does not match', async () => {
         const newUser = {
            name: 'Jhon Doe',
            email: 'jhon@email.com',
            password: '12345',
         };

         await new User(newUser).save();
         const response = await global.testRequest
            .post('/users/authenticate')
            .send({ email: newUser.email, password: 'diferent password' });

         expect(response.status).toBe(401);
      });
   });

   describe('When getting user profile info', () => {
      it(`Should return the token's owner profile information`, async () => {
         const newUser = {
            name: 'John Doe',
            email: 'john@mail.com',
            password: '1234',
         };

         const user = await new User(newUser).save();
         const token = AuthService.generatorToken(user.toJSON());
         const { body, status } = await global.testRequest
            .get('/users/me')
            .set({ 'x-access-token': token });

         expect(status).toBe(200);
         expect(body).toMatchObject(JSON.parse(JSON.stringify({ user })));
      });

      it(`Should return Not Found, when the user is not found`, async () => {
         const newUser = {
            name: 'John Doe',
            email: 'john@mail.com',
            password: '1234',
         };

         //create a new user but don't save it
         const user = new User(newUser);
         const token = AuthService.generatorToken(user.toJSON());
         const { body, status } = await global.testRequest
            .get('/users/me')
            .set({ 'x-access-token': token });

         expect(status).toBe(404);
         expect(body.message).toBe('User not found!');
      });
   });
});
