import { Global, Module } from '@nestjs/common';
import FirebaseApp from './firebase-app'

@Global()
@Module({
    providers: [FirebaseApp],
    exports: [FirebaseApp]
})
export class FirebaseModule { }
