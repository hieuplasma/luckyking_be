import { Injectable } from "@nestjs/common";
import { User } from "@prisma/client";
import * as firebase from "firebase-admin";
import { Role } from "src/common/enum";
import { PrismaService } from "src/prisma/prisma.service";
import firebaseConfig from "./firebase-config";

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

        const staffUser = await this.prismaService.user.findFirst({
            where: {
                role: Role.Staff,
            },
            include: {
                Device: true,
            }
        });

        for (const device of staffUser.Device) {
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