import { Component, OnInit } from '@angular/core';
import { AlertController, NavController } from '@ionic/angular';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Geolocation, Position } from '@capacitor/geolocation'; // Importa el plugin de Geolocation
import { VirtualCardService } from '../services/virtual-card.service'; // Importar el servicio

interface UserData {
  email: string;
  profileImageUrl?: string;
}

interface LogData {
  type: string; // 'entrada' o 'salida'
  location: string; // 'sede' o 'clase'
  timestamp: Date;
  timeSpent?: string; // Tiempo total, opcional
}

@Component({
  selector: 'app-inicio',
  templateUrl: './inicio.page.html',
  styleUrls: ['./inicio.page.scss'],
})
export class InicioPage implements OnInit {
  userEmail: string = '';
  userProfileImageUrl: string = 'assets/profile-placeholder.png'; // Placeholder inicial
  timer: any = null;
  timerDisplay: string = '00:00:00';
  totalSeconds: number = 0;
  showTimer: boolean = false;
  classTimer: any = null;
  classTimerDisplay: string = '00:00:00';
  classTotalSeconds: number = 0;
  previousClassTotalSeconds: number = 0; // Nuevo: Acumulado en clases anteriores
  showClassTimer: boolean = false;
  isTracking: boolean = false;
  positionSubscription: any = null;
  isHistorialModalOpen: boolean = false; // Controla la apertura del historial
  logs: LogData[] = []; // Arreglo para almacenar los logs de entradas y salidas
  userId: string | null = null; // Guardar el UID del usuario
  virtualCard: any;

  constructor(
    private alertController: AlertController,
    private navController: NavController,
    private afAuth: AngularFireAuth,
    private firestore: AngularFirestore
  ) {}

  ngOnInit() {
    this.getVirtualCard();
  }
    async getVirtualCard() {
      const user = await this.afAuth.currentUser;
      if (user) {
        const cardDoc = await this.firestore.collection('virtualCards').doc(user.uid).get().toPromise();
        this.virtualCard = cardDoc?.data(); // Guardar los datos de la tarjeta en la variable virtualCard
      }
      
    // Verificar si el usuario está autenticado y obtener sus datos
    this.afAuth.authState.subscribe((user) => {
      if (user) {
        this.userId = user.uid; // Guardar el UID del usuario autenticado
        this.loadUserData(user.uid);
      } else {
        this.navController.navigateRoot('/login'); // Redirige al login si no hay usuario autenticado
      }
  
    });
    
  }

  // Cargar los datos del usuario desde Firestore
  private async loadUserData(uid: string) {
    try {
      const userDoc = await this.firestore.collection('users').doc(uid).get().toPromise();
      if (userDoc?.exists) {
        const userData = userDoc.data() as UserData;
        this.userEmail = userData.email || 'usuario@ejemplo.com'; // Usar email o un valor por defecto
        this.userProfileImageUrl = userData.profileImageUrl || 'assets/profile-placeholder.png'; // Imagen por defecto si no existe
      } else {
        console.error('No se encontraron datos del usuario en Firestore');
      }
    } catch (error) {
      console.error('Error al obtener los datos del usuario:', error);
    }
  }

  // Función para iniciar el temporizador al ingresar a clases

  entradaClases() {
    console.log('Entrada a clases');

    // Limpiar logs anteriores para evitar acumulación del tiempo
    this.logs = [];
    const log = { type: 'entrada', location: 'clase', timestamp: new Date() };
    this.logs.push(log);
    
    // Guardar en Firestore
    this.saveLogToFirestore(log);

    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
      this.showClassTimer = false;
    }

    // Reiniciar el cronómetro para una nueva sesión
    this.classTotalSeconds = 0;
    this.showClassTimer = true;

    this.timer = setInterval(() => {
      this.classTotalSeconds++;
      this.updateClassDisplay();
    }, 1000);
  }

  // Función para detener el temporizador y guardar el tiempo al salir de clases
  salidaClases() {
    console.log('Salida de clases');
    const lastEntradaLog = this.logs.find(log => log.type === 'entrada' && log.location === 'clase');
    
    if (lastEntradaLog) {
      const entradaTime = new Date(lastEntradaLog.timestamp).getTime();
      const salidaTime = new Date().getTime();
      const timeDifference = salidaTime - entradaTime; // Diferencia en milisegundos
  
      const hours = Math.floor(timeDifference / (1000 * 60 * 60));
      const minutes = Math.floor((timeDifference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((timeDifference % (1000 * 60)) / 1000);
  
      const timeSpent = `${this.pad(hours, 2)}:${this.pad(minutes, 2)}:${this.pad(seconds, 2)}`;
  
      // Guardar la salida con el tiempo total
      const log: LogData = { 
        type: 'salida', 
        location: 'clase', 
        timestamp: new Date(), 
        timeSpent // Guardar el tiempo calculado
      };
  
      this.logs.push(log);
      this.saveLogToFirestore(log);
      
      // Pausar el temporizador
      if (this.timer) {
        clearInterval(this.timer); // Pausar el conteo del tiempo
        this.timer = null; // Reiniciar el temporizador
        this.showClassTimer = false; // Ocultar el temporizador en la interfaz
      }

      this.presentAlert(timeSpent, 'clases');
    } else {
      console.error('No se encontró una entrada previa a clases');
    }
  }

  // Actualizar la pantalla del temporizador
  updateClassDisplay() {
    const hours = Math.floor(this.classTotalSeconds / 3600);
    const minutes = Math.floor((this.classTotalSeconds % 3600) / 60);
    const seconds = this.classTotalSeconds % 60;

    this.classTimerDisplay = 
      this.pad(hours, 2) + ':' + 
      this.pad(minutes, 2) + ':' + 
      this.pad(seconds, 2);
  }

  // Función para agregar ceros a la izquierda en el formato de tiempo
  pad(num: number, size: number): string {
    let s = num + '';
    while (s.length < size) s = '0' + s;
    return s;
  }

  // Guardar logs en Firestore
  saveLogToFirestore(log: LogData) {
    if (this.userId) {
      this.firestore.collection('users').doc(this.userId).collection('logs').add(log)
        .then(() => {
          console.log('Log guardado en Firestore');
        })
        .catch((error) => {
          console.error('Error al guardar el log en Firestore:', error);
        });
    } else {
      console.error('Usuario no autenticado.');
    }
  }

  // Obtener logs desde Firestore
  getLogsFromFirestore() {
    if (this.userId) {
      this.firestore
        .collection('users')
        .doc(this.userId)
        .collection('logs', ref => ref.orderBy('timestamp', 'desc'))
        .snapshotChanges()
        .subscribe(
          (querySnapshot) => {
            this.logs = [];
            querySnapshot.forEach((snapshot) => {
              const logData = snapshot.payload.doc.data() as LogData;
              logData.timestamp = (logData.timestamp as any).toDate(); // Convertir Firestore timestamp a Date
              this.logs.push(logData);
            });
          },
          (error) => {
            console.error('Error al obtener los logs de Firestore:', error);
          }
        );
    } else {
      console.error('Usuario no autenticado.');
    }
  }

  // Abrir el historial
  openHistorialModal() {
    this.isHistorialModalOpen = true;
  }

  // Cerrar el historial
  closeHistorialModal() {
    this.isHistorialModalOpen = false;
  }

  // Mostrar alerta con el tiempo trabajado
  async presentAlert(timeSpent: string, type: string) {
    const alert = await this.alertController.create({
      header: `Tiempo en la ${type}`,
      message: `Estuviste ${timeSpent} en la ${type}.`,
      buttons: ['OK']
    });

    await alert.present();
  }

  logout() {
    this.navController.navigateRoot('/login');
  }


  // Método para activar o desactivar el seguimiento de ubicación
  async toggleLocation() {
    if (this.isTracking) {
      this.stopTracking();
    } else {
      await this.startTracking();
    }
  }

  // Iniciar seguimiento de ubicación
  async startTracking() {
    try {
      const position = await Geolocation.getCurrentPosition();
      console.log('Posición actual:', position);

      // Monitorea la ubicación en tiempo real
      this.positionSubscription = Geolocation.watchPosition({}, (position: Position | null, err) => {
        if (position) {
          console.log(`Ubicación actualizada: ${position.coords.latitude}, ${position.coords.longitude}`);
        }
      });
      this.isTracking = true;
    } catch (error) {
      console.error('Error al obtener la ubicación:', error);
    }
  }

  // Detener seguimiento de ubicación
  stopTracking() {
    if (this.positionSubscription) {
      Geolocation.clearWatch({ id: this.positionSubscription });
      this.positionSubscription = null;
      this.isTracking = false;
      console.log('Seguimiento de ubicación desactivado');
    }
  }
}
