import React, { createContext, useState } from 'react';
import { CognitoUser, AuthenticationDetails } from 'amazon-cognito-identity-js';
import Pool from '../../../userpool';
import PropTypes from 'prop-types';

const AuthContext = createContext();

const Auth = (props) => {
    const loggedIn = Pool.getCurrentUser() !== null;
    const userData = {
        userId: '',
        email: '',
        username: '',
        name: ''
    };
   
    const [isLoggedIn, setLoggedIn] = useState(loggedIn);
    const [userInfo, setUserInfo] = useState(userData); 

    const getSession = async () => {
        return await new Promise((resolve, reject) => {
            const user = Pool.getCurrentUser();
            if(user){
                user.getSession((err, session) => {
                    if(err){
                        reject(err);
                    } else {
                        resolve(session);
                        console.log(session);
                        const info = {
                            userId: session.idToken.payload.sub,
                            email: session.idToken.payload.email,
                            username: session.idToken.payload['cognito:username'],
                            name: session.idToken.payload.name,
                        };
                        console.log(info);
                        setUserInfo(info);
                     
                    }
                });
            } else {
                reject('User not logged in');
            }
        });
    };

    const login = async (Username, Password) => {
        return await new Promise((resolve, reject) => {
            const user = new CognitoUser(
                { Username, Pool }
            );
    
            const authDetails = new AuthenticationDetails({
                Username,
                Password
            });
    
            user.authenticateUser(authDetails, {
                onSuccess: (data) => {
                    console.log('success', data);
                    setLoggedIn(true);
                    resolve(data);
                    
                },
                onFailure: (err) => {
                    reject(err);
                },
            });
            
        });
    };
    
    const signUp = async (Username, Password, Name, Email) => {
        return await new Promise((resolve, reject) => {
            Pool.signUp(
                Username,
                Password,
                [
                    { Name: 'email', Value: Email },
                    { Name: 'name', Value: Name },
                ],
                null,
                async (err, data) => {
                    if (err) {
                        console.error(err);
                        reject(err);
                    } else {
                        setLoggedIn(true);
                        await login(Email, Password);
                        resolve(data);
                    }
                    
                    
                }
            );
            
        });
        
    };

    const logout = () => {
        const user = Pool.getCurrentUser();
        if(user){
            user.signOut();
            setLoggedIn(false);
        }
    };
    
    return (
        <AuthContext.Provider value={{ login, signUp, logout, getSession, isLoggedIn, userInfo }}>
            {props.children}
        </AuthContext.Provider>
    );
};

Auth.propTypes = {
    children: PropTypes.element
};

export { Auth, AuthContext };
