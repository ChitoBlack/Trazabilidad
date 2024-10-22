import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { finalize } from 'rxjs/operators';
import firebase from 'firebase/compat/app';
import { VirtualCardService } from '../services/virtual-card.service'; // Importar el servicio


@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
})
export class RegisterPage {
  registerForm: FormGroup;
  selectedImage: string | null = null; 
  imageFile: File | null = null;

  constructor(
    private formBuilder: FormBuilder,
    private afAuth: AngularFireAuth,
    private router: Router,
    private storage: AngularFireStorage,
    private firestore: AngularFirestore,
    private virtualCardService: VirtualCardService
  ) {
    // Formulario de registro
    this.registerForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email, Validators.pattern(/^[a-zA-Z0-9._%+-]+@gmail\.com$/)]],
      password: ['', [Validators.required, Validators.minLength(8)]]
    });
  }

  // Método para seleccionar una imagen
  selectImage(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.imageFile = file;
      const reader = new FileReader();
      reader.onload = () => {
        this.selectedImage = reader.result as string; // Base64 de la imagen
      };
      reader.readAsDataURL(file);
    }
  }

  // Registro del usuario
  async register() {
    if (this.registerForm.valid && this.imageFile) {
      try {
        const { email, password } = this.registerForm.value;
        const userCredential = await this.afAuth.createUserWithEmailAndPassword(email, password);
        await this.virtualCardService.createVirtualCard();

        // Subir imagen a Firebase Storage
        const filePath = `users/${userCredential.user?.uid}/profile_image`;
        const fileRef = this.storage.ref(filePath);
        const uploadTask = this.storage.upload(filePath, this.imageFile);


        // Obtener la URL de descarga de la imagen subida y guardar los datos en Firestore
        uploadTask.snapshotChanges().pipe(
          finalize(async () => {
            const downloadURL = await fileRef.getDownloadURL().toPromise();
            await this.saveUserData(userCredential.user?.uid!, email, downloadURL); // Guardar datos del usuario
            this.router.navigateByUrl('/inicio');
          })
        ).subscribe();
      } catch (error) {
        console.error('Error en el registro:', error);
      }
    }
  }
  // Método de inicio de sesión con Google
  async loginWithGoogle() {
    try {
      const result = await this.afAuth.signInWithPopup(new firebase.auth.GoogleAuthProvider());
      const user = result.user;
      if (user) {
        await this.saveUserData(user.uid, user.email!, user.photoURL!); // Guardar los datos del usuario
        this.router.navigateByUrl('/inicio'); // Redirige al usuario
      }
    } catch (error) {
      console.error('Error durante el inicio de sesión con Google:', error);
    }
  }


  // Guardar los datos del usuario en Firestore
  private async saveUserData(uid: string, email: string, imageUrl: string) {
    try {
      await this.firestore.collection('users').doc(uid).set({
        email,
        profileImageUrl: imageUrl,
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        uid
      });
    } catch (error) {
      console.error('Error al guardar los datos en Firestore:', error);
    }
  }
  

  // Obtener mensajes de error del email
  getEmailError(): string {
    const emailControl = this.registerForm.get('email');
    if (emailControl?.hasError('required')) return 'El correo es obligatorio.';
    if (emailControl?.hasError('email')) return 'El formato del correo es inválido.';
    if (emailControl?.hasError('pattern')) return 'El correo debe terminar en @gmail.com.';
    return '';
  }

  // Obtener mensajes de error de la contraseña
  getPasswordError(): string {
    const passwordControl = this.registerForm.get('password');
    if (passwordControl?.hasError('required')) return 'La contraseña es obligatoria.';
    if (passwordControl?.hasError('minlength')) return 'La contraseña debe tener al menos 8 caracteres.';
    return '';
  }
}
