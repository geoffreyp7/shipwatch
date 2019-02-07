import React, { Component } from 'react';
import './ShipCard.css';
import '../Card.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCalendarAlt,
  faClock,
  faArrowRight,
  faWeightHanging,
  faShip,
  faFlag,
  faInfoCircle,
} from '@fortawesome/free-solid-svg-icons';
import PropTypes from 'prop-types';
import BirthInformationPanel from '../../BerthInformationPanel/BerthInformationPanel';
import Berths from './Berths';

export default class ShipCard extends Component {
  constructor(props) {
    super(props);
    this.state = {
      activeBerthInfo: null,
    };
  }

  berthInformationClose() {
    this.setState({
      activeBerthInfo: null,
    });
  }

  render() {
    const { ship, current } = this.props;
    const shipHeading = current ? (
      <h4 className="ship-card__heading ship-card__heading--current">
        <FontAwesomeIcon icon={faFlag} />
        {' '}
        {ship.name}
      </h4>
    ) : (
      <h4 className="ship-card__heading">{ship.name}</h4>
    );

    const toInfo = Berths.berths.find(x => x.code === ship.to);
    const fromInfo = Berths.berths.find(x => x.code === ship.from);

    let toInfoButton = null;
    let fromInfoButton = null;
    if (toInfo) {
      toInfoButton = (
        <button
          type="button"
          className="ship-card__berth-info-button"
          onClick={() => {
            this.setState({
              activeBerthInfo: toInfo,
            });
          }}
        >
          <FontAwesomeIcon className="ship-card__berth-info-icon" icon={faInfoCircle} />
        </button>
      );
    }
    if (fromInfo) {
      fromInfoButton = (
        <button
          type="button"
          className="ship-card__berth-info-button"
          onClick={() => {
            this.setState({
              activeBerthInfo: fromInfo,
            });
          }}
        >
          <FontAwesomeIcon className="ship-card__berth-info-icon" icon={faInfoCircle} />
        </button>
      );
    }

    let berthInformationPanel = null;
    const { activeBerthInfo } = this.state;
    let berthInformationHiddenClass = 'ship-card__berth-information--hidden';
    let shipInformationBlurClass = '';
    if (activeBerthInfo) {
      const { code, name, uses } = activeBerthInfo;
      berthInformationPanel = (
        <BirthInformationPanel
          code={code}
          name={name}
          uses={uses}
          onClose={() => this.berthInformationClose()}
        />
      );
      berthInformationHiddenClass = '';
      shipInformationBlurClass = 'ship-card__ship-information--blur';
    }

    return (

      <div className="card ship-card">
        <div className="ship-card__content">
          <div className={`ship-card__berth-information ${berthInformationHiddenClass}`}>
            {berthInformationPanel}
          </div>
          <div className={`ship-card__ship-information ${shipInformationBlurClass}`}>
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
              {fromInfoButton}
              {' '}
              {ship.from}
              {' '}
              <FontAwesomeIcon icon={faArrowRight} />
              {' '}
              {ship.to}
              {' '}
              {toInfoButton}
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
      </div>
    );
  }
}

ShipCard.propTypes = {
  current: PropTypes.bool.isRequired,
  ship: PropTypes.isRequired,
};
