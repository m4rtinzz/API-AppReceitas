import { useState, useEffect } from 'react'
import './App.css'
import logo from './assets/icon-receitas.png';

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
  ingredients: string[];
  instructions: string[];
}

interface RecipeCardProps {
  recipe: Recipe;
  onCardClick: (recipe: Recipe) => void;
}

function RecipeCard({ recipe, onCardClick }: RecipeCardProps) {
  return (
    <div className="recipe-card" onClick={() => onCardClick(recipe)}>
      <span className={`recipe-difficulty-badge difficulty-${recipe.difficulty.toLowerCase()}`}>{recipe.difficulty}</span>
      <img src={recipe.image} alt={recipe.name} className="recipe-image" />
      <div className="recipe-content">
        <span className="recipe-type">{recipe.mealType.join(', ')}</span>
        <h3 className="recipe-name">{recipe.name}</h3>
        <div className="recipe-details">
          <span><strong>Preparo:</strong> {recipe.prepTimeMinutes} min</span>
          <span><strong>Cozimento:</strong> {recipe.cookTimeMinutes} min</span>
          <span><strong>Porções:</strong> {recipe.servings}</span>
          <span><strong>Kcal/porção:</strong> {recipe.caloriesPerServing}</span>
        </div>
        <div className="recipe-footer">
          <span> {recipe.rating.toFixed(1)} ⭐</span>
        </div>
      </div>
    </div>
  );
}

interface RecipeDetailProps {
  recipe: Recipe;
  onClose: () => void;
}

function RecipeDetail({ recipe, onClose }: RecipeDetailProps) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close-button" onClick={onClose}>&times;</button>
        <img src={recipe.image} alt={recipe.name} className="modal-image" />
        <h2>{recipe.name}</h2>
        <div className="modal-details-grid">
          <span><strong>Dificuldade:</strong> {recipe.difficulty}</span>
          <span><strong>Preparo:</strong> {recipe.prepTimeMinutes} min</span>
          <span><strong>Cozimento:</strong> {recipe.cookTimeMinutes} min</span>
          <span><strong>Nota:</strong> {recipe.rating.toFixed(1)} ⭐</span>
        </div>
        <div className="modal-section">
          <h3>Ingredientes</h3>
          <ul>
            {recipe.ingredients.map((ingredient, index) => (
              <li key={index}>{ingredient}</li>
            ))}
          </ul>
        </div>
        <div className="modal-section">
          <h3>Instruções</h3>
          <ol>
            {recipe.instructions.map((instruction, index) => (
              <li key={index}>{instruction}</li>
            ))}
          </ol>
        </div>
      </div>
    </div>
  );
}

function App() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("name");
  const [sortOrder, setSortOrder] = useState("asc");
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);

  const RECIPES_PER_PAGE = 6;

  useEffect(() => {
    const fetchRecipes = async () => {
      try {
        setError(null);
        setLoading(false);

        const skip = (currentPage - 1) * RECIPES_PER_PAGE;
        let url = "";

        // A API usa um endpoint diferente para busca
        if (searchQuery) {
          url = `https://dummyjson.com/recipes/search?q=${searchQuery}&limit=${RECIPES_PER_PAGE}&skip=${skip}&sortBy=${sortBy}&order=${sortOrder}`;
        } else {
          url = `https://dummyjson.com/recipes?limit=${RECIPES_PER_PAGE}&skip=${skip}&sortBy=${sortBy}&order=${sortOrder}`;
        }

        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setRecipes(data.recipes);
        setTotalPages(Math.ceil(data.total / RECIPES_PER_PAGE));

      } catch (e) {
        if (e instanceof Error) {
          setError(e.message);
        } else {
          setError("Ocorreu um erro desconhecido");
        }
        setRecipes([]); // Limpa receitas em caso de erro
        setTotalPages(0);
      } finally {
        setLoading(false);
      }
    };

    fetchRecipes();
  }, [currentPage, searchQuery, sortBy, sortOrder]); // Roda o efeito quando qualquer um destes estados mudar

  // Reseta a página para 1 quando uma nova busca é feita
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  if (loading) return <div className="status-message">Carregando receitas...</div>;
  if (error) return <div className="status-message error">Erro: {error}</div>;

  return (
    <div className="app-container">
      <img src={logo} alt="Logo Receitas Yummy" className="app-logo" title="Receitas Yummy"/>
      <h1 className="app-title">Receitas Yummy</h1>

      <div className="controls-container">
        <input
          type="text"
          placeholder="Buscar por nome da receita..."
          value={searchQuery}
          onChange={handleSearchChange}
          className="search-input"
        />
        <div className="sort-controls">
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
            <option value="name">Nome</option>
            <option value="rating">Nota</option>
            <option value="difficulty">Dificuldade</option>
          </select>
          <select value={sortOrder} onChange={(e) => setSortOrder(e.target.value)}>
            <option value="asc">Ascendente</option>
            <option value="desc">Descendente</option>
          </select>
        </div>
      </div>

      <div className="recipes-grid">
        {recipes.length > 0 ? recipes.map((recipe) => (
          <RecipeCard key={recipe.id} recipe={recipe} onCardClick={setSelectedRecipe} />
        )) : <p className="status-message">Nenhuma receita encontrada.</p>}
      </div>

      {totalPages > 1 && (
        <div className="pagination">
          <button onClick={() => setCurrentPage(p => Math.max(p - 1, 1))} disabled={currentPage === 1}>Anterior</button>
          <span>Página {currentPage} de {totalPages}</span>
          <button onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))} disabled={currentPage === totalPages}>Próxima</button>
        </div>
      )}

      {selectedRecipe && (
        <RecipeDetail recipe={selectedRecipe} onClose={() => setSelectedRecipe(null)} />
      )}
    </div>
  )
}

export default App
