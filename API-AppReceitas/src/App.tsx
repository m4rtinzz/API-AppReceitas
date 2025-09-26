import { useState, useEffect } from 'react'
import './App.css'

interface Recipe {
  id: number;
  name: string;
  image: string;
  mealType: string[];
  prepTimeMinutes: number;
  cookTimeMinutes: number;
  servings: number;
  caloriesPerServing: number;
  rating: number;
  difficulty: string;
}

interface RecipeCardProps {
  recipe: Recipe;
}

function RecipeCard({ recipe }: RecipeCardProps) {
  return (
    <div className="recipe-card">
      <img src={recipe.image} alt={recipe.name} className="recipe-image" />
      <div className="recipe-content">
        <span className="recipe-type">{recipe.mealType.join(', ')}</span>
        <h3 className="recipe-name">{recipe.name}</h3>
        <div className="recipe-details">
          <p><strong>Preparo:</strong> {recipe.prepTimeMinutes} min</p>
          <p><strong>Cozimento:</strong> {recipe.cookTimeMinutes} min</p>
          <p><strong>Porções:</strong> {recipe.servings}</p>
          <p><strong>Kcal/porção:</strong> {recipe.caloriesPerServing}</p>
        </div>
        <div className="recipe-footer">
          <span><strong>Nota:</strong> {recipe.rating.toFixed(1)} ⭐</span>
          <span><strong>Dificuldade:</strong> {recipe.difficulty}</span>
        </div>
      </div>
    </div>
  );
}

// 3. Componente principal App
function App() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  const RECIPES_PER_PAGE = 6;

  useEffect(() => {
    const fetchRecipes = async () => {
      try {
        setLoading(true);
        // A API dummyjson não tem paginação nativa, então buscamos tudo e paginamos no cliente.
        // O parâmetro 'limit=0' busca todos os itens.
        const response = await fetch('https://dummyjson.com/recipes?limit=0');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setRecipes(data.recipes);
      } catch (e) {
        if (e instanceof Error) {
          setError(e.message);
        } else {
          setError("Ocorreu um erro desconhecido");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchRecipes();
  }, []); // Array vazio significa que o efeito roda apenas uma vez, no 'mount' do componente.

  // Lógica de Paginação
  const indexOfLastRecipe = currentPage * RECIPES_PER_PAGE;
  const indexOfFirstRecipe = indexOfLastRecipe - RECIPES_PER_PAGE;
  const currentRecipes = recipes.slice(indexOfFirstRecipe, indexOfLastRecipe);
  const totalPages = Math.ceil(recipes.length / RECIPES_PER_PAGE);

  if (loading) return <div className="status-message">Carregando receitas...</div>;
  if (error) return <div className="status-message error">Erro: {error}</div>;

  return (
    <div className="app-container">
      <h1>Receitas Yummy</h1>
      <div className="recipes-grid">
        {currentRecipes.map((recipe) => (
          <RecipeCard key={recipe.id} recipe={recipe} />
        ))}
      </div>
      <div className="pagination">
        <button onClick={() => setCurrentPage(p => Math.max(p - 1, 1))} disabled={currentPage === 1}>Anterior</button>
        <span>Página {currentPage} de {totalPages}</span>
        <button onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))} disabled={currentPage === totalPages}>Próxima</button>
      </div>
    </div>
  )
}

export default App
