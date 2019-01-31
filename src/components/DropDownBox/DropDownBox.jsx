import React from 'react';
import { PropTypes } from 'prop-types';
import './DropDownBox.css';

export default function DropDownBox({ items, onSelect }) {
  const itemDivs = [];

  for (let i = 0; i < items.length; i += 1) {
    itemDivs.push(
      <div className="drop-down-box__item">
        <div className="item__content">
          <button type="button" className="invisible-button" onClick={() => onSelect(items[i])}>
            <p className="item__p">
              {items[i]}
            </p>
          </button>
        </div>
      </div>,
    );
  }

  return (
    <div className="drop-down-box">
      {itemDivs}
    </div>
  );
}

DropDownBox.propTypes = {
  items: PropTypes.arrayOf(PropTypes.string).isRequired,
  onSelect: PropTypes.func.isRequired,
};
