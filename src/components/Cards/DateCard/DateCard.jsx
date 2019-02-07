import React from 'react';
import './DateCard.css';
import '../Card.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCalendarAlt } from '@fortawesome/free-solid-svg-icons';
import { PropTypes } from 'prop-types';

export default function DateCard({ date }) {
  return (
    <div className="card date-card">
      <div className="date-card__content">
        <div>
          <h4 className="date-card__heading">{date.format('dddd')}</h4>
          <h4 className="date-card__calendar"><FontAwesomeIcon icon={faCalendarAlt} /></h4>
          <h4 className="date-card__heading">{date.format('Do MMMM')}</h4>
        </div>
      </div>
    </div>
  );
}

DateCard.propTypes = {
  date: PropTypes.string.isRequired,
};
