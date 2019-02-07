import React from 'react';
import PropTypes from 'prop-types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons';
import './BirthInformationPanel.css';

export default function BerthInformationPanel(props) {
  const {
    code,
    name,
    uses,
    onClose,
  } = props;
  const usesList = [];

  for (let i = 0; i < uses.length; i += 1) {
    usesList.push(<li className="berth-information-panel__li">{uses[i]}</li>);
  }

  return (
    <div className="berth-information-panel__text-content">
      <button
        type="button"
        onClick={() => onClose()}
        className="berth-information-panel__close-button"
      >
        <FontAwesomeIcon
          className="berth-information-panel__close-icon"
          icon={faTimes}
        />
      </button>
      <h4 className="berth-information-panel__berth-heading">Berth Information</h4>
      <hr className="berth-information-panel__hr" />
      <p className="berth-information-panel__text">{`${code} - ${name}`}</p>
      <h4 className="berth-information-panel__berth-heading">Used For:</h4>
      <ul className="berth-information-panel__ul">
        {usesList}
      </ul>
    </div>
  );
}

BerthInformationPanel.propTypes = {
  code: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  uses: PropTypes.arrayOf(PropTypes.string).isRequired,
  onClose: PropTypes.func.isRequired,
};
