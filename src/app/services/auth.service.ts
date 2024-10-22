import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { finalize } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  constructor(
    private afAuth: AngularFireAuth,
    private firestore: AngularFirestore,
    private storage: AngularFireStorage
  ) {}
  
  async register(email: string, password: string, imageFile: File) {
    const userCredential = await this.afAuth.createUserWithEmailAndPassword(email, password);
    const filePath = `users/${userCredential.user?.uid}/profile_image`;
    const fileRef = this.storage.ref(filePath);
  
    await this.storage.upload(filePath, imageFile).then(() => {
      fileRef.getDownloadURL().subscribe(async (url) => {
        await this.firestore.collection('users').doc(userCredential.user?.uid).set({
          email,
          profileImageUrl: url,
        });
        localStorage.setItem('userProfileImageUrl', url);
      });
    });
  }
  
  async login(email: string, password: string): Promise<void> {
    const userCredential = await this.afAuth.signInWithEmailAndPassword(email, password);
    const userDoc = await this.firestore.collection('users').doc(userCredential.user?.uid).get().toPromise();
    
    if (userDoc?.exists) {
      const userData = userDoc.data() as { email: string, profileImageUrl?: string };
      localStorage.setItem('userProfileImageUrl', userData.profileImageUrl || '');
      localStorage.setItem('userEmail', userData.email);
    } else {
      console.error('No se encontró información del usuario en Firestore');
    }
  }


  // Cerrar sesión
  logout() {
    localStorage.clear(); // Limpiar el localStorage
    return this.afAuth.signOut();
  }

  // Obtener el usuario actual
  getCurrentUser() {
    return this.afAuth.authState;
  }
}

