import config from './luckyking-development-firebase-adminsdk-gv6zn-f6f235abf7.json'

const firebaseConfig = {
    clientEmail: config.client_email,
    projectId: config.project_id,
    privateKey: config.private_key,
    databaseUrl: "https://luckyking-development-default-rtdb.asia-southeast1.firebasedatabase.app/",
}

export default firebaseConfig;