const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp();

exports.sendReceipt = functions.firestore.document('purchases/{purchaseId}')
.onCreate((snap, context) => {
    const purchase = snap.data();
    const userEmail = purchase.userEmail; // Asume que el correo del usuario está en el registro de la compra

    // Contenido del correo
    const mailOptions = {
    to: userEmail,
    from: 'noreply@tuapp.com',
    subject: 'Comprobante de Compra',
    text: `Gracias por tu compra. Has gastado ${purchase.amount}$. Saldo restante: ${purchase.remainingBalance}$.`,
    };

    return admin.firestore().collection('mail').add(mailOptions)
    .then(() => console.log('Correo enviado'))
    .catch(error => console.error('Error al enviar correo:', error));
});
