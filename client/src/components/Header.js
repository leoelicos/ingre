import React from 'react';
// Import React Router Link component for internal hyperlinks
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { MenuFoldOutlined, MenuUnfoldOutlined } from '@ant-design/icons';

import { useStoreContext } from '../utils/GlobalState';
import { TOGGLE_COLLAPSED } from '../utils/actions';

const Header = () => {
  const [state, dispatch] = useStoreContext();
  const toggleCollapsed = () => {
    dispatch({ type: TOGGLE_COLLAPSED });
  };
  return (
    <header>
      <ul className="navbar">
        <div className="navbar-left">
          <li className="hamburger">
            <Link to="/">
              <div
                className="trigger"
                onClick={() => {
                  toggleCollapsed();
                }}
              >
                {state.collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              </div>
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
