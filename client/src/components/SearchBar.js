import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { useState } from 'react';

// We take our props object and assign each property to it's own variable name.
// In this case we only passed one prop, `onFormSubmit`
function SearchBar({ onFormSubmit }) {
  const [term, setTerm] = useState('French');

  const sendTerm = (e) => {
    e.preventDefault();

    onFormSubmit(term);
  };

  return (
    <>
      <div className="form-group">
        <form className="form" onSubmit={sendTerm}>
          <div className="field">
            <FontAwesomeIcon className="ingre-logo" icon="fa-solid fa-magnifying-glass" />

            <input type="text" value={term} onChange={(e) => setTerm(e.target.value)} placeholder="french" />
            <button className="btn" style={{ margin: '5px' }}>
              Search
            </button>
          </div>
        </form>
      </div>
    </>
  );
}

export default SearchBar;
