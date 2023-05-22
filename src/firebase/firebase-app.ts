import { Injectable } from "@nestjs/common";
import { User } from "@prisma/client";
import * as firebase from "firebase-admin";
import firebaseConfig from "./firebase-config";

@Injectable()
export default class FirebaseApp {
    private firebaseApp: firebase.app.App;

    constructor() {
        this.firebaseApp = firebase.initializeApp({
            credential: firebase.credential.cert({ ...firebaseConfig }),
            databaseURL: firebaseConfig.databaseUrl
        });
    }

    getAuth = (): firebase.auth.Auth => {
        return this.firebaseApp.auth();
    }

    firestore = (): firebase.firestore.Firestore => {
        return this.firebaseApp.firestore();
    }

    sendNotification = (message: string) => {
        const messageInfo = {
            notification: {
                title: "Thông báo",
                body: message
            },
            token: "ctAaHl6EQDqc3vWIIyt03_:APA91bEZ1TgLztnp1y5HF5YdkvDwN--NMXoS2L5nlr-IA797EjSCGH49iv_Ig_cr37uzCOAm8IcSTMZxnLtgbk8qfZHeos_TfFNQBOJUqZQi75c1mCOzLSW5G-jaKa_j_bwug_kPm2U1"
        };

        firebase.messaging().send(messageInfo)
            .then((response) => {
                console.log("Thành công:", response);
            })
            .catch((error) => {
                console.log("Lỗi:", error);
            });
    }
}