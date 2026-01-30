import request from 'supertest';
import app from '../../src/app';
import { DataSource } from 'typeorm';
import { AppDataSource } from '../../src/config/data-source';
import { truncateTables } from '../utils';
import { User } from '../../src/entity/User';
import { Roles } from '../../src/constants';

describe('POST /auth/register', () => {
    let connection: DataSource;

    beforeAll(async () => {
        connection = await AppDataSource.initialize();
    });

    //Before each test we need to clean the database
    beforeEach(async () => {
        // Database truncate
        await connection.dropDatabase();
        await connection.synchronize();
        await truncateTables(connection);
    });

    afterAll(async () => {
        await connection.destroy();
    });

    describe('Given all fields', () => {
        it('should return 201 status code', async () => {
            //AAA -> Method for writing good test cases
            //Arrange
            const userData = {
                firstName: 'Deepanshu',
                lastName: 'Kumar',
                email: 'deepanshu.kumar@gmail.com',
                password: 'secret',
            };
            //Act
            const response = await request(app)
                .post('/auth/register')
                .send(userData);
            //Assert
            expect(response.statusCode).toBe(201);
        });

        it('should return valid json', async () => {
            //AAA -> Method for writing good test cases
            //Arrange
            const userData = {
                firstName: 'Deepanshu',
                lastName: 'Kumar',
                email: 'deepanshu.kumar@gmail.com',
                password: 'secret',
            };
            //Act
            const response = await request(app)
                .post('/auth/register')
                .send(userData);
            //Assert
            expect(
                (response.headers as Record<string, string>)['content-type'],
            ).toEqual(expect.stringContaining('json'));
        });

        it('should persist user in the database', async () => {
            //Arrange
            const userData = {
                firstName: 'Deepanshu',
                lastName: 'Kumar',
                email: 'deepanshu.kumar@gmail.com',
                password: 'secret',
            };
            //Act
            await request(app).post('/auth/register').send(userData);
            //Assert
            const userRepository = connection.getRepository(User);
            const users = await userRepository.find();
            expect(users).toHaveLength(1);
            expect(users[0].firstName).toBe(userData.firstName);
            expect(users[0].lastName).toBe(userData.lastName);
            expect(users[0].email).toBe(userData.email);
        });

        it('should return id of the created user', async () => {
            //Arrange
            const userData = {
                firstName: 'Deepanshu',
                lastName: 'Kumar',
                email: 'deepanshu.kumar@gmail.com',
                password: 'secret',
            };
            //Act
            const response = await request(app)
                .post('/auth/register')
                .send(userData);
            //Assert
            expect(response.body).toHaveProperty('id');
        });

        it('should assign customer role', async () => {
            //Arrange
            const userData = {
                firstName: 'Deepanshu',
                lastName: 'Kumar',
                email: 'deepanshu.kumar@gmail.com',
                password: 'secret',
            };
            //Act
            await request(app).post('/auth/register').send(userData);
            //Assert
            const userRepository = connection.getRepository(User);
            const users = await userRepository.find();
            expect(users[0]).toHaveProperty('role');
            expect(users[0].role).toBe(Roles.CUSTOMER);
        });

        it('should store the hashed password in the database', async () => {
            //Arrange
            const userData = {
                firstName: 'Deepanshu',
                lastName: 'Kumar',
                email: 'deepanshu.kumar@gmail.com',
                password: 'secret',
            };
            //Act
            await request(app).post('/auth/register').send(userData);
            //Assert
            const userRepository = connection.getRepository(User);
            const users = await userRepository.find();
            expect(users[0].password).not.toBe(userData.password);
            expect(users[0].password).toHaveLength(60); // hashed password lenght is always 60 characters long
            expect(users[0].password).toMatch(/^\$2b\$\d+/); // Match it that exact this format hash is being generated or not
        });

        it('should return 400 status code if email is already exist', async () => {
            //Arrange
            const userData = {
                firstName: 'Deepanshu',
                lastName: 'Kumar',
                email: 'deepanshu.kumar@gmail.com',
                password: 'secret',
            };
            const userRepository = connection.getRepository(User);
            await userRepository.save({ ...userData, role: Roles.CUSTOMER });
            //Act
            const response = await request(app)
                .post('/auth/register')
                .send(userData);
            //Assert
            expect(response.statusCode).toBe(400);
        });
    });

    describe('Fields are missing', () => {
        it('should return 400 status code if email feild is missing', async () => {
            //Arrange
            const userData = {
                firstName: 'Deepanshu',
                lastName: 'Kumar',
                email: '',
                password: 'secret',
            };
            //Act
            const response = await request(app)
                .post('/auth/register')
                .send(userData);
            //Assert
            expect(response.statusCode).toBe(400);
            const userRepository = connection.getRepository(User);
            const users = await userRepository.find();
            expect(users).toHaveLength(0);
        });

        it('should return 400 status code if firstName is missing', async () => {
            //Arrange
            const userData = {
                firstName: '',
                lastName: 'Kumar',
                email: 'deepanshu.kumar@gmail.com',
                password: 'secret',
            };
            //Act
            const response = await request(app)
                .post('/auth/register')
                .send(userData);
            //Assert
            expect(response.statusCode).toBe(400);
            const userRepository = connection.getRepository(User);
            const users = await userRepository.find();
            expect(users).toHaveLength(0);
        });

        it('should return 400 status code if lastName is missing', async () => {
            //Arange
            const userData = {
                firstName: 'Deepanshu',
                lastName: '',
                email: 'deepanshu.kumar@fareportal.com',
                password: 'secret',
            };
            //Act
            const response = await request(app)
                .post('/auth/register')
                .send(userData);
            //Assert
            expect(response.statusCode).toBe(400);
            const userRepository = connection.getRepository(User);
            const users = await userRepository.find();
            expect(users).toHaveLength(0);
        });

        it('should return 400 status code if password is missing', async () => {
            //Arange
            const userData = {
                firstName: 'Deepanshu',
                lastName: 'Kumar',
                email: 'deepanshu.kumar@fareportal.com',
                password: '',
            };
            //Act
            const response = await request(app)
                .post('/auth/register')
                .send(userData);
            //Assert
            expect(response.statusCode).toBe(400);
            const userRepository = connection.getRepository(User);
            const users = await userRepository.find();
            expect(users).toHaveLength(0);
        });
    });

    describe('Fields are not in proper format', () => {
        it('should trim the email fields', async () => {
            //Arange
            const userData = {
                firstName: 'Deepanshu',
                lastName: 'Kumar',
                email: ' deepanshu.kumar@gmail.com ',
                password: 'secret',
            };
            //Act
            await request(app).post('/auth/register').send(userData);
            //Assert
            const userRepository = connection.getRepository(User);
            const users = await userRepository.find();
            const user = users[0];
            expect(user.email).toBe(userData.email.trim());
        });

        it('should return 400 status code if email is not a valid email', async () => {
            //Arange
            const userData = {
                firstName: 'Deepanshu',
                lastName: 'Kumar',
                email: 'deepanshu.k',
                password: 'secret',
            };
            //Act
            const response = await request(app)
                .post('/auth/register')
                .send(userData);
            //Assert
            expect(response.statusCode).toBe(400);
            const userRepository = connection.getRepository(User);
            const users = await userRepository.find();
            expect(users).toHaveLength(0);
        });

        it('should return 400 status code if password is less than 6 chars', async () => {
            //Arange
            const userData = {
                firstName: 'Deepanshu',
                lastName: 'Kumar',
                email: 'deepanshu.kumar@gmail.com',
                password: 'secre',
            };
            //Act
            const response = await request(app)
                .post('/auth/register')
                .send(userData);
            //Assert
            expect(response.statusCode).toBe(400);
            const userRepository = connection.getRepository(User);
            const users = await userRepository.find();
            expect(users).toHaveLength(0);
        });

        it('should return an array of error message if email is missing', async () => {
            //Arange
            const userData = {
                firstName: 'Deepanshu',
                lastName: 'Kumar',
                email: '',
                password: 'secret',
            };
            //Act
            const response = await request(app)
                .post('/auth/register')
                .send(userData);
            //Assert
            expect(response.statusCode).toBe(400);
            expect(response.body).toHaveProperty('errors');
            expect(
                (response.body as Record<string, string>).errors.length,
            ).toBeGreaterThan(0);
            const userRepository = connection.getRepository(User);
            const users = await userRepository.find();
            expect(users).toHaveLength(0);
        });
    });
});
