import React, { Component } from "react";
import "./App.css";
import $ from "jquery";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCalendarAlt, faClock, faArrowRight, faWeightHanging, faShip, faEllipsisH, faFlag } from "@fortawesome/free-solid-svg-icons";
import { css, jsx } from '@emotion/core';
import { ClipLoader } from 'react-spinners';

class App extends Component {

  render() {
    return (
      <div className="App">
        <div>
          <ShipView />
        </div>
      </div>
    );
  }
}

export default App;

class ShipView extends Component {
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
  }

  isBottom(el) {
    return el.getBoundingClientRect().bottom <= window.innerHeight+10;
  }
  
  componentDidMount() {
    document.addEventListener('scroll', this.trackScrolling);
  }
  
  componentWillUnmount() {
    document.removeEventListener('scroll', this.trackScrolling);
  }
  
  trackScrolling = () => {
    const wrappedElement = document.getElementById('shipView');
    if (this.isBottom(wrappedElement)) {
      console.log('view bottom reached');
      this.nextPage();
    }
  };

  getShipData() {
    $.get(
      "https://api.allorigins.ml/get?url=" +
        encodeURIComponent(
          "https://nccports.portauthoritynsw.com.au/eports/Guest_Schedule_Main.asp?"
        ),
      response => {
        let responseContents = response.contents;
        let dom_nodes = $($.parseHTML(responseContents));
        let tableHTML = dom_nodes.find("tbody").prop("outerHTML");
        this.setShips(tableHTML);
      }
    );
  }

  setShips(data) {
    let shipsFromData = [];

    let dom_nodes = $($.parseHTML(data));
    dom_nodes.find("tr").each((index, element) => {
      let fields = $(element).find("td");
      if (fields.length !== 0) {
        let ship = {
          name: "",
          IMO: "",
          status: "",
          date: "",
          time: "",
          from: "",
          to: "",
          GRT: "",
          url: ""
        };

        let valuesArray = [];
        for (let i = 0; i < fields.length; i++) {
          let fieldValue = fields[
            i
          ].childNodes[1].childNodes[1].innerText.trim();
          if (i !== 0 && i !== 7 && i !== 8 && i <= 9) {
            valuesArray.push(fieldValue);
          }
        }

        // ship = Object.assign(ship, valuesArray);

        for (let i = 0; i < valuesArray.length; i++) {
          let fieldValue = valuesArray[i];
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
              ship.date = fieldValue.split(" ")[0];
              ship.time = fieldValue.split(" ")[1];
              break;
            case 4:
              ship.from = fieldValue;
              break;
            case 5:
              ship.to = fieldValue;
              break;
            case 6:
              ship.GRT = Number.parseInt(fieldValue);
              break;
            default:
          }
        }

        ship.url = 'https://s3-ap-southeast-2.amazonaws.com/shipwatch/' + ship.IMO + '.jpg';

        shipsFromData.push(ship);
      }
    });

    console.log(shipsFromData);
    this.setState({
      ships: shipsFromData,
    });
    this.setState({
      shipCards: this.getShipCards(),
      loading: false,
    })
    this.nextPage();
  }

  getShipCards() {
    let shipCards = [];
    let prevDate = "";
    let prevStatus = '';
    for (let ship of this.state.ships) {
      if (ship.date !== prevDate) {
        shipCards.push(<DateCard date={ship.date}></DateCard>);
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
    console.log(shipCards);
    return shipCards;
  }

  nextPage() {
 
    let page = this.state.page;
    let startIndex = page * 10;
    page++;
    let endIndex = page * 10;
    console.log('Getting next page. (start: ' + startIndex + ', end: ' + endIndex + ', page: ' + page + ', card length: ' + this.state.shipCards.length);
    
    if (startIndex < this.state.shipCards.length) {

      if (!(endIndex <= this.state.shipCards.length)) {
        endIndex = this.state.shipCards.length;
      }

      let nextPageCards = this.state.shipCards.slice(startIndex, endIndex);
      console.log('setting state. next page: ' + nextPageCards);
      this.state.shipCardsInView.push.apply(this.state.shipCardsInView, nextPageCards);
      this.setState({
        page: page,
        shipCardsInView: [...this.state.shipCardsInView],
      });

    }

  }

  render() {

    let content = 
    (this.state.loading) ? 
    (
      <div className="card-view card-view--loading" id="shipView">
        <div className="card-view__loading-spinner">
          <ClipLoader
            sizeUnit={"px"}
            size={150}
            color={'#ffffff'}
            loading={this.state.loading}
          />
        </div>
      </div>
    )
    :
    (
      <div>
        <div className="search-bar">
          <div className="search-bar__content">
            <div className="search-bar__title-bar">
             <img className="search-bar__title" src="data:image/jpeg;base64,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"></img>
            </div>
            <form className="search-bar__form">
              <div className="search-bar__controls">
                <input className="search-bar__control" placeholder="Start Date" type="text"></input>
                <div className="search-bar__vr"></div>
                <input className="search-bar__control" placeholder="End Date" type="text"></input>
                <div className="search-bar__vr"></div>
                <input className="search-bar__control" placeholder="Min Weight" type="text"></input>
                <div className="search-bar__vr"></div>
                <input className="search-bar__control" placeholder="Max Weight" type="text"></input>
              </div>
            </form>
          </div>
        </div>
        <div className="card-view" id="shipView">
          {this.state.shipCardsInView}
          <PageCard nextPage={this.nextPage} shipView={this}></PageCard>
        </div>
      </div>
    )

    return (content);
  }
}

class ShipCard extends Component {

  render() {

    const fontAwesomeFlag = <FontAwesomeIcon icon={faFlag}></FontAwesomeIcon>;

    let shipHeading = 
      (this.props.current) ?
      <h4 className="ship-card__heading ship-card__heading--current"><FontAwesomeIcon icon={faFlag}/> {this.props.ship.name}</h4>
      :
      <h4 className="ship-card__heading">{this.props.ship.name}</h4>;

    return (
      <div className="card ship-card">
        <div className="ship-card__content">
          {shipHeading}
          <hr className="ship-card__hr" />
          <p className="ship-card__text ship-card__text--left">
            <FontAwesomeIcon icon={faCalendarAlt} /> {this.props.ship.date}
          </p>
          <p className="ship-card__text ship-card__text--right">
            <FontAwesomeIcon icon={faClock} /> {this.props.ship.time}
          </p>
          <div>
            <img className="ship-card__img" src={this.props.ship.url} alt="ship"
              onError={(e)=>{e.target.onerror = null; e.target.src="404.png"}}/>
          </div>
          <p className="ship-card__text">
            {this.props.ship.from} <FontAwesomeIcon icon={faArrowRight}/> {this.props.ship.to}
            </p>
          <p className="ship-card__text ship-card__text--left">
            <FontAwesomeIcon icon={faShip}/> {this.props.ship.status}</p>
          <p className="ship-card__text ship-card__text--right">
            <FontAwesomeIcon icon={faWeightHanging}/> {this.props.ship.GRT.toLocaleString()} Tons</p>
        </div>
      </div>
    );
  }
}

class DateCard extends Component {
    
  render() {
    return (
      <div className="card date-card">
        <div className="date-card__content">
          <div>
            <h4 className="date-card__calendar"><FontAwesomeIcon icon={faCalendarAlt}/></h4>
            <h4 className="date-card__heading">{this.props.date}</h4>
          </div>
        </div>
      </div>
    );
  }
}

class PageCard extends Component {

  render() {
    return (
      <div className="card page-card">
        <div className="page-card__content" onClick={() => this.props.nextPage.apply(this.props.shipView)}>
          <div>
            <h4 className="page-card__heading">Load More</h4>
            <h4 className="page-card__ellipsis"><FontAwesomeIcon icon={faEllipsisH}></FontAwesomeIcon></h4>
          </div>
        </div>
      </div>
    );
  }
}
