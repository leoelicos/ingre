import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

const RecipeCard = ({ result }) => {
  return (
    <article className="recipe-card">
      <div className="card-header">
        <div className="header-left">
          <p className="recipe-title">{result.label}</p>
        </div>
        <div className="header-right">
          <button className="card-title-button">
            <FontAwesomeIcon icon="fa-solid fa-pen" />
          </button>
          <button className="card-title-button">
            <FontAwesomeIcon icon="fa-solid fa-floppy-disk" />
          </button>
        </div>
      </div>
      <div className="card-body">
        <img alt={result.label} src={result.image} className="card-image" />
      </div>
    </article>
  );
};

export default RecipeCard;
