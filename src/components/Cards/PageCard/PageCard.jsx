import './PageCard.css';
import '../Card.css';
import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEllipsisH } from '@fortawesome/free-solid-svg-icons';
import { PropTypes } from 'prop-types';

export default function PageCard({ nextPage }) {
  return (
    <div className="card page-card">
      <div className="page-card__content">
        <button className="page-card__button" type="button" onClick={() => nextPage()}>
          <div>
            <h4 className="page-card__heading">Load More</h4>
            <h4 className="page-card__ellipsis"><FontAwesomeIcon icon={faEllipsisH} /></h4>
          </div>
        </button>
      </div>
    </div>
  );
}

PageCard.propTypes = {
  nextPage: PropTypes.func.isRequired,
};
