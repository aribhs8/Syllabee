import React, { useState, useContext } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { AuthContext } from './Auth';
import { useNavigate } from 'react-router-dom';

const SignUp = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const username = uuidv4();
    const { signUp, getSession } = useContext(AuthContext);
    const navigate = useNavigate();

    const onSubmit = async (event) => {
        event.preventDefault();

        try {
            await signUp(username, password, name, email);
            await getSession();
            navigate('/', { replace: true });
          
        } catch (error) {
            console.log(error);
        }
    };
    return (
        <div>
            <form>
                <label>Name</label>
                <input
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                />
                <label>Email</label>
                <input
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                />
                <label>Password</label>
                <input
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                />
                <button onClick={onSubmit}>Submit</button>
            </form>
        </div>
    );
};

export default SignUp;
