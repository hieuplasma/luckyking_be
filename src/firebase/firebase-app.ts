import { Injectable } from "@nestjs/common";
import { User } from "@prisma/client";
import * as firebase from "firebase-admin";
import { Role } from "src/common/enum";
import { PrismaService } from "src/prisma/prisma.service";
import firebaseConfig from "./firebase-config";

const DEFAULT_TITLE = "Thông báo"
const DEFAULT_MESSAGE = "Bạn có thông báo mới từ LuckyKing"
@Injectable()
export default class FirebaseApp {
    private firebaseApp: firebase.app.App;

    constructor(
        private prismaService: PrismaService,
    ) {
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

    sendNotification = async (message: string) => {

        const staffUser = await this.prismaService.user.findMany({
            where: {
                role: Role.Staff,
            },
            include: {
                Device: true,
            }
        });

        for (const user of staffUser) {
            for (const device of user.Device) {
                if (device.deviceToken) {
                    const messageInfo = {
                        notification: {
                            title: "Thông báo",
                            body: message
                        },
                        token: device.deviceToken
                    };

                    firebase.messaging().send(messageInfo)
                        .then((response) => {
                            console.log("Thành công:", response);
                        })
                        .catch((error) => {
                            // console.log("Lỗi:", error);
                        });
                }
            }
        }
    }

    senNotificationToUser = async (userId: string, title: string = DEFAULT_TITLE, message: string = DEFAULT_MESSAGE,) => {
        const user = await this.prismaService.user.findUnique({
            where: { id: userId },
            include: { Device: true }
        })
        for (const device of user.Device) {
            if (device.deviceToken) {
                const messageInfo = {
                    notification: {
                        title: title,
                        body: message
                    },
                    token: device.deviceToken
                };

                await firebase.messaging().send(messageInfo)
                    .then((response) => {
                        console.log("Firebase bắn Notification thành công:", userId);
                    })
                    .catch((error) => {
                        // console.log("Lỗi:", error);
                    });
            }
        }
    }

    getTokenFromPhoneNumber = async (phoneNumber: string) => {
        let tmp = phoneNumber.trim()
        if (tmp.charAt(0) == '0') tmp = tmp.replace('0', '+84')
        const user = await this.firebaseApp.auth().getUserByPhoneNumber(tmp)
        const uid = user.uid
        const customToken = await this.firebaseApp.auth().createCustomToken(uid)
        console.log(customToken)
        return customToken
    }
}