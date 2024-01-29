import { CognitoUserPool } from 'amazon-cognito-identity-js';

const poolData = {
    UserPoolId: 'us-east-2_JsONbQ14O',
    ClientId: '5i7dgop7gi35ma5i6vg2evh7ka',
};

const userPool = new CognitoUserPool(poolData);

export default userPool;
