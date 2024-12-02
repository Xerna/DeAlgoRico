//src/app/models/user-profile.interface.ts
export interface UserProfile {
    id_usuario: string;
    edad: number;
    peso_actual: number;
    actividad_fisica: string;
    fecha_registro?: Date;
  }