import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { AngularFireAuth } from '@angular/fire/compat/auth';

@Injectable({
providedIn: 'root'
})
export class VirtualCardService {

constructor(private firestore: AngularFirestore, private afAuth: AngularFireAuth) {}

  // Método para crear una tarjeta virtual con un saldo inicial de 45.000$
async createVirtualCard(): Promise<void> {
    const user = await this.afAuth.currentUser;
    if (user) {
    const cardNumber = this.generateCardNumber();  // Método para generar un número de tarjeta ficticio
    const initialBalance = 45000;  // Saldo inicial
    const cardData = {
        userId: user.uid,
        cardNumber,
        balance: initialBalance,
        createdAt: new Date(),
    };

      // Guardar la tarjeta en Firestore
    await this.firestore.collection('virtualCards').doc(user.uid).set(cardData);
    console.log('Tarjeta virtual creada con éxito');
    } else {
    console.error('Usuario no autenticado');
    }
}

  // Método para generar un número ficticio de tarjeta
private generateCardNumber(): string {
    return Math.floor(Math.random() * 10000000000000000).toString().padStart(16, '0');
}
}
