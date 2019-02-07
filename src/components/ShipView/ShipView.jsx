import React, { Component } from 'react';
import './ShipView.css';
import $ from 'jquery';
import { ClipLoader } from 'react-spinners';
import * as moment from 'moment';
import PropTypes from 'prop-types';
import DateCard from '../Cards/DateCard/DateCard';
import PageCard from '../Cards/PageCard/PageCard';
import ShipCard from '../Cards/ShipCard/ShipCard';

export default class ShipView extends Component {
  static isBottom(el) {
    return el.getBoundingClientRect().bottom <= window.innerHeight + 10;
  }

  static filterShips(
    ships,
    sd = moment('01/01/2000', 'DD/MM/YYYY'),
    ed = moment('12/12/3000', 'DD/MM/YYYY'),
    mw = Number.NEGATIVE_INFINITY,
    maw = Number.POSITIVE_INFINITY,
  ) {
    const startDate = !sd ? moment('01/01/2000', 'DD/MM/YYYY') : sd;
    const endDate = !ed ? moment('01/01/3000', 'DD/MM/YYYY') : ed;
    const minWeight = !mw ? Number.NEGATIVE_INFINITY : mw;
    const maxWeight = !maw ? Number.POSITIVE_INFINITY : maw;

    const filteredShips = [];
    for (let i = 0; i < ships.length; i += 1) {
      if (
        ships[i].GRT >= minWeight
        && ships[i].GRT <= maxWeight
        && ships[i].dateTime.isSameOrAfter(startDate, 'day')
        && ships[i].dateTime.isSameOrBefore(endDate, 'day')
      ) {
        filteredShips.push(ships[i]);
      }
    }
    return filteredShips;
  }

  static getShipCards(ships) {
    const shipCards = [];
    let prevDate = moment('01/01/2000', 'DD/MM/YYYY');
    let prevStatus = '';

    for (let i = 0; i < ships.length; i += 1) {
      const ship = ships[i];

      if (ship.dateTime.isAfter(prevDate, 'day')) {
        shipCards.push(<DateCard date={ship.dateTime} />);
        prevDate = ship.dateTime;
      }

      let current = false;
      if (
        (prevStatus === 'Departed' || prevStatus === 'Secured')
        && ship.status !== 'Departed'
        && ship.status !== 'Secured'
      ) {
        current = true;
      }
      prevStatus = ship.status;

      shipCards.push(<ShipCard ship={ship} current={current} />);
    }
    return shipCards;
  }

  constructor(props) {
    super(props);
    this.state = {
      ships: [],
      loadedShipCards: [],
      displayedShips: [],
      shipCardsInView: [],
      page: 0,
      loading: true,
    };
    this.getShipData();
    this.nextPage.bind(this);
  }

  componentDidMount() {
    document.addEventListener('scroll', this.trackScrolling.bind(this));
  }

  componentWillReceiveProps(nextProps) {
    const { ships } = this.state;
    const { filter } = nextProps;
    const {
      startDate,
      endDate,
      minWeight,
      maxWeight,
    } = filter;

    console.log(filter);
    const startDateMoment = startDate ? moment(startDate, 'DD/MM/YYYY') : null;
    const endDateMoment = endDate ? moment(endDate, 'DD/MM/YYYY') : null;

    this.onFilter(ships, startDateMoment, endDateMoment, minWeight, maxWeight);
  }

  componentWillUnmount() {
    document.removeEventListener('scroll', this.trackScrolling.bind(this));
  }

  onFilter(
    ships,
    startDate = moment('01/01/2000', 'DD/MM/YYYY'),
    endDate = moment('12/12/3000', 'DD/MM/YYYY'),
    minWeight = Number.NEGATIVE_INFINITY,
    maxWeight = Number.POSITIVE_INFINITY,
  ) {
    const displayedShips = ShipView.filterShips(ships, startDate, endDate, minWeight, maxWeight);
    const filteredShipCards = ShipView.getShipCards(displayedShips);
    this.setState({
      displayedShips,
      shipCards: filteredShipCards,
    }, () => {
      this.resetPage();
    });
  }

  getShipData() {
    $.get(
      'https://cors-anywhere.herokuapp.com/https://nccports.portauthoritynsw.com.au/eports/Guest_Schedule_Main.asp',
      (response) => {
        // const responseContents = response.contents;
        const domNodes = $($.parseHTML(response));
        const tableHTML = domNodes.find('table').prop('outerHTML');
        this.setShips(tableHTML);
      },
    );
  }

  setShips(data) {
    const shipsFromData = [];

    const domNodes = $($.parseHTML(data));
    domNodes.find('tr').each((index, element) => {
      const fields = $(element).find('td');
      if (fields.length !== 0) {
        const ship = {
          name: '',
          IMO: '',
          status: '',
          dateTime: moment(),
          from: '',
          to: '',
          GRT: '',
          url: '',
        };

        const valuesArray = [];
        for (let i = 0; i < fields.length; i += 1) {
          const fieldValue = fields[
            i
          ].childNodes[1].childNodes[1].innerText.trim();
          if (i !== 0 && i !== 7 && i !== 8 && i <= 9) {
            valuesArray.push(fieldValue);
          }
        }

        for (let i = 0; i < valuesArray.length; i += 1) {
          const fieldValue = valuesArray[i];
          switch (i) {
            case 0:
              ship.name = fieldValue;
              break;
            case 1:
              ship.IMO = fieldValue;
              break;
            case 2:
              ship.status = fieldValue;
              break;
            case 3:
              ship.dateTime = moment(fieldValue.trim(), 'DD/MM/YYYY hh:mm');
              break;
            case 4:
              ship.from = fieldValue;
              break;
            case 5:
              ship.to = fieldValue;
              break;
            case 6:
              ship.GRT = Number.parseInt(fieldValue, 10);
              break;
            default:
          }
        }

        ship.url = `https://s3-ap-southeast-2.amazonaws.com/shipwatch/${
          ship.IMO
        }${'.jpg'}`;

        shipsFromData.push(ship);
      }
    });

    this.setState({
      ships: shipsFromData,
      displayedShips: shipsFromData,
    });
    this.setState({
      shipCards: ShipView.getShipCards(shipsFromData),
      loading: false,
    }, () => this.nextPage());
  }

  trackScrolling() {
    const wrappedElement = document.getElementById('shipView');
    if (ShipView.isBottom(wrappedElement)) {
      this.nextPage();
    }
  }

  resetPage() {
    this.setState({
      shipCardsInView: [],
      page: 0,
    }, () => {
      this.nextPage();
    });
  }

  nextPage() {
    let { page } = this.state;
    const { shipCards, shipCardsInView } = this.state;
    const startIndex = page * 10;
    page += 1;
    let endIndex = page * 10;

    if (startIndex < shipCards.length) {
      if (!(endIndex <= shipCards.length)) {
        endIndex = shipCards.length;
      }

      const nextPageCards = shipCards.slice(startIndex, endIndex);
      shipCardsInView.push([...(shipCardsInView, nextPageCards)]);
      this.setState({
        page,
        shipCardsInView: [...shipCardsInView],
      });
    }
  }

  hasNextPage() {
    const { page, shipCards } = this.state;
    return ((page * 10) < shipCards.length);
  }

  render() {
    const { loading, shipCardsInView } = this.state;
    let pageCard = null;
    if (!loading) {
      pageCard = this.hasNextPage()
        ? <PageCard nextPage={() => this.nextPage()} shipView={this} />
        : null;
    }
    const content = loading ? (
      <div className="card-view card-view--loading" id="shipView">
        <div className="card-view__loading-spinner">
          <ClipLoader
            sizeUnit="px"
            size={150}
            color="#ffffff"
            loading={loading}
          />
        </div>
      </div>
    ) : (
      <div>
        <div className="card-view" id="shipView">
          {shipCardsInView}
          {pageCard}
        </div>
      </div>
    );

    return content;
  }
}

ShipView.propTypes = {
  filter: PropTypes.object.isRequired,
};
