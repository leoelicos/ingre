// Import React Router Link component for internal hyperlinks
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

const Header = () => {
  return (
    <header>
      <ul className="navbar">
        <div className="navbar-left">
          <li className="hamburger">
            <Link to="/">
              <FontAwesomeIcon icon="fa-solid fa-bars" style={{ marginRight: '0.3rem' }} />
            </Link>
          </li>
          <li className="navbar-item">
            <Link to="/">
              <FontAwesomeIcon className="ingre-logo" icon="fa-solid fa-egg" style={{ marginRight: '0.3rem' }} />
              <span className="ingre-logo-text">ingré</span>
            </Link>
          </li>
        </div>
        <div className="navbar-right">
          <li className="navbar-item">
            <Link to="/login">
              <span className="ingre-text">Login</span>
            </Link>
          </li>
          <li className="navbar-item">
            <FontAwesomeIcon className="ingre-logo" icon="fa-solid fa-circle-info" style={{ marginLeft: '1rem' }} />
          </li>
        </div>
      </ul>
    </header>
  );
};

export default Header;
