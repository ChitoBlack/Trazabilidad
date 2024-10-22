import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';

import { IonicModule, IonicRouteStrategy } from '@ionic/angular';
import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';

// Importaciones de Firebase y AngularFire
import { AngularFireModule } from '@angular/fire/compat'; // Nota: usamos compat para compatibilidad
import { AngularFireAuthModule } from '@angular/fire/compat/auth'; // Módulo de autenticación
import { AngularFirestoreModule } from '@angular/fire/compat/firestore'; // Firestore
import { AngularFireStorageModule } from '@angular/fire/compat/storage'; // Storage para subir imágenes
import { ReactiveFormsModule } from '@angular/forms'; // Formularios reactivos
import { firebaseConfig } from '../environments/environment'; // Configuración de Firebase
import { AuthService } from './services/auth.service'; // Servicio de autenticación

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    IonicModule.forRoot(),
    AppRoutingModule,
    ReactiveFormsModule, // Importación de formularios reactivos
    AngularFireModule.initializeApp(firebaseConfig), // Inicialización de Firebase
    AngularFireAuthModule, // Módulo de autenticación de Firebase
    AngularFirestoreModule, // Módulo de Firestore
    AngularFireStorageModule // Módulo de Storage de Firebase
  ],
  providers: [
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    AuthService // Agrega AuthService como proveedor
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}
