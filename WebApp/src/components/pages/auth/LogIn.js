import React, { useState, useContext } from 'react';
import { AuthContext } from './Auth';
import { useNavigate } from 'react-router-dom';

const LogIn = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { login, getSession } = useContext(AuthContext);
    const navigate = useNavigate();
    const onSubmit = async (event) => {
        event.preventDefault();

        try {
            await login(email, password);
            await getSession();
            navigate('/', { replace: true });

        } catch (error) {
            console.log(error);
        }


    };
    return (
        <div style={styles.container}>
            <h1 style={styles.signInText}>SIGN IN</h1>
            <div style={styles.inputContainer}>
                <input type="email" placeholder="Email" style={styles.input} onChange={(event) => setEmail(event.target.value)}/>
            </div>
            <div style={styles.inputContainer}>
                <input type="password" placeholder="Password" style={styles.input}  onChange={(event) => setPassword(event.target.value)} />
            </div>
            <button style={styles.loginButton} onClick={onSubmit}>Login</button>
            <p style={styles.signUpText}>
                <span style={styles.signUpLink}>Dont have an account? Sign up</span>.
            </p>
        </div>
    );
};

export default LogIn;


const styles = {
    container: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        margin: 'auto',
    },
    signInText: {
        marginBottom: '20px',
    },
    inputContainer: {
        marginBottom: '15px',
    },
    input: {
        width: '300px',
        padding: '10px',
        fontSize: '16px',
    },
    loginButton: {
        backgroundColor: 'blue',
        color: 'white',
        padding: '10px 20px',
        fontSize: '16px',
        cursor: 'pointer',
        border: 'none',
        width: '300px',
    },
    signUpText: {
        marginTop: '20px',
        fontSize: '14px',
    },
    signUpLink: {
        color: 'blue',
        textDecoration: 'underline',
        cursor: 'pointer',
    },
};

//export default LogIn;
