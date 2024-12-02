//spoonacular.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SpoonacularService {
  private apiKey = 'b6d4e34cff7442c7855ea669a3fa185d';
  private baseUrl = 'https://api.spoonacular.com';

  constructor(private http: HttpClient) {}

  getIngredients(query: string): Observable<any> {
    const url = `${this.baseUrl}/food/ingredients/search`;
    return this.http.get(url, {
      params: {
        apiKey: this.apiKey,
        query: query,
        number: '10'
      }
    }).pipe(
      map((response: any) => {
        if (response && response.results) {
          return response.results.map((ingredient: any) => ({
            id: ingredient.id,
            name: ingredient.name,
            image: ingredient.image
          }));
        }
        return [];
      })
    );
  }

  getRecipesByIngredients(ingredients: string[]): Observable<any> {
    const url = `${this.baseUrl}/recipes/findByIngredients`;
    const ingredientsString = ingredients.join(',');
    
    return this.http.get(url, {
      params: {
        apiKey: this.apiKey,
        ingredients: ingredientsString,
        number: '5',
        ranking: '2', // Prioriza maximizar los ingredientes usados
        ignorePantry: 'true' // Ignora ingredientes básicos de despensa
      }
    }).pipe(
      map((recipes: any) => {
        return recipes.map((recipe: any) => ({
          id: recipe.id,
          title: recipe.title,
          image: recipe.image,
          usedIngredients: recipe.usedIngredients,
          missedIngredients: recipe.missedIngredients,
          unusedIngredients: recipe.unusedIngredients
        }));
      })
    );
  }

}