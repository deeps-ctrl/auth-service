import request from 'supertest';
import app from '../../src/app';

describe('POST /auth/register', () => {
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
    });

    describe('', () => {});
});
