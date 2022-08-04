import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

const RecipeCard = (props) => {
  if (!props?.result?.label) console.log('eror, props = ', props);

  return (
    <article className="recipe-card">
      <div className="card-header">
        <div className="header-left">
          <p className="recipe-title">{props.result.label}</p>
          {/* <p className="recipe-title">recipe.label</p> */}
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
        <img alt={props.result.label} src={props.result.image} className="card-image" />
      </div>
    </article>
  );
};

export default RecipeCard;
