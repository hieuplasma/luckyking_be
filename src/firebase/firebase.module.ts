import { Module } from '@nestjs/common';
import FirebaseApp from './firebase-app'

@Module({
    providers: [FirebaseApp],
    exports: [FirebaseApp]
})
export class FirebaseModule { }
