// src/app/services/nutrition.service.ts
import { Injectable } from '@angular/core';
import { UserProfile } from '../models/user-profile.interface';

@Injectable({
  providedIn: 'root'
})
export class NutritionService {
  calcularCaloriasMantenimiento(profile: UserProfile): number {
    // Fórmula Harris-Benedict
    let tmb = 0;
    
    if (profile.sexo === 'masculino') {
      tmb = 66.473 + (13.7516 * profile.peso_actual) + (5.0033 * profile.altura) - (6.755 * profile.edad);
    } else {
      tmb = 655.0955 + (9.5634 * profile.peso_actual) + (1.8496 * profile.altura) - (4.6756 * profile.edad);
    }

    // Factor de actividad
    const factores = {
      sedentario: 1.2,
      ligero: 1.375,
      moderado: 1.55,
      intenso: 1.725
    };

    return Math.round(tmb * factores[profile.actividad_fisica]);
  }

  calcularCaloriasObjetivo(profile: UserProfile): number {
    const caloriasMantenimiento = this.calcularCaloriasMantenimiento(profile);
    
    switch(profile.objetivo) {
      case 'bajar':
        return caloriasMantenimiento - 500;
      case 'subir':
        return caloriasMantenimiento + 500;
      default:
        return caloriasMantenimiento;
    }
  }

  getConsejos(profile: UserProfile): string[] {
    const consejos: string[] = [];
    const calorias = this.calcularCaloriasObjetivo(profile);

    // Consejos básicos según objetivo
    consejos.push(`Tu requerimiento calórico diario es de ${calorias} calorías.`);

    if (profile.objetivo === 'bajar') {
      consejos.push('Prioriza alimentos con alto contenido de proteína para preservar masa muscular.');
      consejos.push('Incluye fibra en cada comida para mayor saciedad.');
    } else if (profile.objetivo === 'subir') {
      consejos.push('Aumenta el consumo de proteínas y carbohidratos complejos.');
      consejos.push('Considera comer con más frecuencia, 5-6 comidas al día.');
    }

    // Consejos según nivel de actividad
    if (profile.actividad_fisica === 'intenso') {
      consejos.push('Asegúrate de consumir proteínas post-entrenamiento.');
      consejos.push('Mantén una buena hidratación, especialmente durante el ejercicio.');
    }

    // Consejos específicos según condiciones de salud
    if (profile.enfermedades.includes('diabetes')) {
      consejos.push('Evita azúcares simples y controla el índice glucémico de los alimentos.');
      consejos.push('Distribuye los carbohidratos a lo largo del día.');
    }

    if (profile.enfermedades.includes('hipertension')) {
      consejos.push('Reduce el consumo de sodio a menos de 2000mg por día.');
      consejos.push('Aumenta el consumo de potasio con verduras y frutas.');
    }

    if (profile.enfermedades.includes('higado_graso')) {
      consejos.push('Evita grasas saturadas y alimentos procesados.');
      consejos.push('Aumenta el consumo de alimentos ricos en omega-3.');
    }

    return consejos;
  }
}