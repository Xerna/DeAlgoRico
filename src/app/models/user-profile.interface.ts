//src/app/models/user-profile.interface.ts
export interface UserProfile {
  id_usuario: string;
  edad: number;
  peso_actual: number;
  altura: number; // en cm
  sexo: 'masculino' | 'femenino';
  actividad_fisica: 'sedentario' | 'ligero' | 'moderado' | 'intenso';
  enfermedades: string[]; // Array de enfermedades
  objetivo: 'bajar' | 'subir' | 'mantener';
  fecha_registro: Date;
}