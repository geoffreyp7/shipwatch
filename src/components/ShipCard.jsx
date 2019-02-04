import React from 'react';
import '../App.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCalendarAlt,
  faClock,
  faArrowRight,
  faWeightHanging,
  faShip,
  faFlag,
} from '@fortawesome/free-solid-svg-icons';
import PropTypes from 'prop-types';

export default function ShipCard({ ship, current }) {
  const shipHeading = current ? (
    <h4 className="ship-card__heading ship-card__heading--current">
      <FontAwesomeIcon icon={faFlag} />
      {' '}
      {ship.name}
    </h4>
  ) : (
    <h4 className="ship-card__heading">{ship.name}</h4>
  );

  return (
    <div className="card ship-card">
      <div className="ship-card__content">
        {shipHeading}
        <hr className="ship-card__hr" />
        <p className="ship-card__text ship-card__text--left">
          <FontAwesomeIcon icon={faCalendarAlt} />
          {' '}
          {ship.dateTime.format('ddd Do MMM')}
        </p>
        <p className="ship-card__text ship-card__text--right">
          <FontAwesomeIcon icon={faClock} />
          {' '}
          {ship.dateTime.format('h:mmA')}
        </p>
        <div>
          <img
            className="ship-card__img"
            src={ship.url}
            alt="ship"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = '404.png';
            }}
          />
        </div>
        <p className="ship-card__text">
          {ship.from}
          {' '}
          <FontAwesomeIcon icon={faArrowRight} />
          {' '}
          {ship.to}
        </p>
        <p className="ship-card__text ship-card__text--left">
          <FontAwesomeIcon icon={faShip} />
          {' '}
          {ship.status}
        </p>
        <p className="ship-card__text ship-card__text--right">
          <FontAwesomeIcon icon={faWeightHanging} />
          {' '}
          {ship.GRT.toLocaleString()}
          {' Tons'}
        </p>
      </div>
    </div>
  );
}

ShipCard.propTypes = {
  current: PropTypes.bool.isRequired,
  ship: PropTypes.isRequired,
};
