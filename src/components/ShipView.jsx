import React, { Component } from 'react';
import '../App.css';
import $ from 'jquery';
import { ClipLoader } from 'react-spinners';
import DateCard from './DateCard';
import PageCard from './PageCard';
import ShipCard from './ShipCard';

export default class ShipView extends Component {
  static isBottom(el) {
    return el.getBoundingClientRect().bottom <= window.innerHeight + 10;
  }

  constructor(props) {
    super(props);
    this.state = {
      ships: [],
      shipCards: [],
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

  componentWillUnmount() {
    document.removeEventListener('scroll', this.trackScrolling.bind(this));
  }

  getShipData() {
    $.get(`https://api.allorigins.ml/get?url=${encodeURIComponent('https://nccports.portauthoritynsw.com.au/eports/Guest_Schedule_Main.asp?')}`,
      (response) => {
        const responseContents = response.contents;
        const domNodes = $($.parseHTML(responseContents));
        const tableHTML = domNodes.find('tbody').prop('outerHTML');
        this.setShips(tableHTML);
      });
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
          date: '',
          time: '',
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
              [ship.date, ship.time] = fieldValue.split(' ');
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

        ship.url = `https://s3-ap-southeast-2.amazonaws.com/shipwatch/${ship.IMO}${'.jpg'}`;

        shipsFromData.push(ship);
      }
    });

    this.setState({
      ships: shipsFromData,
    });
    this.setState({
      shipCards: this.getShipCards(),
      loading: false,
    });
    this.nextPage();
  }

  getShipCards() {
    const shipCards = [];
    let prevDate = '';
    let prevStatus = '';

    const { ships } = this.state;

    for (let i = 0; i < ships.length; i += 1) {
      const ship = ships[i];

      if (ship.date !== prevDate) {
        shipCards.push(<DateCard date={ship.date} />);
        prevDate = ship.date;
      }

      let current = false;
      if ((prevStatus === 'Departed' || prevStatus === 'Secured')
          && ship.status !== 'Departed' && ship.status !== 'Secured') {
        current = true;
      }
      prevStatus = ship.status;

      shipCards.push(<ShipCard ship={ship} current={current} />);
    }
    return shipCards;
  }

  trackScrolling() {
    const wrappedElement = document.getElementById('shipView');
    if (ShipView.isBottom(wrappedElement)) {
      this.nextPage();
    }
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

  render() {
    const { loading, shipCardsInView } = this.state;
    const content = (loading)
      ? (
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
            <PageCard nextPage={() => this.nextPage()} shipView={this} />
          </div>
        </div>
      );

    return (content);
  }
}
